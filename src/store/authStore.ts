// src/store/authStore.ts
import { create } from 'zustand';
import apiClient from '../lib/apiClient';

export type Role = 'PATIENT' | 'ADMIN' | 'DOCTOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  patient?: { id: string };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Diatur true di awal agar aplikasi menunggu pengecekan sesi sebelum merender
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Standar API Anda membungkus data di dalam objek "data"
      // Sesuaikan nama variabel access_token/refresh_token dengan key persis dari backend Anda
      const tokenData = response.data.data;
      
      localStorage.setItem('access_token', tokenData.accessToken || tokenData.access_token);
      localStorage.setItem('refresh_token', tokenData.refreshToken || tokenData.refresh_token);
      
      // Profil pengguna harus diambil setelah token berhasil disimpan
      await get().fetchProfile();
    } catch (error: any) {
      set({ 
        error: error.message || 'Gagal melakukan otentikasi. Periksa kredensial Anda.', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      // Memanggil endpoint logout untuk mencabut refresh token di server
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('[AuthStore] API Logout gagal, memaksa pembersihan sesi lokal.', error);
    } finally {
      // Sesi lokal wajib dibersihkan meskipun server mengembalikan error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  fetchProfile: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data.data;
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message || 'Sesi tidak valid atau telah kedaluwarsa.'
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    // Jika token ada, validasi dengan mengambil data profil terbaru
    await get().fetchProfile();
  }
}));