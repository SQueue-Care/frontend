// src/store/doctorStore.ts
import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { DoctorProfile, DoctorSchedule } from '../lib/types'

export type { DoctorProfile, DoctorSchedule }

interface DoctorState {
  profile: DoctorProfile | null
  schedules: DoctorSchedule[]
  isLoadingProfile: boolean
  isLoadingSchedules: boolean
  isSaving: boolean
  error: string | null
  fetchProfile: (doctorId: string) => Promise<void>
  updateProfile: (doctorId: string, data: Partial<DoctorProfile>) => Promise<void>
  fetchSchedules: (doctorId: string) => Promise<void>
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  profile: null,
  schedules: [],
  isLoadingProfile: false,
  isLoadingSchedules: false,
  isSaving: false,
  error: null,

  fetchProfile: async (doctorId) => {
    if (get().isLoadingProfile) return

    set({ isLoadingProfile: true, error: null })
    try {
      const response = await apiClient.get(`/doctors/${doctorId}`)
      set({ profile: response.data.data, isLoadingProfile: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat profil dokter.'),
        isLoadingProfile: false,
      })
    }
  },

  updateProfile: async (doctorId, data) => {
    set({ isSaving: true, error: null })
    try {
      const response = await apiClient.patch(`/doctors/${doctorId}`, data)
      set({ profile: response.data.data, isSaving: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal menyimpan pembaruan profil dokter.'),
        isSaving: false,
      })
      throw error
    }
  },

  fetchSchedules: async (doctorId) => {
    if (get().isLoadingSchedules) return

    set({ isLoadingSchedules: true, error: null })
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/schedules`)
      set({ schedules: response.data.data, isLoadingSchedules: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat jadwal dokter.'),
        isLoadingSchedules: false,
      })
    }
  },
}))
