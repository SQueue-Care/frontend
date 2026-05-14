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
  dayOfWeek: string; // Enum dari backend (MONDAY, etc)
  startTime: string;
  endTime: string;
  capacity: number; // Sebelumnya quota
}

interface BookingState {
  departmentDoctors: DepartmentDoctor[];
  doctorSchedules: DoctorSchedule[];
  isLoadingDoctors: boolean;
  isLoadingSchedules: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchDoctorsByDepartment: (departmentId: string) => Promise<void>;
  // Update: Sekarang menerima string DayOfWeek
  fetchSchedulesByDoctor: (doctorId: string, dayOfWeek: string) => Promise<void>;
  // Fungsi baru untuk integrasi Smart Submit
  submitBooking: (payload: {
    departmentId: string;
    doctorId: string;
    scheduleId: string;
    date: string;
    notes: string; // Tambahkan ini di interface
  }) => Promise<{ id?: string; queueNumber?: string; estimatedWaitTime?: number; isAppointment: boolean }>;
  
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

  submitBooking: async (payload: {
    departmentId: string;
    doctorId: string;
    scheduleId: string;
    date: string;
    notes: string; // Penambahan properti notes
  }) => {
    set({ isSubmitting: true, error: null });
    try {
      // Gunakan local date tanpa konversi UTC
      const now = new Date();
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const selectedDate = payload.date.split('T')[0];
      
      const isToday = selectedDate === todayString;
      
      let queueData: any = null;
      let appointmentData: any = null;
      
      if (isToday) {
        // Kirim ke /queues untuk hari ini
        const queueBody = {
          departmentId: payload.departmentId,
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
          notes: payload.notes // Memasukkan notes ke payload queues
        };
        try {
          const queueResponse = await apiClient.post('/queues', queueBody);
          queueData = queueResponse.data.data;
        } catch (error: any) {
          // Jangan throw, lanjutkan ke appointments
        }
        
        // Juga kirim ke /appointments untuk hari ini
        const appointmentBody = {
          departmentId: payload.departmentId,
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
          scheduledAt: payload.date,
          notes: payload.notes // Memasukkan notes ke payload appointments
        };
        try {
          const appointmentResponse = await apiClient.post('/appointments', appointmentBody);
          appointmentData = appointmentResponse.data.data;
        } catch (error: any) {
          // Jangan throw error di sini, gunakan data dari queue
        }
      } else {
        // Hanya kirim ke /appointments untuk hari lain
        const appointmentBody = {
          departmentId: payload.departmentId,
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
          scheduledAt: payload.date,
          notes: payload.notes // Memasukkan notes ke payload appointments
        };
        try {
          const appointmentResponse = await apiClient.post('/appointments', appointmentBody);
          appointmentData = appointmentResponse.data.data;
        } catch (error: any) {
          throw error;
        }
      }
      
      set({ isSubmitting: false });

      // Gunakan data dari queue jika ada, atau appointment
      const data = queueData || appointmentData;
      if (!data) {
        throw new Error('Gagal menyimpan data booking ke database.');
      }

      return {
        id: data.id,
        queueNumber: data.queueNumber || data.id.substring(data.id.length - 6).toUpperCase(),
        estimatedWaitTime: data.estimatedWaitMinutes || data.estimatedWaitTime || 0,
        isAppointment: !isToday
      };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Gagal mengirim pendaftaran.';
      set({ error: errorMsg, isSubmitting: false });
      throw error;
    }
  },

  resetBookingState: () => {
    set({ departmentDoctors: [], doctorSchedules: [], error: null, isSubmitting: false });
  }
}));