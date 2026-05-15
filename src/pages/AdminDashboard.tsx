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
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');
  const [servicesTab, setServicesTab] = useState<'departments' | 'schedules'>('departments');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [selectedScheduleDeptFilter, setSelectedScheduleDeptFilter] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptFormMode, setDeptFormMode] = useState<'add' | 'edit'>('add');
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [deptFormData, setDeptFormData] = useState({ name: '', code: '', description: '' });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormMode, setScheduleFormMode] = useState<'add' | 'edit'>('add');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [scheduleFormData, setScheduleFormData] = useState({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 });

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

  useEffect(() => {
    if (activeView === 'services' && servicesTab === 'schedules') {
      const fetchSchedules = async () => {
        setIsLoadingSchedules(true);
        try {
          const response = await apiClient.get('/schedules');
          setSchedules(response.data.data || []);
        } catch (error: any) {
          console.error('Gagal memuat schedules:', error);
          setSchedules([]);
        } finally {
          setIsLoadingSchedules(false);
        }
      };
      fetchSchedules();
    }
  }, [activeView, servicesTab]);

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

  const handleOpenDeptModal = (mode: 'add' | 'edit', dept?: any) => {
    setDeptFormMode(mode);
    if (mode === 'edit' && dept) {
      setSelectedDept(dept);
      setDeptFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    } else {
      setDeptFormData({ name: '', code: '', description: '' });
    }
    setIsDeptModalOpen(true);
  };

  const handleCloseDeptModal = () => {
    setIsDeptModalOpen(false);
    setSelectedDept(null);
    setDeptFormData({ name: '', code: '', description: '' });
  };

  const handleSaveDept = async () => {
    if (!deptFormData.name || !deptFormData.code) {
      alert('Nama dan kode departemen harus diisi');
      return;
    }

    try {
      if (deptFormMode === 'add') {
        await apiClient.post('/departments', deptFormData);
        alert('Departemen berhasil ditambahkan!');
      } else {
        await apiClient.patch(`/departments/${selectedDept.id}`, deptFormData);
        alert('Departemen berhasil diperbarui!');
      }
      handleCloseDeptModal();
      const response = await apiClient.get('/departments');
      fetchDepartments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan departemen.');
    }
  };

  const handleDeleteDept = async (deptId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus departemen ini?')) return;

    try {
      await apiClient.delete(`/departments/${deptId}`);
      alert('Departemen berhasil dihapus!');
      const response = await apiClient.get('/departments');
      fetchDepartments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus departemen.');
    }
  };

  const handleOpenScheduleModal = (mode: 'add' | 'edit', schedule?: any) => {
    setScheduleFormMode(mode);
    if (mode === 'edit' && schedule) {
      setSelectedSchedule(schedule);
      setScheduleFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        capacity: schedule.capacity
      });
    } else {
      setScheduleFormData({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 });
    }
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedSchedule(null);
    setScheduleFormData({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleFormData.dayOfWeek || !scheduleFormData.startTime || !scheduleFormData.endTime) {
      alert('Hari, jam mulai, dan jam selesai harus diisi');
      return;
    }

    try {
      const payload = {
        doctorId: selectedDoctorFilter,
        dayOfWeek: scheduleFormData.dayOfWeek,
        startTime: scheduleFormData.startTime,
        endTime: scheduleFormData.endTime,
        capacity: Number(scheduleFormData.capacity),
        departmentId: selectedScheduleDeptFilter
      };

      if (scheduleFormMode === 'add') {
        await apiClient.post('/schedules', payload);
        alert('Jadwal berhasil ditambahkan!');
      } else {
        await apiClient.patch(`/schedules/${selectedSchedule.id}`, payload);
        alert('Jadwal berhasil diperbarui!');
      }
      handleCloseScheduleModal();
      const response = await apiClient.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal.');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await apiClient.delete(`/schedules/${scheduleId}`);
      alert('Jadwal berhasil dihapus!');
      const response = await apiClient.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus jadwal.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Command Center';
      case 'users_patient': return 'Manajemen Pengguna - Data Pasien';
      case 'users_doctor': return 'Manajemen Pengguna - Data Dokter Spesialis';
      case 'users_admin': return 'Manajemen Pengguna - Akses Administrator';
      case 'services': return 'Manajemen Layanan';
      case 'queues': return 'Manajemen Antrean';
      case 'appointments': return 'Manajemen Reservasi';
      default: return 'Administrator';
    }
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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeView === 'appointments' 
                ? 'bg-teal-500/20 text-teal-400 font-semibold' 
                : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              
              {/* KONTINER ANIMASI: Menggunakan style & class yang sama dengan Manajemen Pengguna */}
              <div 
                className="relative flex-1 overflow-hidden flex items-center"
                style={{ 
                  maskImage: 'linear-gradient(to right, black 95%, transparent 100%)', 
                  WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)' 
                }}
              >
                <span className="animate-marquee-custom whitespace-nowrap">
                  Manajemen Reservasi
                </span>
              </div>
            </div>
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

        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between"> 
          <div className="flex items-center">
            <h1 
              key={activeView} 
              className="text-lg font-bold text-zinc-950 font-['Manrope'] animate-in fade-in slide-in-from-left-4 duration-500"
            >
              {getPageTitle()}
            </h1>
          </div>
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
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Manajemen Layanan</h1>
                <p className="text-slate-600">Kelola departemen dan jadwal layanan poliklinik.</p>
              </div>

              <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setServicesTab('departments')}
                  className={`px-4 py-3 font-semibold text-sm transition-colors ${
                    servicesTab === 'departments'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manajemen Departemen
                </button>
                <button
                  onClick={() => setServicesTab('schedules')}
                  className={`px-4 py-3 font-semibold text-sm transition-colors ${
                    servicesTab === 'schedules'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manajemen Jadwal
                </button>
              </div>

              {servicesTab === 'departments' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-zinc-900">Daftar Departemen</h2>
                    <button onClick={() => handleOpenDeptModal('add')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      + Tambah Departemen
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="p-3 pl-0">Nama Departemen</th>
                          <th className="p-3">Kode</th>
                          <th className="p-3">Deskripsi</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-medium text-zinc-900 divide-y divide-slate-100">
                        {departments.map((dept: any) => (
                          <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 pl-0 font-semibold">{dept.name}</td>
                            <td className="p-3 font-mono text-xs bg-slate-50 px-2 py-1 rounded w-fit">{dept.code}</td>
                            <td className="p-3 text-slate-600 text-sm truncate max-w-xs">{dept.description || '-'}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenDeptModal('edit', dept)} className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button onClick={() => handleDeleteDept(dept.id)} className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Hapus">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {servicesTab === 'schedules' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Departemen</label>
                        <select
                          value={selectedScheduleDeptFilter}
                          onChange={(e) => {
                            setSelectedScheduleDeptFilter(e.target.value);
                            setSelectedDoctorFilter('');
                          }}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Pilih Departemen...</option>
                          {departments.map((dept: any) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Dokter</label>
                        <select
                          value={selectedDoctorFilter}
                          onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          disabled={!selectedScheduleDeptFilter}
                        >
                          <option value="">Pilih Dokter...</option>
                          {schedules
                            .filter((s: any) => s.departmentId === selectedScheduleDeptFilter)
                            .reduce((acc: any[], s: any) => {
                              if (!acc.find((d) => d.doctorId === s.doctorId)) {
                                acc.push(s);
                              }
                              return acc;
                            }, [])
                            .map((s: any) => (
                              <option key={s.doctorId} value={s.doctorId}>
                                {s.doctor?.user?.name || '-'}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {selectedDoctorFilter && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900">Jadwal Mingguan</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {schedules.find((s: any) => s.doctorId === selectedDoctorFilter)?.doctor?.user?.name} -
                            {schedules.find((s: any) => s.doctorId === selectedDoctorFilter)?.department?.name}
                          </p>
                        </div>
                        <button onClick={() => handleOpenScheduleModal('add')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          + Tambah Jadwal
                        </button>
                      </div>

                      {isLoadingSchedules ? (
                        <div className="flex justify-center py-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : schedules.filter((s: any) => s.doctorId === selectedDoctorFilter).length === 0 ? (
                        <div className="py-8 text-center text-slate-500 italic text-sm">Tidak ada jadwal untuk dokter ini</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="p-3 pl-0">Hari</th>
                                <th className="p-3">Jam Mulai</th>
                                <th className="p-3">Jam Selesai</th>
                                <th className="p-3">Kapasitas</th>
                                <th className="p-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm font-medium text-zinc-900 divide-y divide-slate-100">
                              {schedules
                                .filter((s: any) => s.doctorId === selectedDoctorFilter)
                                .sort((a: any, b: any) => {
                                  const dayOrder: Record<string, number> = {
                                    'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
                                    'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
                                  };
                                  return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
                                })
                                .map((schedule: any) => {
                                  const dayNames: Record<string, string> = {
                                    'MONDAY': 'Senin', 'TUESDAY': 'Selasa', 'WEDNESDAY': 'Rabu',
                                    'THURSDAY': 'Kamis', 'FRIDAY': 'Jumat', 'SATURDAY': 'Sabtu', 'SUNDAY': 'Minggu'
                                  };

                                  return (
                                    <tr key={schedule.id} className="hover:bg-slate-50/70 transition-colors">
                                      <td className="p-3 pl-0 font-semibold">{dayNames[schedule.dayOfWeek]}</td>
                                      <td className="p-3 font-mono text-sm">{schedule.startTime}</td>
                                      <td className="p-3 font-mono text-sm">{schedule.endTime}</td>
                                      <td className="p-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                          {schedule.capacity}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => handleOpenScheduleModal('edit', schedule)} className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                          <button onClick={() => handleDeleteSchedule(schedule.id)} className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Hapus">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </button>
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
                  )}
                </div>
              )}
            </div>
          )}
          {activeView === 'queues' && <AdminQueueManagement />}

          {activeView === 'appointments' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">
                  Daftar Reservasi Pasien
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Kelola dan perbarui status reservasi pasien di seluruh sistem RS Ethereal.
                </p>
              </div>

              {/* KOREKSI 1: Menghapus duplikasi div pembungkus yang menyebabkan Syntax Error */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                
                {/* AREA FILTER GANDA DENGAN GAYA FLOATING LABEL */}
                <div className="mb-6 flex items-center gap-4 flex-wrap">
                  
                  {/* 1. Dropdown Departemen */}
                  <div className="relative min-w-[240px]">
                    <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest z-10">
                      Filter Departemen
                    </label>
                    <select
                      value={selectedDepartmentFilter}
                      onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 text-zinc-700 text-sm font-semibold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer relative z-0"
                    >
                      <option value="">Semua Departemen</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 z-10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* 2. Dropdown Status */}
                  <div className="relative min-w-[240px]">
                    <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest z-10">
                      Status Reservasi
                    </label>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="appearance-none w-full bg-slate-50 border border-slate-200 text-zinc-700 text-sm font-semibold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer relative z-0"
                    >
                      <option value="">Semua Status</option>
                      <option value="BOOKED">Menunggu Konfirmasi</option>
                      <option value="CONFIRMED">Terkonfirmasi</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="CANCELLED">Dibatalkan</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 z-10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                </div>

                {isLoadingAppointments ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : appointments.filter((apt: any) => {
                    const matchDept = !selectedDepartmentFilter || apt.department?.id === selectedDepartmentFilter;
                    const matchStatus = !selectedStatusFilter || apt.status === selectedStatusFilter;
                    return matchDept && matchStatus;
                  }).length === 0 ? (
                  <div className="py-8 text-center text-slate-500 italic text-sm">
                    Tidak ada jadwal reservasi yang sesuai dengan filter.
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
                        {appointments
                          .filter((apt: any) => {
                            const matchDept = !selectedDepartmentFilter || apt.department?.id === selectedDepartmentFilter;
                            const matchStatus = !selectedStatusFilter || apt.status === selectedStatusFilter;
                            return matchDept && matchStatus;
                          })
                          .map((apt: any) => {

                            // KOREKSI 2: Menambahkan mapping pewarnaan label status (Reference Error fixed)
                            const statusClasses: Record<string, string> = {
                              'BOOKED': 'bg-amber-50 text-amber-600 border-amber-200',
                              'CONFIRMED': 'bg-blue-50 text-blue-600 border-blue-200',
                              'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
                              'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-200',
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

          {/* Modal Departemen */}
          {isDeptModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">
                  {deptFormMode === 'add' ? 'Tambah Departemen' : 'Edit Departemen'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Departemen</label>
                    <input
                      type="text"
                      value={deptFormData.name}
                      onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                      placeholder="Contoh: Poliklinik Umum"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Departemen</label>
                    <input
                      type="text"
                      value={deptFormData.code}
                      onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                      placeholder="Contoh: UMU"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                    <textarea
                      value={deptFormData.description}
                      onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                      placeholder="Deskripsi departemen"
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={handleCloseDeptModal}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveDept}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Schedule */}
          {isScheduleModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">
                  {scheduleFormMode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hari</label>
                    <select
                      value={scheduleFormData.dayOfWeek}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, dayOfWeek: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Pilih Hari...</option>
                      <option value="MONDAY">Senin</option>
                      <option value="TUESDAY">Selasa</option>
                      <option value="WEDNESDAY">Rabu</option>
                      <option value="THURSDAY">Kamis</option>
                      <option value="FRIDAY">Jumat</option>
                      <option value="SATURDAY">Sabtu</option>
                      <option value="SUNDAY">Minggu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Mulai</label>
                    <input
                      type="time"
                      value={scheduleFormData.startTime}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Selesai</label>
                    <input
                      type="time"
                      value={scheduleFormData.endTime}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kapasitas</label>
                    <input
                      type="number"
                      min="1"
                      value={scheduleFormData.capacity}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, capacity: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={handleCloseScheduleModal}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveSchedule}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
