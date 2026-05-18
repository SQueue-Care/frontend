// src/pages/DoctorDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDoctorStore } from '../store/doctorStore';
import DoctorProfileSettings from '../components/DoctorProfileSettings';
import DoctorAppointmentManagement from '../components/DoctorAppointmentManagement';
import DoctorQueueManagement from '../components/doctor/DoctorQueueManagement';

type DoctorView = 'dashboard' | 'appointments' | 'profile';

export default function DoctorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<DoctorView>('dashboard');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const { profile, fetchProfile } = useDoctorStore();

  // Efek untuk memuat data profil dan jadwal
  useEffect(() => {
    const doctorId = (user as any)?.doctor?.id || (user?.role === 'DOCTOR' ? user.id : null);
    
    if (doctorId && !profile) {
      fetchProfile(doctorId);
    }
  }, [user, profile, fetchProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] flex">
      {/* SIDEBAR PERMANEN (Desktop) & OVERLAY (Mobile) */}
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`} onClick={() => setIsSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-br from-teal-900 to-slate-900 border-r border-slate-800 shadow-xl md:shadow-none z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
            <span className="text-white text-lg font-extrabold font-['Manrope'] tracking-wide">Doctor<span className="text-teal-400">Portal</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeView === 'dashboard' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Ruang Praktik
          </button>

          <button onClick={() => { setActiveView('appointments'); setIsSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeView === 'appointments' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Jadwal Reservasi
          </button>

          <button onClick={() => { setActiveView('profile'); setIsSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeView === 'profile' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profil Medis
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        
        {/* NAVBAR ATAS */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <h2 className="text-lg font-bold text-zinc-800">
                {activeView === 'dashboard' ? 'Ruang Praktik Utama' : activeView === 'appointments' ? 'Jadwal Reservasi' : 'Manajemen Profil'}
              </h2>
          </div>
          
          <div className="flex items-center gap-3 cursor-default">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-zinc-900 leading-none mb-1">{user?.name || 'Dokter'}</span>
              <span className="text-[11px] font-semibold text-indigo-600 tracking-wide uppercase">{profile?.department?.name || 'Departemen'}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-sm flex flex-shrink-0 items-center justify-center">
               {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>
        </header>

        {/* AREA KERJA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          
          {activeView === 'dashboard' && <DoctorQueueManagement />}

          {activeView === 'appointments' && <DoctorAppointmentManagement />}

          {activeView === 'profile' && <DoctorProfileSettings />}
        </main>
      </div>
    </div>
  );
}
