// src/components/patient/PatientSidebar.tsx
import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface PatientSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeView: 'dashboard' | 'polyclinics' | 'reservations' | 'queues' | 'profile';
  handleNavigation: (view: 'dashboard' | 'polyclinics' | 'reservations' | 'queues' | 'profile') => void;
  user: any;
  handleLogout: () => void;
}

export default function PatientSidebar({
  isSidebarOpen,
  toggleSidebar,
  activeView,
  handleNavigation,
  user,
  handleLogout
}: PatientSidebarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      setIsDropdownOpen(false);
      setIsHistoryOpen(false);
    }
  }, [isSidebarOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/40 dark:bg-[#131314]/80 backdrop-blur-sm z-[60] transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-[#1e1f20] z-[70] flex flex-col border-r border-slate-200 dark:border-zinc-800 
            transition-all duration-500 ease-in-out
            ${isSidebarOpen 
            ? 'translate-x-0 w-72 shadow-2xl lg:shadow-none' 
            : '-translate-x-full w-72 lg:translate-x-0 lg:w-[76px]'
            }
        `}
      >
        <header className="h-15 px-4 pt-5 pb-2 flex items-center justify-start">          
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 flex justify-center items-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131314] text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 focus:outline-none transition-all shadow-sm shrink-0"
            title={isSidebarOpen ? "Kecilkan Navigasi" : "Besarkan Navigasi"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </header>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 mt-4 [&::-webkit-scrollbar]:hidden">
          <ul className="space-y-2 flex flex-col w-full">
            
            <li>
              <button
                onClick={() => handleNavigation('dashboard')}
                title={!isSidebarOpen ? 'Dashboard' : ''}
                className={`w-full flex items-center py-3 px-4 gap-x-3.5 justify-start rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none
                  ${activeView === 'dashboard' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-500/20' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-800 dark:hover:text-zinc-200 border border-transparent'}
                `}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span className={`text-sm font-medium ${!isSidebarOpen ? 'lg:hidden' : 'block animate-in fade-in duration-200'}`}>Dashboard</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleNavigation('polyclinics')}
                title={!isSidebarOpen ? 'Poliklinik' : ''}
                className={`w-full flex items-center py-3 px-4 gap-x-3.5 justify-start rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none
                  ${activeView === 'polyclinics' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-500/20' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-800 dark:hover:text-zinc-200 border border-transparent'}
                `}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <span className={`text-sm font-medium ${!isSidebarOpen ? 'lg:hidden' : 'block animate-in fade-in duration-200'}`}>Poliklinik</span>
              </button>
            </li>

            <li className="flex flex-col w-full">
              <button
                onClick={() => {
                  if (!isSidebarOpen) {
                    toggleSidebar();
                    setIsHistoryOpen(true);
                  } else {
                    setIsHistoryOpen(!isHistoryOpen);
                  }
                }}
                title={!isSidebarOpen ? 'Riwayat & Kunjungan' : ''}
                className={`w-full flex items-center py-3 px-4 gap-x-3.5 justify-start rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none
                  ${(activeView === 'reservations' || activeView === 'queues' || isHistoryOpen) ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-500/20' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-800 dark:hover:text-zinc-200 border border-transparent'}
                `}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className={`text-sm font-medium flex-1 text-left ${!isSidebarOpen ? 'lg:hidden' : 'block animate-in fade-in duration-200'}`}>Riwayat Kunjungan</span>
                {isSidebarOpen && (
                  <svg className={`shrink-0 w-4 h-4 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                )}
              </button>

              {isHistoryOpen && isSidebarOpen && (
                <ul className="pl-9 pr-2 mt-1.5 space-y-1 border-l-2 border-teal-50 dark:border-zinc-800 ml-5 origin-top animate-in fade-in zoom-in-95 duration-100 ease-out">
                  <li>
                    <button
                      onClick={() => handleNavigation('reservations')}
                      className={`w-full flex items-center py-3 px-4 gap-x-3.5 justify-start rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none ${
                        activeView === 'reservations' ? 'text-teal-700 dark:text-teal-400 bg-white dark:bg-[#131314] shadow-sm border border-teal-100 dark:border-teal-500/20' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#131314] hover:text-teal-600 dark:hover:text-teal-400 border border-transparent'
                      }`}
                    >
                      Jadwal Reservasi
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('queues')}
                      className={`w-full flex items-center py-3 px-4 gap-x-3.5 justify-start rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none ${
                        activeView === 'queues' ? 'text-teal-700 dark:text-teal-400 bg-white dark:bg-[#131314] shadow-sm border border-teal-100 dark:border-teal-500/20' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#131314] hover:text-teal-600 dark:hover:text-teal-400 border border-transparent'
                      }`}
                    >
                      Riwayat Antrean
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-[#1e1f20] relative transition-colors">
          <div className="relative w-full">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              // PERBAIKAN: px-3 gap-x-3 justify-start dikunci mati tanpa kondisi isSidebarOpen
              className="w-full flex items-center py-1.5 px-3 gap-x-3 justify-start rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/80 outline-none transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-[#131314] text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-zinc-800 flex items-center justify-center shrink-0 font-extrabold shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {isSidebarOpen && (
                <div className="flex items-center flex-1 min-w-0 text-start animate-in fade-in duration-200">
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">{user?.name || 'Pasien'}</span>
                  <svg className={`shrink-0 w-4 h-4 ms-auto text-slate-400 dark:text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              )}
            </button>

            {isDropdownOpen && (
              <div className={`absolute left-0 bottom-full mb-2 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 origin-bottom animate-in fade-in zoom-in-95 duration-150 ease-out transition-colors
                ${isSidebarOpen ? 'w-full' : 'w-56 left-2'}
              `}>
                <div className="p-1.5">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Email Sesi</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-300 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Mode Gelap</span>
                    <button
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors outline-none shadow-inner ${theme === 'dark' ? 'bg-teal-500' : 'bg-slate-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${theme === 'dark' ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleNavigation('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors mb-0.5"
                  >
                    Profil Saya
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    Keluar Sistem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}