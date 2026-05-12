// src/store/patientStore.ts
import { create } from 'zustand';
import apiClient from '../lib/apiClient';

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

interface PatientState {
  profile: PatientProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchProfile: (patientId: string) => Promise<void>;
  updateProfile: (patientId: string, data: Partial<PatientProfile>) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async (patientId) => {
    set({ isLoading: true, error: null });
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
      set({ profile: response.data.data, isSaving: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal menyimpan pembaruan profil.', 
        isSaving: false 
      });
      throw error;
    }
  }
}));