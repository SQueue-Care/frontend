// src/store/bookingStore.ts
import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { BookingSchedule, DepartmentDoctor } from '../lib/types'

export type { BookingSchedule, DepartmentDoctor }

interface BookingResponse {
  id: string
  queueNumber?: string | number
  estimatedWaitMinutes?: number
  estimatedWaitTime?: number
}

interface BookingState {
  departmentDoctors: DepartmentDoctor[]
  doctorSchedules: BookingSchedule[]
  isLoadingDoctors: boolean
  isLoadingSchedules: boolean
  isSubmitting: boolean
  error: string | null

  fetchDoctorsByDepartment: (departmentId: string) => Promise<void>
  // Update: Sekarang menerima string DayOfWeek
  fetchSchedulesByDoctor: (doctorId: string, dayOfWeek: string) => Promise<void>

  // Fungsi baru untuk integrasi Smart Submit
  submitBooking: (payload: {
    departmentId: string
    doctorId: string
    scheduleId: string
    date: string
    notes: string // Tambahkan ini di interface
  }) => Promise<{
    id?: string
    queueNumber?: string
    estimatedWaitTime?: number
    isAppointment: boolean
  }>

  resetBookingState: () => void
}

export const useBookingStore = create<BookingState>((set, get) => ({
  departmentDoctors: [],
  doctorSchedules: [],
  isLoadingDoctors: false,
  isLoadingSchedules: false,
  isSubmitting: false,
  error: null,

  fetchDoctorsByDepartment: async (departmentId) => {
    set({ isLoadingDoctors: true, error: null, departmentDoctors: [] })
    try {
      const response = await apiClient.get(`/departments/${departmentId}`)
      set({ departmentDoctors: response.data.data.doctors || [], isLoadingDoctors: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat dokter.'),
        isLoadingDoctors: false,
      })
    }
  },

  fetchSchedulesByDoctor: async (doctorId, dayOfWeek) => {
    set({ isLoadingSchedules: true, error: null, doctorSchedules: [] })
    try {
      // Menggunakan endpoint /schedules dengan filter sesuai api.md
      const response = await apiClient.get(`/schedules?doctorId=${doctorId}&dayOfWeek=${dayOfWeek}`)
      set({ doctorSchedules: response.data.data || [], isLoadingSchedules: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat jadwal.'),
        isLoadingSchedules: false,
      })
    }
  },

  submitBooking: async (payload: {
    departmentId: string
    doctorId: string
    scheduleId: string
    date: string
    notes: string
  }) => {
    set({ isSubmitting: true, error: null })
    try {
      // 1. Ambil jam dari jadwal (Fallback ke 08:00 jika tidak ditemukan)
      const selectedSchedule = get().doctorSchedules.find((s) => s.id === payload.scheduleId)
      const startTime = selectedSchedule?.startTime || '08:00'
      const selectedDateOnly = payload.date.split('T')[0]

      // 2. KOREKSI MUTLAK WAKTU: Konversi ke UTC ISO-8601 murni agar tidak ditolak Database
      // Ini mengatasi bug waktu tertahan di 00:00:00
      const scheduledAtIso = new Date(`${selectedDateOnly}T${startTime}:00`).toISOString()

      // 3. Deteksi Hari Ini dengan zona waktu lokal klien
      const now = new Date()
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const isToday = selectedDateOnly === todayString

      let responseData: BookingResponse | null = null

      // 4. Payload Universal (Memastikan backend menerima semua variasi properti yang diminta)
      const apiPayload = {
        departmentId: payload.departmentId,
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        date: selectedDateOnly, // Fallback untuk validasi strict
        queueDate: selectedDateOnly, // Untuk tabel Queue
        scheduledAt: scheduledAtIso, // Untuk tabel Appointment
        notes: payload.notes || '', // Keluhan / Catatan
      }

      if (isToday) {
        // Alur Pendaftaran Hari Ini -> Prioritas ke /queues
        try {
          const response = await apiClient.post('/queues', apiPayload)
          responseData = response.data.data
        } catch (queueError: unknown) {
          console.warn('Penuh/Gagal di Queue, mengalihkan ke Appointment...', queueError)
          const response = await apiClient.post('/appointments', apiPayload)
          responseData = response.data.data
        }
      } else {
        // Alur Reservasi Masa Depan -> Langsung ke /appointments
        const response = await apiClient.post('/appointments', apiPayload)
        responseData = response.data.data
      }

      if (!responseData) throw new Error('Gagal menerima respons data dari server.')

      set({ isSubmitting: false })

      return {
        id: responseData.id,
        queueNumber:
          String(responseData.queueNumber ?? '') ||
          responseData.id.substring(responseData.id.length - 6).toUpperCase(),
        estimatedWaitTime: responseData.estimatedWaitMinutes || responseData.estimatedWaitTime || 0,
        isAppointment: !isToday,
      }
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, 'Gagal mengirim pendaftaran.')
      console.error('GAGAL SUBMIT API:', errorMsg) // Akan terlihat merah di console browser
      set({ error: errorMsg, isSubmitting: false })
      throw error
    }
  },

  resetBookingState: () => {
    set({ departmentDoctors: [], doctorSchedules: [], error: null, isSubmitting: false })
  },
}))
