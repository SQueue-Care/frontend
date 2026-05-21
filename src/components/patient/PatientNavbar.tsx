// src/components/patient/PatientNavbar.tsx
import { useThemeStore } from '../../store/themeStore';

interface PatientNavbarProps {
  toggleSidebar: () => void;
  activeView: 'polyclinics' | 'history' | 'profile' | string;
}

export default function PatientNavbar({ toggleSidebar, activeView }: PatientNavbarProps) {
  const { theme, toggleTheme } = useThemeStore();

  const getViewTitle = () => {
    switch (activeView) {
      case 'polyclinics': return 'Layanan Poliklinik';
      case 'reservations': return 'Jadwal Reservasi Pasien'; 
      case 'queues': return 'Riwayat Antrean Medis';       
      case 'profile': return 'Profil Medis';
      default: return 'Portal Pasien';
    }
  };

  return (
    /* PERBAIKAN MUTLAK: 
      1. Mengubah 'sticky' menjadi 'fixed' dengan batas 'top-0 right-0 left-0 lg:left-[76px]' untuk mengunci posisi agar tidak bergeser.
      2. Menghapus kelas animasi 'animate-in fade-in slide-in-from-top-8 duration-700 ease-out' agar posisi komponen langsung menetap tanpa pergerakan.
    */
    <header className="fixed top-0 right-0 left-0 lg:left-[76px] z-40 flex flex-wrap sm:justify-start sm:flex-nowrap bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 text-sm py-3 lg:py-4 transition-all duration-300">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-15 flex items-center justify-between">
        
        <div className="flex items-center gap-x-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 flex justify-center items-center gap-x-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 focus:outline-none transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Manrope'] tracking-tight transition-colors">
            {getViewTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-5">
          
          <button
            type="button"
            onClick={toggleTheme}
            className="relative p-2.5 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition-all duration-300 focus:outline-none overflow-hidden"
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            <div className="relative w-5 h-5">
              <svg 
                className={`absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg 
                className={`absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </button>

          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-zinc-800 transition-colors"></div>

          <button type="button" className="relative p-2.5 text-slate-400 dark:text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-2.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#131314] transition-colors"></span>
          </button>
        </div>
      </div>
    </header>
  );
}