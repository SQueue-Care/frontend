// src/components/patient/PatientNavbar.tsx
import { useEffect, useState } from 'react';

interface PatientNavbarProps {
  toggleSidebar: () => void;
  activeView: 'polyclinics' | 'history' | 'profile';
}

export default function PatientNavbar({ toggleSidebar, activeView }: PatientNavbarProps) {
  const getViewTitle = () => {
    switch (activeView) {
      case 'polyclinics': return 'Layanan Poliklinik';
      case 'reservations': return 'Jadwal Reservasi Pasien'; 
      case 'queues': return 'Riwayat Antrean Medis';       
      case 'profile': return 'Profil Medis';
      default: return 'Portal Pasien';
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white/80 backdrop-blur-md border-b border-slate-200 text-sm py-3 lg:py-4 animate-in fade-in slide-in-from-top-8 duration-700 ease-out">
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-15 flex items-center justify-between">
        
        <div className="flex items-center gap-x-4">
          {/* Sembunyikan tombol navbar ini di layar desktop besar (lg:hidden) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 flex justify-center items-center gap-x-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 focus:outline-none transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 font-['Manrope'] tracking-tight">
            {getViewTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-xs font-bold text-slate-600 tracking-wide font-mono mt-0.5">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

          <button type="button" className="relative p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}