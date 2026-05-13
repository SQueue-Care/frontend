// src/store/patientStore.ts
// Force Vite HMR reload
import { create } from 'zustand';
import apiClient from '../lib/apiClient';

// Tipe data dari service backend
export interface PatientProfile {
  id: string;
  userId: string;
  nik?: string;
  bpjsNumber?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  address?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Tipe untuk metadata pagination dari backend
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PatientState {
  // State untuk satu profil pasien
  profile: PatientProfile | null;
  // State untuk daftar pasien dan totalnya
  patients: PatientProfile[];
  totalPatients: number;
  pagination: Pagination | null;

  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Fungsi yang sudah ada
  fetchProfile: (patientId: string) => Promise<void>;
  updateProfile: (patientId: string, data: Partial<PatientProfile>) => Promise<void>;

  // Fungsi baru untuk mengambil daftar pasien
  fetchPatients: (query: { page: number; pageSize: number }) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  // State yang sudah ada
  profile: null,
  isSaving: false,

  // State baru
  patients: [],
  totalPatients: 0,
  pagination: null,

  // State bersama
  isLoading: false,
  error: null,

  fetchPatients: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.append('page', query.page.toString());
      params.append('pageSize', query.pageSize.toString());

      const response = await apiClient.get(`/patients?${params.toString()}`);

      set({ 
        patients: response.data.data, 
        pagination: response.data.pagination,
        totalPatients: response.data.pagination.total,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal memuat data pasien.', 
        isLoading: false 
      });
    }
  },

  fetchProfile: async (patientId) => {
    set({ isLoading: true, error: null, profile: null });
    try {
      const response = await apiClient.get(`/patients/${patientId}`);
      set({ profile: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal memuat profil pasien.', 
        isLoading: false 
      });
    }
  },

  updateProfile: async (patientId, data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await apiClient.patch(`/patients/${patientId}`, data);
      // Memperbarui state profile dan juga daftar patients jika ada
      set((state) => ({
        isSaving: false,
        profile: state.profile?.id === patientId ? response.data.data : state.profile,
        patients: state.patients.map((p) => p.id === patientId ? response.data.data : p),
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal menyimpan pembaruan profil.', 
        isSaving: false 
      });
      throw error;
    }
  }
}));