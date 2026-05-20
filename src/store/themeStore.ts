// src/store/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // Tema bawaan adalah terang
      
      toggleTheme: () => 
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: 'patient-theme-preference', // Nama kunci data di localStorage peramban
    }
  )
);