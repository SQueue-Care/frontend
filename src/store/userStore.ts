// src/store/userStore.ts
import { create } from 'zustand';
import apiClient from '../lib/apiClient';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  isActive: boolean;
  createdAt: string;
}

interface UserState {
  users: UserAccount[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (force?: boolean) => Promise<void>;
  updateUser: (id: string, data: Partial<UserAccount>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  // 1. Tambahkan definisi tipe untuk createUser
  createUser: (data: Record<string, string>) => Promise<void>; 
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (force = false) => {
    if (get().isLoading && !force) return;

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/users');
      set({ users: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal mengambil daftar pengguna.', 
        isLoading: false 
      });
    }
  },

  updateUser: async (id, data) => {
    try {
      await apiClient.patch(`/users/${id}`, data);
      set({
        users: get().users.map(u => u.id === id ? { ...u, ...data } : u)
      });
    } catch (error: any) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await apiClient.delete(`/users/${id}`);
      set({
        users: get().users.filter(u => u.id !== id)
      });
    } catch (error: any) {
      throw error;
    }
  },

  // 2. Implementasi fungsi createUser
  createUser: async (data) => {
    try {
      // Menggunakan rute registrasi publik sesuai dokumentasi API
      await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      // Sinkronisasi ulang tabel setelah data berhasil masuk database
      await get().fetchUsers(true);
    } catch (error: any) {
      throw error;
    }
  }
}));
