import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function resolveInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('patient-theme-storage')
    const saved = stored ? (JSON.parse(stored)?.state?.theme as Theme) : null
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: resolveInitialTheme(),
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(nextTheme)
          return { theme: nextTheme }
        }),
      setTheme: (theme) =>
        set(() => {
          applyTheme(theme)
          return { theme }
        }),
    }),
    { name: 'patient-theme-storage' }
  )
)
