import { create } from 'zustand';
import apiClient from '../lib/apiClient';
// Force Vite HMR reload
import { QueueStatus } from '../lib/types';
import type { PatientProfile } from './patientStore';

// Tipe data berdasarkan apa yang dikembalikan oleh endpoint /stats/overview
interface DepartmentStats {
  departmentId: string;
  code: string;
  name: string;
  counts: Partial<Record<QueueStatus, number>>;
  total: number;
}

export interface OverviewStats {
  date: string;
  departments: DepartmentStats[];
}

// Tipe data untuk satu antrean, sesuai dengan 'QUEUE_INCLUDE' di backend
export interface Queue {
  id: string;
  queueNumber: number;
  status: QueueStatus;
  queueDate: string;
  actualWaitMinutes?: number | null;
  patient: PatientProfile;
  department: {
    id: string;
    name: string;
    code: string;
  };
  doctor: {
    user: {
      name: string;
    };
  } | null;
}

interface QueueState {
  // State untuk statistik
  overviewStats: OverviewStats | null;
  isLoadingStats: boolean;
  errorStats: string | null;
  fetchOverviewStats: () => Promise<void>;
  activeQueueDetail: Queue | null;
  fetchActiveQueue: (id: string) => Promise<void>;
  cancelQueue: (id: string) => Promise<void>;

  // State untuk daftar antrean tabel
  queues: Queue[];
  isLoadingTable: boolean;
  errorTable: string | null;
  fetchQueues: (filters?: { departmentId?: string; date?: Date }) => Promise<void>;

  patientHistory: Queue[];
  fetchPatientHistory: (patientId: string) => Promise<void>;

  patientAppointments: any[];
  isLoadingAppointments: boolean;
  fetchPatientAppointments: (patientId: string) => Promise<void>;
  fetchAppointmentDetails: (appointmentId: string) => Promise<any>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  // Statistik
  overviewStats: null,
  isLoadingStats: false,
  errorStats: null,

  // Tabel
  queues: [],
  isLoadingTable: false,
  errorTable: null,

  activeQueueDetail: null,

  patientHistory: [],

  patientAppointments: [],
  isLoadingAppointments: false,

  fetchPatientAppointments: async (patientId: string) => {
    set({ isLoadingAppointments: true });
    try {
      const response = await apiClient.get(`/patients/${patientId}/appointments`);
      set({ patientAppointments: response.data.data || [], isLoadingAppointments: false });
    } catch (error: any) {
      console.error('Gagal memuat reservasi:', error);
      set({ isLoadingAppointments: false, patientAppointments: [] });
    }
  },

  fetchAppointmentDetails: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Gagal memuat appointment ${appointmentId}:`, error);
      return null;
    }
  },

  fetchPatientHistory: async (patientId) => {
  set({ isLoadingTable: true, errorTable: null });
  try {
    const response = await apiClient.get(`/patients/${patientId}/queues`);
    set({ patientHistory: response.data.data, isLoadingTable: false });
  } catch (error: any) {
    set({ 
      errorTable: error.response?.data?.message || 'Gagal memuat riwayat.', 
      isLoadingTable: false 
    });
  }
},

  fetchActiveQueue: async (id) => {
    try {
      const response = await apiClient.get(`/queues/${id}`);
      set({ activeQueueDetail: response.data.data });
    } catch (error: any) {
      console.error('Gagal memuat detail antrean:', error);
    }
  },

  cancelQueue: async (id) => {
    try {
      await apiClient.post(`/queues/${id}/cancel`);
      set({ activeQueueDetail: null });
      // Saran: Bersihkan state lokal setelah pembatalan berhasil agar UI langsung kembali ke mode kosong
    } catch (error: any) {
      throw error;
    }
  },

  fetchOverviewStats: async () => {
    if (get().isLoadingStats) return;

    set({ isLoadingStats: true, errorStats: null });
    try {
      const response = await apiClient.get('/queues/stats/overview');
      set({ overviewStats: response.data.data, isLoadingStats: false });
    } catch (error: any) {
      set({ 
        errorStats: error.response?.data?.message || 'Gagal memuat statistik antrean.', 
        isLoadingStats: false 
      });
    }
  },

  fetchQueues: async (filters = {}) => {
    if (get().isLoadingTable) return;

    set({ isLoadingTable: true, errorTable: null });
    try {
      const params = new URLSearchParams();
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      
      if (filters.date) {
        // Ambil YYYY-MM-DD sesuai zona waktu lokal klien
        const year = filters.date.getFullYear();
        const month = String(filters.date.getMonth() + 1).padStart(2, '0');
        const day = String(filters.date.getDate()).padStart(2, '0');
        params.append('date', `${year}-${month}-${day}`);
      }

      const response = await apiClient.get(`/queues?${params.toString()}`);
      set({ queues: response.data.data, isLoadingTable: false });
    } catch (error: any) {
      set({
        errorTable: error.response?.data?.message || 'Gagal memuat daftar antrean.',
        isLoadingTable: false,
      });
    }
  },
}));
