// src/store/doctorStore.ts
import { create } from 'zustand';
import apiClient from '../lib/apiClient';

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string | null;
  departmentId: string | null;
  avgServiceMin: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  departmentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  quota: number;
  department: {
    name: string;
  };
}

interface DoctorState {
  profile: DoctorProfile | null;
  schedules: DoctorSchedule[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchProfile: (doctorId: string) => Promise<void>;
  updateProfile: (doctorId: string, data: Partial<DoctorProfile>) => Promise<void>;
  fetchSchedules: (doctorId: string) => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  profile: null,
  schedules: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async (doctorId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/doctors/${doctorId}`);
      set({ profile: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal memuat profil dokter.', 
        isLoading: false 
      });
    }
  },

  updateProfile: async (doctorId, data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await apiClient.patch(`/doctors/${doctorId}`, data);
      set({ profile: response.data.data, isSaving: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal menyimpan pembaruan profil dokter.', 
        isSaving: false 
      });
      throw error;
    }
  },

  fetchSchedules: async (doctorId) => {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/schedules`);
      set({ schedules: response.data.data });
    } catch (error: any) {
      console.error("Gagal mengambil jadwal:", error);
    }
  }
}));