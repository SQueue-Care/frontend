// src/store/alertStore.ts
import { create } from 'zustand';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',
  showAlert: (message, type = 'info') => set({ isOpen: true, message, type }),
  hideAlert: () => set({ isOpen: false }),
}));