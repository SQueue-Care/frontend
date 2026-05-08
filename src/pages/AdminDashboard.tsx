// src/pages/AdminDashboard.tsx
import { useState } from 'react';
import StatCard from '../components/StatCard';
import WaitTimeChart from '../components/WaitTimeChart';
import DepartmentWorkloadChart from '../components/DepartmentWorkloadChart';
import QueueManagementTable from '../components/QueueManagementTable';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    // Background slate-50 yang sama persis dengan pasien, namun struktur flex untuk sidebar permanen
    <div className="min-h-screen bg-slate-50 font-['Inter'] flex">
      
      {/* ========================================== */}
      {/* 1. SIDEBAR PERMANEN (Khusus Admin) */}
      {/* ========================================== */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-50">
        {/* Header Sidebar (Sama dengan pasien) */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="10" x2="18" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
              <circle cx="17" cy="16" r="2.5" />
              <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
            </svg>
            <span className="text-teal-700 text-lg font-extrabold font-['Manrope'] tracking-wide">Ethereal<span className="text-slate-900">Admin</span></span>
          </div>
        </div>

        {/* Menu Navigasi Admin */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <button className="w-full text-left flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-semibold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Command Center
          </button>
          <button className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-zinc-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Manajemen Antrean
          </button>
          <button className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-zinc-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Analitik Performa
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. AREA KONTEN UTAMA (Kanan) */}
      {/* ========================================== */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Navbar Atas Admin */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          
          {/* Pencarian Global Admin */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pasien, Nama Dokter, atau Poli..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-zinc-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400" 
            />
          </div>

          {/* Profil & Notifikasi Admin */}
          <div className="flex items-center gap-5 pl-4">
            {/* Bel Notifikasi Merah */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-zinc-900 leading-none mb-1">Dr. Hendra</span>
                <span className="text-[11px] font-semibold text-teal-600 tracking-wide uppercase">Kepala Operasional</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-200 overflow-hidden flex-shrink-0">
                <img src="https://placehold.co/100x100/14b8a6/ffffff?text=H" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Ruang Kanvas Utama */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">Overview Antrean Hari Ini</h1>
              <p className="text-slate-500 text-sm font-medium">Pantau metrik operasional seluruh poliklinik secara real-time.</p>
            </div>
            
            {/* Filter Departemen (Aktivitas 9) */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20">Semua Poli</button>
              <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-lg transition-colors">Umum</button>
              <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-lg transition-colors">Gigi</button>
              <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-50 rounded-lg transition-colors">Anak</button>
            </div>
          </div>

          {/* 4 Kartu Statistik Utama (Aktivitas 2 & 10) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Pasien" 
              value="1,284" 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
              trend={{ value: "12%", isPositive: true }}
              description="Dibandingkan kemarin"
            />
            <StatCard 
              title="Rata-rata Waktu Tunggu" 
              value="24 Menit" 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              trend={{ value: "4m", isPositive: false }}
              description="Lebih lambat dari rata-rata"
            />
            <StatCard 
              title="Antrean Aktif" 
              value="42" 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
              description="Pasien menunggu saat ini"
            />
            <StatCard 
              title="Kepuasan Pasien" 
              value="4.8/5" 
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              trend={{ value: "0.2", isPositive: true }}
              description="Rating layanan bulan ini"
            />
          </div>

          {/* Area Grafik (Fase 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Card Line Chart */}
             <div className="lg:col-span-2 min-h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-extrabold text-zinc-950 font-['Manrope']">Analitik Waktu Tunggu</h3>
                  <select className="text-xs font-bold bg-slate-50 border-slate-200 rounded-lg focus:ring-teal-500 text-slate-600 px-3 py-1.5 cursor-pointer outline-none">
                    <option>Hari Ini</option>
                    <option>7 Hari Terakhir</option>
                    <option>30 Hari Terakhir</option>
                  </select>
                </div>
                {/* Memanggil komponen Line Chart */}
                <div className="flex-1">
                  <WaitTimeChart />
                </div>
             </div>
             
             {/* Card Doughnut Chart */}
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <h3 className="font-extrabold text-zinc-950 font-['Manrope'] mb-6">Beban Kerja Departemen</h3>
                {/* Memanggil komponen Doughnut Chart */}
                <div className="flex-1 flex items-center justify-center">
                  <DepartmentWorkloadChart />
                </div>
             </div>
          </div>
          {/* Area Grafik (Fase 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* ... (kode Line Chart dan Doughnut Chart tetap seperti sebelumnya) ... */}
          </div>

          {/* Area Tabel Kendali (Fase 3) ditambahkan di sini */}
          <div className="mt-8">
            <QueueManagementTable />
          </div>

        </main>
      </div>
    </div>
  );
}