import { create } from 'zustand';

interface DashboardFilterState {
  searchQuery: string;
  selectedDepartment: string;
  setSearchQuery: (query: string) => void;
  setSelectedDepartment: (deptId: string) => void;
}

export const useDashboardFilterStore = create<DashboardFilterState>((set) => ({
  searchQuery: '',
  selectedDepartment: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedDepartment: (selectedDepartment) => set({ selectedDepartment }),
}));
