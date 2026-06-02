// src/store/departmentStore.ts
import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { Department } from '../lib/types'

export type { Department }

interface DepartmentState {
  departments: Department[]
  isLoading: boolean
  error: string | null
  fetchDepartments: () => Promise<void>
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    if (get().isLoading) return

    set({ isLoading: true, error: null })
    try {
      // Endpoint disesuaikan dengan arsitektur backend Anda
      const response = await apiClient.get('/departments')

      // Standar ApiResponse backend Anda membungkus hasil dalam properti 'data'
      set({ departments: response.data.data, isLoading: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat data poliklinik.'),
        isLoading: false,
      })
    }
  },
}))
