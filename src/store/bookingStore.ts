// src/store/bookingStore.ts
import { create } from 'zustand'
import { isAxiosError } from 'axios'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { BookingSchedule, DepartmentAvailability, DepartmentDoctor } from '../lib/types'

export type { BookingSchedule, DepartmentDoctor }

interface BookingResponse {
  id: string
  queueNumber?: string | number
  estimatedWaitMinutes?: number
  estimatedWaitTime?: number
  prediction?: {
    estimatedMin?: number
    kategori?: string | null
    source?: string
    features?: { waitingAhead?: number } | null
  } | null
}

function isConflictError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 409
}

interface BookingState {
  departmentDoctors: DepartmentDoctor[]
  doctorSchedules: BookingSchedule[]
  departmentAvailability: DepartmentAvailability | null
  isLoadingDoctors: boolean
  isLoadingSchedules: boolean
  isSubmitting: boolean
  error: string | null

  fetchDoctorsByDepartment: (departmentId: string) => Promise<void>
  fetchSchedulesByDoctor: (doctorId: string, dayOfWeek: string, date: string) => Promise<void>
  fetchDepartmentAvailability: (departmentId: string, date: string, doctorId?: string) => Promise<void>

  submitBooking: (payload: {
    departmentId: string
    doctorId: string
    scheduleId: string
    date: string
    notes: string
  }) => Promise<{
    id?: string
    queueNumber?: string
    estimatedWaitTime?: number
    waitKategori?: string | null
    waitingAhead?: number
    waitSource?: string
    isAppointment: boolean
  }>

  resetBookingState: () => void
}

export const useBookingStore = create<BookingState>((set, get) => ({
  departmentDoctors: [],
  doctorSchedules: [],
  departmentAvailability: null,
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

  fetchDepartmentAvailability: async (departmentId, date, doctorId) => {
    try {
      const params = new URLSearchParams({ date })
      if (doctorId) params.set('doctorId', doctorId)
      const response = await apiClient.get(`/departments/${departmentId}/availability?${params}`)
      set({ departmentAvailability: response.data.data })
    } catch (error: unknown) {
      set({ departmentAvailability: null })
      console.warn('Gagal memuat ketersediaan:', getErrorMessage(error))
    }
  },

  fetchSchedulesByDoctor: async (doctorId, dayOfWeek, date) => {
    set({ isLoadingSchedules: true, error: null, doctorSchedules: [] })
    try {
      const response = await apiClient.get(
        `/schedules?doctorId=${doctorId}&dayOfWeek=${dayOfWeek}&date=${date}`,
      )
      set({ doctorSchedules: response.data.data || [], isLoadingSchedules: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat jadwal.'),
        isLoadingSchedules: false,
      })
    }
  },

  submitBooking: async (payload) => {
    set({ isSubmitting: true, error: null })
    try {
      const selectedSchedule = get().doctorSchedules.find((s) => s.id === payload.scheduleId)
      const startTime = selectedSchedule?.startTime || '08:00'
      const selectedDateOnly = payload.date.split('T')[0]

      const scheduledAtIso = new Date(`${selectedDateOnly}T${startTime}:00`).toISOString()

      const now = new Date()
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const isToday = selectedDateOnly === todayString

      let responseData: BookingResponse | null = null

      const apiPayload = {
        departmentId: payload.departmentId,
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        date: selectedDateOnly,
        queueDate: selectedDateOnly,
        scheduledAt: scheduledAtIso,
        notes: payload.notes || '',
      }

      if (isToday) {
        const response = await apiClient.post('/queues', apiPayload)
        responseData = response.data.data
      } else {
        const response = await apiClient.post('/appointments', apiPayload)
        responseData = response.data.data
      }

      if (!responseData) throw new Error('Gagal menerima respons data dari server.')

      const estimatedMinutes =
        responseData.estimatedWaitMinutes ??
        responseData.prediction?.estimatedMin ??
        responseData.estimatedWaitTime ??
        0

      set({ isSubmitting: false })

      return {
        id: responseData.id,
        queueNumber:
          String(responseData.queueNumber ?? '') ||
          responseData.id.substring(responseData.id.length - 6).toUpperCase(),
        estimatedWaitTime: estimatedMinutes,
        waitKategori: responseData.prediction?.kategori ?? null,
        waitingAhead: responseData.prediction?.features?.waitingAhead,
        waitSource: responseData.prediction?.source,
        isAppointment: !isToday,
      }
    } catch (error: unknown) {
      const conflictMsg = isConflictError(error)
        ? getErrorMessage(
            error,
            'Slot penuh, silakan pilih waktu lain atau coba lagi dalam beberapa saat.',
          )
        : getErrorMessage(error, 'Gagal mengirim pendaftaran.')
      set({ error: conflictMsg, isSubmitting: false })
      throw error
    }
  },

  resetBookingState: () => {
    set({
      departmentDoctors: [],
      doctorSchedules: [],
      departmentAvailability: null,
      error: null,
      isSubmitting: false,
    })
  },
}))
