import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { AppointmentDetail, OverviewStats, Queue } from '../lib/types'

export type { OverviewStats, Queue }

interface QueueState {
  // State untuk statistik
  overviewStats: OverviewStats | null
  isLoadingStats: boolean
  errorStats: string | null
  fetchOverviewStats: () => Promise<void>
  activeQueueDetail: Queue | null
  fetchActiveQueue: (id: string) => Promise<void>
  cancelQueue: (id: string) => Promise<void>

  // State untuk daftar antrean tabel
  queues: Queue[]
  isLoadingTable: boolean
  errorTable: string | null
  fetchQueues: (filters?: { departmentId?: string; date?: Date }) => Promise<void>

  patientHistory: Queue[]
  fetchPatientHistory: (patientId: string) => Promise<void>

  patientAppointments: AppointmentDetail[]
  isLoadingAppointments: boolean
  fetchPatientAppointments: (patientId: string) => Promise<void>
  fetchAppointmentDetails: (appointmentId: string) => Promise<AppointmentDetail | null>
}

export const useQueueStore = create<QueueState>((set, get) => ({
  // Statistik
  overviewStats: null,
  isLoadingStats: false,
  errorStats: null,

  // Tabel
  queues: [],
  isLoadingTable: false,
  errorTable: null,

  activeQueueDetail: null,

  patientHistory: [],

  patientAppointments: [],
  isLoadingAppointments: false,

  fetchPatientAppointments: async (patientId: string) => {
    set({ isLoadingAppointments: true })
    try {
      const response = await apiClient.get(`/patients/${patientId}/appointments`)
      set({ patientAppointments: response.data.data || [], isLoadingAppointments: false })
    } catch (error: unknown) {
      console.error('Gagal memuat reservasi:', error)
      set({ isLoadingAppointments: false, patientAppointments: [] })
    }
  },

  fetchAppointmentDetails: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`)
      return response.data.data as AppointmentDetail
    } catch (error: unknown) {
      console.error(`Gagal memuat appointment ${appointmentId}:`, error)
      return null
    }
  },

  fetchPatientHistory: async (patientId) => {
    set({ isLoadingTable: true, errorTable: null })
    try {
      const response = await apiClient.get(`/patients/${patientId}/queues`)
      set({ patientHistory: response.data.data, isLoadingTable: false })
    } catch (error: unknown) {
      set({
        errorTable: getErrorMessage(error, 'Gagal memuat riwayat.'),
        isLoadingTable: false,
      })
    }
  },

  fetchActiveQueue: async (id) => {
    try {
      const response = await apiClient.get(`/queues/${id}`)
      set({ activeQueueDetail: response.data.data })
    } catch (error: unknown) {
      console.error('Gagal memuat detail antrean:', error)
    }
  },

  cancelQueue: async (id) => {
    await apiClient.post(`/queues/${id}/cancel`)
    set({ activeQueueDetail: null })
  },

  fetchOverviewStats: async () => {
    if (get().isLoadingStats) return

    set({ isLoadingStats: true, errorStats: null })
    try {
      const response = await apiClient.get('/queues/stats/overview')
      set({ overviewStats: response.data.data, isLoadingStats: false })
    } catch (error: unknown) {
      set({
        errorStats: getErrorMessage(error, 'Gagal memuat statistik antrean.'),
        isLoadingStats: false,
      })
    }
  },

  fetchQueues: async (filters = {}) => {
    if (get().isLoadingTable) return

    set({ isLoadingTable: true, errorTable: null })
    try {
      const params = new URLSearchParams()
      if (filters.departmentId) params.append('departmentId', filters.departmentId)

      if (filters.date) {
        // Ambil YYYY-MM-DD sesuai zona waktu lokal klien
        const year = filters.date.getFullYear()
        const month = String(filters.date.getMonth() + 1).padStart(2, '0')
        const day = String(filters.date.getDate()).padStart(2, '0')
        params.append('date', `${year}-${month}-${day}`)
      }

      const response = await apiClient.get(`/queues?${params.toString()}`)
      set({ queues: response.data.data, isLoadingTable: false })
    } catch (error: unknown) {
      set({
        errorTable: getErrorMessage(error, 'Gagal memuat daftar antrean.'),
        isLoadingTable: false,
      })
    }
  },
}))
