// src/components/patient/PatientSidebar.tsx
import { useState, useEffect } from 'react';

interface PatientSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  // 1. Mengubah tipe history menjadi reservations & queues
  activeView: 'polyclinics' | 'reservations' | 'queues' | 'profile';
  handleNavigation: (view: 'polyclinics' | 'reservations' | 'queues' | 'profile') => void;
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
  
  // 2. Menambahkan state untuk mengontrol buka/tutup submenu riwayat
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 700);
    return () => clearTimeout(timer);
  }, []);

  // 3. Efek untuk menutup semua submenu jika sidebar dikecilkan
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsDropdownOpen(false);
      setIsHistoryOpen(false);
    }
  }, [isSidebarOpen]);

  return (
    <>
      {/* Overlay Background (TETAP SAMA) */}
      <div
        className={`fixed inset-0 bg-white/40 backdrop-blur-sm z-[60] transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container (TETAP SAMA) */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white z-[70] flex flex-col border-r border-slate-200 
            animate-in fade-in slide-in-from-left-8 duration-700 ease-out fill-mode-both
            ${isSidebarOpen 
            ? 'translate-x-0 w-72 shadow-2xl lg:shadow-none' 
            : '-translate-x-full w-72 lg:translate-x-0 lg:w-[76px]'
            }
            ${isMounted ? 'transition-all duration-300' : ''}
        `}
        >
        {/* HEADER (TETAP SAMA) */}
        <header className={`h-15 px-4 pt-5 pb-2 flex items-center gap-x-2 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>          
          {isSidebarOpen && (
            <div className="relative flex-1 min-w-0 animate-in fade-in duration-200">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center py-1.5 px-2 gap-x-3 justify-start rounded-xl hover:bg-slate-50 outline-none transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 font-extrabold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                <div className="flex items-center flex-1 min-w-0 text-start">
                  <span className="font-extrabold text-sm text-zinc-900 truncate">{user?.name || 'Pasien'}</span>
                  <svg className={`shrink-0 w-4 h-4 ms-auto text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 origin-top animate-in fade-in zoom-in-95 duration-100 ease-out">
                  <div className="p-1.5">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Sesi</p>
                      <p className="text-xs font-bold text-zinc-800 truncate mt-0.5">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleNavigation('profile');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-0.5"
                    >
                      Profil Saya
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Keluar Sistem
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 flex justify-center items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 focus:outline-none transition-all shadow-sm"
              title={isSidebarOpen ? "Kecilkan Navigasi" : "Besarkan Navigasi"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* BODY: Menu Navigasi Utama */}
        {/* KOREKSI TYPO: mengubah string kutip ganda menjadi backtick agar template literal berfungsi */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 mt-4 [&::-webkit-scrollbar]:hidden">
          <ul className="space-y-2 flex flex-col w-full">
            
            {/* MENU 1: Poliklinik */}
            <li>
              <button
                onClick={() => handleNavigation('polyclinics')}
                title={!isSidebarOpen ? 'Pilih Poliklinik' : ''}
                className={`w-full flex items-center py-3 rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none
                  ${isSidebarOpen ? 'px-3 gap-x-3.5 justify-start' : 'px-3 gap-x-3.5 justify-start lg:justify-center lg:px-0'}
                  ${activeView === 'polyclinics' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}
                `}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span className={`text-sm font-bold ${!isSidebarOpen ? 'lg:hidden' : 'block animate-in fade-in duration-200'}`}>Pilih Poliklinik</span>
              </button>
            </li>

            {/* MENU 2: Riwayat (Dropdown Parent) */}
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
                className={`w-full flex items-center py-3 rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none
                  ${isSidebarOpen ? 'px-3 gap-x-3.5 justify-start' : 'px-3 gap-x-3.5 justify-start lg:justify-center lg:px-0'}
                  ${(activeView === 'reservations' || activeView === 'queues' || isHistoryOpen) ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}
                `}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className={`text-sm font-bold flex-1 text-left ${!isSidebarOpen ? 'lg:hidden' : 'block animate-in fade-in duration-200'}`}>Riwayat Kunjungan</span>
                {/* Ikon panah berputar */}
                {isSidebarOpen && (
                  <svg className={`shrink-0 w-4 h-4 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                )}
              </button>

              {/* Submenu Riwayat */}
              {isHistoryOpen && isSidebarOpen && (
                <ul className="pl-9 pr-2 mt-1.5 space-y-1 border-l-2 border-teal-50 ml-5 origin-top animate-in fade-in zoom-in-95 duration-100 ease-out">
                  <li>
                    <button
                      onClick={() => handleNavigation('reservations')}
                      className={`w-full text-left py-2.5 px-3 text-xs font-bold rounded-lg transition-all outline-none ${
                        activeView === 'reservations' ? 'text-teal-700 bg-white shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600 border border-transparent'
                      }`}
                    >
                      Jadwal Reservasi
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('queues')}
                      className={`w-full text-left py-2.5 px-3 text-xs font-bold rounded-lg transition-all outline-none ${
                        activeView === 'queues' ? 'text-teal-700 bg-white shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600 border border-transparent'
                      }`}
                    >
                      Nomor Antrean
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* MENU 3: Profil Pasien */}
            <li>
              <button
                onClick={() => handleNavigation('profile')}
                title={!isSidebarOpen ? 'Profil Pasien' : ''}
                className={`w-full flex items-center py-3 rounded-xl transition-all overflow-hidden whitespace-nowrap outline-none
                  ${isSidebarOpen ? 'px-3 gap-x-3.5 justify-start' : 'px-3 gap-x-3.5 justify-start lg:justify-center lg:px-0'}
                  ${activeView === 'profile' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}
                `}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span className={`text-sm font-bold ${!isSidebarOpen ? 'lg:hidden' : 'block animate-in fade-in duration-200'}`}>Profil Pasien</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}