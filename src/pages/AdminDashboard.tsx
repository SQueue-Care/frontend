// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TotalPatientsStat from '../components/TotalPatientsStat';
import ActiveQueuesStat from '../components/ActiveQueuesStat';
import WaitTimeStat from '../components/WaitTimeStat';
import DepartmentWorkloadChart from '../components/DepartmentWorkloadChart';
import QueueManagementTable from '../components/QueueManagementTable';
import AdminUserManagement from '../components/AdminUserManagement';
import AdminQueueManagement from '../components/AdminQueueManagement';
import { useAuthStore } from '../store/authStore';
import { useDepartmentStore } from '../store/departmentStore'; 
import { useQueueStore } from '../store/queueStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore';
import apiClient from '../lib/apiClient';


type AdminView = 'dashboard' | 'users' | 'queues' | 'appointments' | 'users_patient' | 'users_doctor' | 'users_admin' | 'services';

// Komponen Tabel Pengguna Dinamis
// Komponen Tabel Pengguna Dinamis dengan Integrasi API
function UserTable({ role, title }: { role: 'PATIENT' | 'DOCTOR' | 'ADMIN', title: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // LOGIKA 1: Deklarasi State yang Hilang (Penyebab Layar Putih)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: role,
    specialization: '',
    nik: ''
  });

  // LOGIKA 2: Fungsi Pengambilan Data dengan Filter Role yang Ketat
  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '/users';
      if (role === 'PATIENT') endpoint = '/patients';
      if (role === 'DOCTOR') endpoint = '/doctors';
      
      const response = await apiClient.get(endpoint);
      let result = response.data.data || [];
      
      // KOREKSI: Pastikan filter hanya mengambil role yang sesuai
      // Terutama untuk Admin yang mengambil dari endpoint /users
      if (endpoint === '/users') {
        result = result.filter((u: any) => u.role === role);
      }
      
      setData(result);
    } catch (error) {
      console.error(`Gagal sinkronisasi data ${role}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Reset form saat berpindah submenu agar data tidak bocor
    setFormData({ name: '', email: '', password: '', role: role, specialization: '', nik: '' });
  }, [role]);

  // LOGIKA 3: Integrasi Fungsi Simpan (Tambah User)
  // LOGIKA 3: Integrasi Fungsi Simpan (Revisi Payload Builder)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // PERHATIAN: Jika masih gagal, ubah endpoint ini secara mutlak menjadi '/auth/register' untuk semua role.
      let endpoint = '/auth/register'; 
      if (role === 'DOCTOR') endpoint = '/doctors';
      if (role === 'PATIENT') endpoint = '/patients';

      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      };

      if (role === 'DOCTOR') payload.specialization = formData.specialization;
      
      // KOREKSI MUTLAK: Hanya kirim NIK ke backend JIKA input tidak kosong.
      // Mengirim nik: "" akan langsung memicu error 400 Bad Request.
      if (role === 'PATIENT' && formData.nik && formData.nik.trim() !== '') {
        payload.nik = formData.nik;
      }

      await apiClient.post(endpoint, payload);
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: role, specialization: '', nik: '' });
      fetchData(); 
      alert(`Berhasil mendaftarkan ${role} baru!`);
    } catch (error: any) {
      // LOGIKA DEBUGGING PRESISI:
      // Menangkap pesan spesifik dari backend (contoh: "email already exists" atau "nik must be 16 chars")
      const backendResponse = error.response?.data;
      const specificError = backendResponse?.message || backendResponse?.error || "Validasi payload gagal.";
      
      console.error("Detail Penolakan 400 Bad Request:", backendResponse);
      alert("Gagal membuat akun: " + (typeof specificError === 'object' ? JSON.stringify(specificError) : specificError));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">{title}</h2>
          <p className="text-slate-500 text-sm font-medium">Manajemen kredensial dan hak akses untuk unit {role}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          + Tambah {role} Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <input 
            type="text" 
            placeholder={`Cari ${title.toLowerCase()}...`}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 text-center">
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Registrasi {role}</h3>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">Input Kredensial Baru</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Email</label>
                  <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kata Sandi</label>
                  <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>

                {/* Field Khusus Dokter */}
                {role === 'DOCTOR' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spesialisasi</label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                )}

                {/* Field Khusus Pasien (Sifat: Opsional) */}
                {role === 'PATIENT' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Nomor Induk Kependudukan (NIK) - <span className="text-slate-300">Opsional</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                      value={formData.nik} 
                      onChange={(e) => setFormData({...formData, nik: e.target.value})} 
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">Simpan Akun</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-5 pl-8">Identitas Pengguna</th>
              <th className="p-5">Hak Akses</th>
              <th className="p-5">Status Akun</th>
              <th className="p-5 text-right pr-8">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 animate-pulse font-bold">Sinkronisasi Database...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Belum ada data {role.toLowerCase()} ditemukan.</td></tr>
            ) : (
              data.map((item: any) => {
                const userObj = item.user || item; 
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="font-extrabold text-zinc-950 uppercase group-hover:text-teal-600 transition-colors">{userObj.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{userObj.email}</div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                        {role}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${
                        userObj.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {userObj.isActive !== false ? 'Aktif' : 'Blokir'}
                      </span>
                    </td>
                    <td className="p-5 text-right pr-8">
                      <button className="text-teal-600 hover:text-teal-700 font-bold text-xs uppercase tracking-tighter">Kelola</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { departments, fetchDepartments } = useDepartmentStore();
  const { fetchOverviewStats, fetchQueues } = useQueueStore();
  const { selectedDepartment, setSelectedDepartment } = useDashboardFilterStore();

  useEffect(() => {
    fetchDepartments();
    fetchOverviewStats();
    fetchQueues();
  }, [fetchDepartments, fetchOverviewStats, fetchQueues]);

  useEffect(() => {
    if (activeView === 'appointments') {
      const fetchAppointments = async () => {
        setIsLoadingAppointments(true);
        try {
          const response = await apiClient.get('/appointments');
          setAppointments(response.data.data || []);
        } catch (error: any) {
          console.error('Gagal memuat appointments:', error);
          setAppointments([]);
        } finally {
          setIsLoadingAppointments(false);
        }
      };
      fetchAppointments();
    }
  }, [activeView]);

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/appointments/${appointmentId}`, { status: newStatus });
      const response = await apiClient.get('/appointments');
      setAppointments(response.data.data || []);
      alert('Status appointment berhasil diperbarui!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status appointment.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] flex">

      {/* ========================================== */}
      {/* 1. SIDEBAR PERMANEN (Khusus Admin) */}
      {/* ========================================== */}
      <aside className="hidden md:flex w-64 bg-gradient-to-br from-teal-900 to-slate-900 border-r border-slate-800 flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="10" x2="18" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
              <circle cx="17" cy="16" r="2.5" />
              <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
            </svg>
            <span className="text-white text-lg font-extrabold font-['Manrope'] tracking-wide">Ethereal<span className="text-teal-400">Admin</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'dashboard' ? 'bg-teal-500/20 text-teal-400 font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Command Center
          </button>

          {/* MENU UTAMA: MANAJEMEN PENGGUNA */}
          <div className="flex flex-col gap-2">
            
            {/* INJEKSI CSS ANIMASI LOKAL */}
            <style>{`
              @keyframes auto-scroll-text {
                0%, 15% { transform: translateX(0); }
                45%, 55% { transform: translateX(-45px); } 
                85%, 100% { transform: translateX(0); }
              }
              .animate-marquee-custom {
                display: inline-block;
                animation: auto-scroll-text 5s ease-in-out infinite;
              }
            `}</style>

            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeView.startsWith('users_') 
                  ? 'bg-teal-500/20 text-teal-400 font-semibold' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                
                {/* KONTINER ANIMASI: Masking diposisikan untuk menjaga ukuran teks tetap default */}
                <div 
                  className="relative flex-1 overflow-hidden flex items-center"
                  style={{ 
                    maskImage: 'linear-gradient(to right, black 95%, transparent 100%)', 
                    WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' 
                  }}
                >
                  <span className="animate-marquee-custom whitespace-nowrap">
                    Manajemen Pengguna
                  </span>
                </div>
              </div>
              
              <svg 
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ml-2 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* SUB-MENU (Dihilangkan titiknya, disamakan padding/hover-nya, teks menjorok presisi dengan pl-12) */}
            {isUserMenuOpen && (
              <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => setActiveView('users_patient')}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 pl-10 rounded-xl transition-colors ${
                    activeView === 'users_patient' 
                      ? 'bg-teal-500/20 text-teal-400 font-semibold' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Daftar Pasien</span>
                </button>

                <button 
                  onClick={() => setActiveView('users_doctor')}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 pl-10 rounded-xl transition-colors ${
                    activeView === 'users_doctor' 
                      ? 'bg-teal-500/20 text-teal-400 font-semibold' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  {/* Ikon Stetoskop Baru: Lebih detail dan proporsional */}
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                    <circle cx="20" cy="10" r="2" />
                  </svg>
                  <span>Daftar Dokter</span>
                </button>

                <button 
                  onClick={() => setActiveView('users_admin')}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 pl-10 rounded-xl transition-colors ${
                    activeView === 'users_admin' 
                      ? 'bg-teal-500/20 text-teal-400 font-semibold' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  {/* Ikon Admin: Orang dengan Headset Support */}
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4z" />
                    <path d="M3 19a2 2 0 0 0 2 2h1v-6H3v4z" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                  <span>Administrator</span>
                </button>
              </div>
            )}
          </div>
          {/* Layanan & Jadwal  */}
          <button 
            onClick={() => setActiveView('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeView === 'services' ? 'bg-teal-500/20 text-teal-400 font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Manajemen Layanan</span>
          </button>
          <button
            onClick={() => setActiveView('queues')}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'queues' ? 'bg-teal-500/20 text-teal-400 font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Manajemen Antrean
          </button>
          <button
            onClick={() => setActiveView('appointments')}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'appointments' ? 'bg-teal-500/20 text-teal-400 font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Manajemen Reservasi
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. AREA KONTEN UTAMA (Kanan) */}
      {/* ========================================== */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-end">
          <div className="flex items-center gap-5 pl-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-zinc-900 leading-none mb-1">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[11px] font-semibold text-teal-600 tracking-wide uppercase">
                  {user?.role || 'Admin'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                 <span className="text-teal-700 font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          {activeView === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">Overview Antrean Hari Ini</h1>
                  <p className="text-slate-500 text-sm font-medium">Pantau metrik operasional seluruh poliklinik secara real-time.</p>
                </div>

                {/* Dropdown Poli */}
                <div className="w-full md:w-64 relative group">
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-zinc-800 text-sm font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 hover:border-teal-300 block w-full px-4 py-2.5 shadow-sm transition-all cursor-pointer relative z-10"
                  >
                    <option value="">Semua Poliklinik</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-hover:text-teal-500 transition-colors z-20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <TotalPatientsStat />
                <WaitTimeStat />
                <ActiveQueuesStat />
                <StatCard 
                  title="Kepuasan Pasien" 
                  value="4.8/5" 
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  trend={{ value: "0.2", isPositive: true }}
                  description="Rating layanan bulan ini"
                />
              </div>

              {/* AREA GRAFIK (Grid Layout Rasio 2:1) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                 
                 {/* GRAFIK 1: Analitik Performa Antrean (Mengambil 2/3 Ruang) */}
                 <div className="lg:col-span-2 min-h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-300 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-extrabold text-zinc-950 font-['Manrope']">Analitik Performa Antrean</h3>
                      <select className="text-xs font-bold bg-slate-50 border-slate-200 rounded-lg focus:ring-teal-500 text-slate-600 px-3 py-1.5 cursor-pointer outline-none transition-colors">
                        <option>Hari Ini</option>
                        <option>7 Hari Terakhir</option>
                        <option>30 Hari Terakhir</option>
                      </select>
                    </div>
                    <div className="flex-1 items-center justify-center flex">
                      <p className="text-sm text-slate-400 italic">Grafik performa akan ditampilkan di sini.</p>
                    </div>
                 </div>

                 {/* GRAFIK 2: Beban Kerja Departemen (Mengambil 1/3 Ruang) */}
                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-300 p-6 flex flex-col">
                    <h3 className="font-extrabold text-zinc-950 font-['Manrope'] mb-6">Beban Kerja Departemen</h3>
                    <div className="flex-1 flex items-center justify-center">
                      <DepartmentWorkloadChart />
                    </div>
                 </div>
                 
              </div>

              <div>
                <QueueManagementTable />
              </div>
            </div>
          )}
          {activeView === 'users_patient' && <UserTable role="PATIENT" title="Data Pasien" />}
          {activeView === 'users_doctor' && <UserTable role="DOCTOR" title="Data Dokter Spesialis" />}
          {activeView === 'users_admin' && <UserTable role="ADMIN" title="Akses Administrator" />}        
          {activeView === 'services' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-zinc-900 font-['Manrope'] mb-2">Manajemen Layanan</h2>
              <p className="text-slate-500 text-sm font-medium">Modul pengelolaan Poliklinik sedang dalam tahap pengembangan (Under Construction).</p>
            </div>
          )}
          {activeView === 'queues' && <AdminQueueManagement />}

          {activeView === 'appointments' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Manajemen Reservasi</h1>
                <p className="text-slate-600">Kelola dan perbarui status reservasi pasien di seluruh sistem.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                {isLoadingAppointments ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 italic text-sm">
                    Tidak ada jadwal reservasi.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="p-3 pl-0">Nama Pasien</th>
                          <th className="p-3">Dokter</th>
                          <th className="p-3">Tanggal & Waktu</th>
                          <th className="p-3">No. Identitas</th>
                          <th className="p-3">Departemen</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-medium text-zinc-900 divide-y divide-slate-100">
                        {appointments.map((apt: any) => {
                          const statusClasses: Record<string, string> = {
                            'BOOKED': 'bg-blue-50 text-blue-700 border-blue-200',
                            'CONFIRMED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-200',
                            'COMPLETED': 'bg-slate-50 text-slate-600 border-slate-200',
                          };

                          const statusLabel: Record<string, string> = {
                            'BOOKED': 'Menunggu Konfirmasi',
                            'CONFIRMED': 'Terkonfirmasi',
                            'CANCELLED': 'Dibatalkan',
                            'COMPLETED': 'Selesai',
                          };

                          return (
                            <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3 pl-0 font-semibold">{apt.patient?.user?.name || '-'}</td>
                              <td className="p-3 text-sm text-slate-700">{apt.doctor?.user?.name || '-'}</td>
                              <td className="p-3 text-xs">
                                <div>{new Date(apt.scheduledAt).toLocaleDateString('id-ID', {
                                  year: '2-digit',
                                  month: 'short',
                                  day: '2-digit'
                                })}</div>
                                <div className="text-slate-500">{new Date(apt.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>
                              <td className="p-3 font-mono text-xs">{apt.patient?.nik || '-'}</td>
                              <td className="p-3 text-sm text-slate-700">{apt.department?.name || '-'}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${statusClasses[apt.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                  {statusLabel[apt.status] || apt.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  {apt.status === 'BOOKED' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateAppointmentStatus(apt.id, 'CONFIRMED')}
                                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                        title="Konfirmasi"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => handleUpdateAppointmentStatus(apt.id, 'CANCELLED')}
                                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                        title="Batalkan"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
