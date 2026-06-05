// src/store/patientStore.ts
import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { PatientMedicalProfile, PatientProfile } from '../lib/types'

export type { PatientMedicalProfile, PatientProfile }

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface PatientState {
  profile: PatientProfile | null
  medicalProfile: PatientMedicalProfile | null
  patients: PatientProfile[]
  totalPatients: number
  pagination: Pagination | null

  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Fungsi yang sudah ada
  fetchProfile: (patientId: string) => Promise<void>
  updateProfile: (patientId: string, data: Partial<PatientProfile>) => Promise<void>

  // Fungsi baru untuk mengambil daftar pasien
  fetchPatients: (query: { page: number; pageSize: number; search?: string }) => Promise<void>
  fetchMedicalProfile: (patientId: string) => Promise<PatientMedicalProfile | null>

  // Fungsi untuk menambahkan appointment ID ke profil pasien
  addAppointmentId: (patientId: string, appointmentId: string) => Promise<void>
}

export const usePatientStore = create<PatientState>((set, get) => ({
  profile: null,
  medicalProfile: null,
  isSaving: false,

  patients: [],
  totalPatients: 0,
  pagination: null,

  isLoading: false,
  error: null,

  fetchPatients: async (query) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      params.append('page', query.page.toString())
      params.append('pageSize', query.pageSize.toString())
      if (query.search?.trim()) params.append('search', query.search.trim())

      const response = await apiClient.get(`/patients?${params.toString()}`)

      set({
        patients: response.data.data,
        pagination: response.data.meta?.pagination || null,
        totalPatients: response.data.meta?.pagination?.total || 0,
        isLoading: false,
      })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat data pasien.'),
        isLoading: false,
      })
    }
  },

  fetchMedicalProfile: async (patientId) => {
    set({ isLoading: true, error: null, medicalProfile: null })
    try {
      const response = await apiClient.get(`/patients/${patientId}/medical-profile`)
      const data = response.data.data as PatientMedicalProfile
      set({ medicalProfile: data, isLoading: false })
      return data
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat riwayat medis pasien.'),
        isLoading: false,
      })
      return null
    }
  },

  fetchProfile: async (patientId) => {
    set({ isLoading: true, error: null, profile: null })
    try {
      const response = await apiClient.get(`/patients/${patientId}`)
      const profileData = response.data.data

      if (!profileData.appointmentIds) {
        const stored = localStorage.getItem(`patient_appointments_${patientId}`)
        if (stored) {
          try {
            profileData.appointmentIds = JSON.parse(stored)
          } catch {
            console.warn('Gagal parse localStorage appointments')
          }
        }
      }

      set({ profile: profileData, isLoading: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat profil pasien.'),
        isLoading: false,
      })
    }
  },

  updateProfile: async (patientId, data) => {
    set({ isSaving: true, error: null })
    try {
      const response = await apiClient.patch(`/patients/${patientId}`, data)
      set((state) => ({
        isSaving: false,
        profile: state.profile?.id === patientId ? response.data.data : state.profile,
        patients: state.patients.map((p) => (p.id === patientId ? response.data.data : p)),
      }))
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal menyimpan pembaruan profil.'),
        isSaving: false,
      })
      throw error
    }
  },

  addAppointmentId: async (patientId, appointmentId) => {
    try {
      const state = get()
      if (state.profile?.id !== patientId) {
        console.warn('Profile ID mismatch, tidak menyimpan appointment')
        return
      }

      const currentIds = state.profile.appointmentIds || []
      if (currentIds.includes(appointmentId)) {
        console.log('Appointment ID sudah ada:', appointmentId)
        return
      }

      const updatedIds = [...currentIds, appointmentId]
      console.log('💾 Saving appointment IDs:', updatedIds)

      set((s) => ({
        profile: s.profile ? { ...s.profile, appointmentIds: updatedIds } : null,
      }))

      localStorage.setItem(`patient_appointments_${patientId}`, JSON.stringify(updatedIds))
      console.log('💾 Appointment IDs saved to localStorage:', updatedIds)

      try {
        await apiClient.patch(`/patients/${patientId}`, { appointmentIds: updatedIds })
        console.log('✅ Appointment IDs also saved to backend')
      } catch {
        console.warn('⚠️ Backend save failed, but localStorage is saved as backup')
      }
    } catch (error: unknown) {
      console.error('❌ Gagal menyimpan appointment ID:', error)
    }
  },
}))
