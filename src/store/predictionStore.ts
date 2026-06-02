import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { PatientType, QueuePriority, WaitTimeEstimate } from '../lib/types'

export type { WaitTimeEstimate }

export interface FetchWaitTimeParams {
  departmentId: string
  doctorId?: string
  patientId?: string
  scheduleId?: string
  queueDate?: string
  priority?: QueuePriority
  patientType?: PatientType
}

interface PredictionState {
  waitTimeEstimate: WaitTimeEstimate | null
  isLoading: boolean
  error: string | null
  fetchWaitTime: (params: FetchWaitTimeParams) => Promise<WaitTimeEstimate | null>
  clearWaitTime: () => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  waitTimeEstimate: null,
  isLoading: false,
  error: null,

  fetchWaitTime: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const query = new URLSearchParams()
      query.append('departmentId', params.departmentId)
      if (params.doctorId) query.append('doctorId', params.doctorId)
      if (params.patientId) query.append('patientId', params.patientId)
      if (params.scheduleId) query.append('scheduleId', params.scheduleId)
      if (params.queueDate) query.append('queueDate', params.queueDate)
      if (params.priority) query.append('priority', params.priority)
      if (params.patientType) query.append('patientType', params.patientType)

      const response = await apiClient.get<{ data: WaitTimeEstimate }>(
        `/predictions/wait-time?${query.toString()}`,
      )

      const estimate = response.data.data
      set({ waitTimeEstimate: estimate, isLoading: false })
      return estimate
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Gagal mengambil estimasi waktu tunggu.')
      set({ error: errorMessage, isLoading: false, waitTimeEstimate: null })
      console.error(err)
      return null
    }
  },

  clearWaitTime: () => set({ waitTimeEstimate: null, error: null }),
}))
