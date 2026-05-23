import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { WaitTimeEstimate } from '../lib/types'

export type { WaitTimeEstimate }

interface PredictionState {
  waitTimeEstimate: WaitTimeEstimate | null
  isLoading: boolean
  error: string | null
  fetchWaitTime: (departmentId: string, doctorId?: string) => Promise<void>
}

export const usePredictionStore = create<PredictionState>((set) => ({
  waitTimeEstimate: null,
  isLoading: false,
  error: null,
  fetchWaitTime: async (departmentId, doctorId) => {
    set({ isLoading: true, error: null })
    try {
      // Membuat query string dinamis
      const params = new URLSearchParams()
      params.append('departmentId', departmentId)
      if (doctorId) {
        params.append('doctorId', doctorId)
      }

      const response = await apiClient.get<{ data: WaitTimeEstimate }>(
        `/predictions/wait-time?${params.toString()}`
      )

      set({ waitTimeEstimate: response.data.data, isLoading: false })
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Gagal mengambil estimasi waktu tunggu.')
      set({ error: errorMessage, isLoading: false })
      console.error(err)
    }
  },
}))
