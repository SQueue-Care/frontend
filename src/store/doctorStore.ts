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
  dayOfWeek: string; // Enum dari backend (MONDAY, etc)
  startTime: string;
  endTime: string;
  capacity: number; // Sebelumnya quota
  department: {
    name: string;
  };
}

interface DoctorState {
  profile: DoctorProfile | null;
  schedules: DoctorSchedule[];
  isLoadingProfile: boolean;
  isLoadingSchedules: boolean;
  isSaving: boolean;
  error: string | null;
  fetchProfile: (doctorId: string) => Promise<void>;
  updateProfile: (doctorId: string, data: Partial<DoctorProfile>) => Promise<void>;
  fetchSchedules: (doctorId: string) => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  profile: null,
  schedules: [],
  isLoadingProfile: false,
  isLoadingSchedules: false,
  isSaving: false,
  error: null,

  fetchProfile: async (doctorId) => {
    if (get().isLoadingProfile) return;

    set({ isLoadingProfile: true, error: null });
    try {
      const response = await apiClient.get(`/doctors/${doctorId}`);
      set({ profile: response.data.data, isLoadingProfile: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal memuat profil dokter.', 
        isLoadingProfile: false 
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
    if (get().isLoadingSchedules) return;

    set({ isLoadingSchedules: true, error: null });
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/schedules`);
      set({ schedules: response.data.data, isLoadingSchedules: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Gagal memuat jadwal dokter.', 
        isLoadingSchedules: false 
      });
    }
  }
}));
