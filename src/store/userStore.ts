// src/store/userStore.ts
import { create } from 'zustand'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import type { UserAccount } from '../lib/types'

export type { UserAccount }

interface UserState {
  users: UserAccount[]
  isLoading: boolean
  error: string | null
  fetchUsers: (force?: boolean) => Promise<void>
  updateUser: (id: string, data: Partial<UserAccount>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  createUser: (data: Record<string, string>) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (force = false) => {
    if (get().isLoading && !force) return

    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/users')
      set({ users: response.data.data, isLoading: false })
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Gagal mengambil daftar pengguna.'),
        isLoading: false,
      })
    }
  },

  updateUser: async (id, data) => {
    await apiClient.patch(`/users/${id}`, data)
    set({
      users: get().users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })
  },

  deleteUser: async (id) => {
    await apiClient.delete(`/users/${id}`)
    set({
      users: get().users.filter((u) => u.id !== id),
    })
  },

  createUser: async (data) => {
    await apiClient.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    })
    await get().fetchUsers(true)
  },
}))
