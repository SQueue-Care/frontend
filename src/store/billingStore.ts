import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { Bill, BillStatus, PaymentType } from '../lib/types'

interface BillingState {
  bills: Bill[]
  selectedBill: Bill | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  } | null
  fetchPatientBills: (patientId: string) => Promise<void>
  fetchAllBills: (query?: {
    page?: number
    pageSize?: number
    status?: BillStatus
    paymentType?: PaymentType
  }) => Promise<void>
  fetchBill: (billId: string) => Promise<Bill | null>
  payBill: (billId: string, paymentMethod?: 'CASHIER' | 'ONLINE_DEMO') => Promise<void>
  updateBill: (billId: string, data: { status?: BillStatus; sepNumber?: string; notes?: string }) => Promise<void>
  clearSelectedBill: () => void
}

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: [],
  selectedBill: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchAllBills: async (query = {}) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      params.append('page', String(query.page ?? 1))
      params.append('pageSize', String(query.pageSize ?? 20))
      if (query.status) params.append('status', query.status)
      if (query.paymentType) params.append('paymentType', query.paymentType)

      const response = await apiClient.get(`/bills?${params.toString()}`)
      set({
        bills: response.data.data ?? [],
        pagination: response.data.meta?.pagination ?? null,
        isLoading: false,
      })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat tagihan.'),
        isLoading: false,
        bills: [],
      })
    }
  },

  fetchPatientBills: async (patientId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get(`/patients/${patientId}/bills`)
      set({ bills: response.data.data ?? [], isLoading: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal memuat tagihan.'),
        isLoading: false,
        bills: [],
      })
    }
  },

  fetchBill: async (billId: string) => {
    try {
      const response = await apiClient.get(`/bills/${billId}`)
      const bill = response.data.data as Bill
      set({ selectedBill: bill })
      return bill
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Gagal memuat detail tagihan.') })
      return null
    }
  },

  payBill: async (billId: string, paymentMethod = 'CASHIER') => {
    try {
      const response = await apiClient.patch(`/bills/${billId}/pay`, { paymentMethod })
      const updated = response.data.data as Bill
      set({
        bills: get().bills.map((b) => (b.id === billId ? updated : b)),
        selectedBill: get().selectedBill?.id === billId ? updated : get().selectedBill,
      })
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Gagal memperbarui status pembayaran.') })
      throw error
    }
  },

  updateBill: async (billId, data) => {
    try {
      const response = await apiClient.patch(`/bills/${billId}`, data)
      const updated = response.data.data as Bill
      set({
        bills: get().bills.map((b) => (b.id === billId ? updated : b)),
        selectedBill: get().selectedBill?.id === billId ? updated : get().selectedBill,
      })
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Gagal memperbarui tagihan.') })
      throw error
    }
  },

  clearSelectedBill: () => set({ selectedBill: null }),
}))
