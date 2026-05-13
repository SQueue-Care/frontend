// src/store/bookingStore.ts
import { create } from 'zustand';
import apiClient from '../lib/apiClient';

// Definisi Interface berdasarkan schema backend Anda
export interface DepartmentDoctor {
  id: string;
  userId: string;
  specialization: string;
  user: {
    name: string;
  };
}

export interface DoctorSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  quota: number;
}

interface BookingState {
  departmentDoctors: DepartmentDoctor[];
  doctorSchedules: DoctorSchedule[];
  isLoadingDoctors: boolean;
  isLoadingSchedules: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchDoctorsByDepartment: (departmentId: string) => Promise<void>;
  // Update: Sekarang menerima dayOfWeek
  fetchSchedulesByDoctor: (doctorId: string, dayOfWeek: number) => Promise<void>;
  // Fungsi baru untuk integrasi Smart Submit
  submitBooking: (payload: {
    departmentId: string;
    doctorId: string;
    scheduleId: string;
    date: string;
  }) => Promise<{ queueNumber?: string; estimatedWaitTime?: number; isAppointment: boolean }>;
  
  resetBookingState: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  departmentDoctors: [],
  doctorSchedules: [],
  isLoadingDoctors: false,
  isLoadingSchedules: false,
  isSubmitting: false,
  error: null,

  fetchDoctorsByDepartment: async (departmentId) => {
    set({ isLoadingDoctors: true, error: null, departmentDoctors: [] });
    try {
      const response = await apiClient.get(`/departments/${departmentId}`);
      set({ departmentDoctors: response.data.data.doctors || [], isLoadingDoctors: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat dokter.', isLoadingDoctors: false });
    }
  },

  fetchSchedulesByDoctor: async (doctorId, dayOfWeek) => {
    set({ isLoadingSchedules: true, error: null, doctorSchedules: [] });
    try {
      // Menggunakan endpoint /schedules dengan filter sesuai api.md
      const response = await apiClient.get(`/schedules?doctorId=${doctorId}&dayOfWeek=${dayOfWeek}`);
      set({ doctorSchedules: response.data.data || [], isLoadingSchedules: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat jadwal.', isLoadingSchedules: false });
    }
  },

  submitBooking: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const today = new Date().toISOString().split('T')[0];
      const selectedDate = payload.date.split('T')[0];
      
      // Smart Branching Logic
      const isToday = selectedDate === today;
      const endpoint = isToday ? '/queues' : '/appointments';
      
      const response = await apiClient.post(endpoint, payload);
      set({ isSubmitting: false });

      return {
        id: response.data.data.id, // <-- KOREKSI MUTLAK: Tambahkan baris ini
        queueNumber: response.data.data.queueNumber || 'RES',
        estimatedWaitTime: response.data.data.estimatedWaitTime || 0,
        isAppointment: !isToday
      };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengirim pendaftaran.';
      set({ error: msg, isSubmitting: false });
      throw error;
    }
  },

  resetBookingState: () => {
    set({ departmentDoctors: [], doctorSchedules: [], error: null, isSubmitting: false });
  }
}));