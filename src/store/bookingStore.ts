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
  // State Data
  departmentDoctors: DepartmentDoctor[];
  doctorSchedules: DoctorSchedule[];
  
  // State Status
  isLoadingDoctors: boolean;
  isLoadingSchedules: boolean;
  error: string | null;

  // Fungsi Fetching
  fetchDoctorsByDepartment: (departmentId: string) => Promise<void>;
  fetchSchedulesByDoctor: (doctorId: string) => Promise<void>;
  
  // Fungsi Reset (dipanggil saat panel booking ditutup)
  resetBookingState: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  departmentDoctors: [],
  doctorSchedules: [],
  isLoadingDoctors: false,
  isLoadingSchedules: false,
  error: null,

  // Saran Engineer: Endpoint ini memanfaatkan relasi Prisma include: { doctors: ... }
  fetchDoctorsByDepartment: async (departmentId) => {
    set({ isLoadingDoctors: true, error: null, departmentDoctors: [] });
    try {
      const response = await apiClient.get(`/departments/${departmentId}`);
      // Asumsi backend mengembalikan data departemen yang di dalamnya terdapat array doctors
      set({ departmentDoctors: response.data.data.doctors || [], isLoadingDoctors: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat daftar dokter.', isLoadingDoctors: false });
    }
  },

  // Saran Engineer: Memanggil endpoint khusus jadwal dokter
  fetchSchedulesByDoctor: async (doctorId) => {
    set({ isLoadingSchedules: true, error: null, doctorSchedules: [] });
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/schedules`);
      set({ doctorSchedules: response.data.data || [], isLoadingSchedules: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat jadwal dokter.', isLoadingSchedules: false });
    }
  },

  resetBookingState: () => {
    set({ departmentDoctors: [], doctorSchedules: [], error: null });
  }
}));