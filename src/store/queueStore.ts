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
  patient: PatientProfile;
  department: {
    id: string;
    name: string;
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

  // State untuk daftar antrean tabel
  queues: Queue[];
  isLoadingTable: boolean;
  errorTable: string | null;
  fetchQueues: (filters?: { departmentId?: string; date?: Date }) => Promise<void>;
}

export const useQueueStore = create<QueueState>((set) => ({
  // Statistik
  overviewStats: null,
  isLoadingStats: false,
  errorStats: null,

  // Tabel
  queues: [],
  isLoadingTable: false,
  errorTable: null,

  fetchOverviewStats: async () => {
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
    set({ isLoadingTable: true, errorTable: null });
    try {
      const params = new URLSearchParams();
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.date) params.append('date', filters.date.toISOString().split('T')[0]);

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
