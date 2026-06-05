// src/store/authStore.ts
import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { Role, User } from '../lib/types'

export type { Role, User }

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasCheckedAuth: boolean
  isCheckingAuth: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, 
  error: null,
  hasCheckedAuth: false,
  isCheckingAuth: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', { email, password })

      const tokenData = response.data.data

      localStorage.setItem('access_token', tokenData.accessToken || tokenData.access_token)
      localStorage.setItem('refresh_token', tokenData.refreshToken || tokenData.refresh_token)

      await get().fetchProfile()
    } catch (error: any) {
      set({ isLoading: false })
      throw error 
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      await apiClient.post('/auth/logout', { refreshToken })
    } catch (error) {
      console.error('[AuthStore] API Logout gagal, memaksa pembersihan sesi lokal.', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false, isLoading: false, error: null })
    }
  },

  fetchProfile: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      const userData = response.data.data

      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        hasCheckedAuth: true,
        isCheckingAuth: false,
      })
    } catch (error: unknown) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: getErrorMessage(error, 'Sesi tidak valid atau telah kedaluwarsa.'),
        hasCheckedAuth: true,
        isCheckingAuth: false,
      })
    }
  },

  checkAuth: async () => {
    const state = get()
    if (state.hasCheckedAuth || state.isCheckingAuth) {
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, hasCheckedAuth: true, isCheckingAuth: false })
      return
    }

    set({ isCheckingAuth: true })
    await get().fetchProfile()
  },
}))