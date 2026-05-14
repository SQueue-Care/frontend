// src/pages/PatientPortal.tsx
import { useState, useEffect } from 'react';
import PolyclinicCard from '../components/PolyclinicCard';
import BookingPanel from '../components/BookingPanel';
import LiveQueueTracker from '../components/LiveQueueTracker';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDepartmentStore } from '../store/departmentStore';
import { usePatientStore } from '../store/patientStore';
import { useQueueStore } from '../store/queueStore';

// 1. Deklarasi Tipe
type PortalView = 'polyclinics' | 'history' | 'profile';

// Helper untuk menerjemahkan status dan warna (Tambahkan di luar fungsi komponen utama)
const getHistoryStatusStyle = (status: string) => {
  switch (status) {
    case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200'; // Merah
    case 'DONE': return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // Hijau
    case 'IN_PROGRESS':
    case 'CALLED': return 'bg-amber-50 text-amber-600 border-amber-200'; // Kuning
    case 'WAITING': return 'bg-blue-50 text-blue-600 border-blue-200'; // Biru
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const getHistoryStatusText = (status: string) => {
  switch (status) {
    case 'CANCELLED': return 'Dibatalkan';
    case 'DONE': return 'Selesai';
    case 'IN_PROGRESS': return 'Sedang Diperiksa';
    case 'CALLED': return 'Dipanggil';
    case 'WAITING': return 'Menunggu / Reservasi';
    default: return status;
  }
};

// Helper untuk status Appointment (Reservasi)
const getAppointmentStatusStyle = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const getAppointmentStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Menunggu Konfirmasi';
    case 'CONFIRMED': return 'Terkonfirmasi';
    case 'CANCELLED': return 'Dibatalkan';
    case 'COMPLETED': return 'Selesai';
    default: return status;
  }
};

export default function PatientPortal() {
  // ==========================================
  // 2. STATE LOKAL (useState)
  // ==========================================
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<PortalView>('polyclinics');
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nik: '', bpjsNumber: '', phone: '', gender: '', birthDate: '', address: ''
  });

  // ==========================================
  // 3. STORE & ROUTER (Zustand & React Router)
  // ==========================================
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { departments, isLoading: isDeptLoading, fetchDepartments } = useDepartmentStore();
  const { profile, fetchProfile, updateProfile, isLoading: isProfileLoading, isSaving } = usePatientStore();
  const { 
    patientHistory, fetchPatientHistory, isLoadingTable,
    patientAppointments, fetchPatientAppointments, isLoadingAppointments 
  } = useQueueStore();

  // ==========================================
  // 4. EFEK SAMPING (useEffect)
  // ==========================================
  // Fetch departemen saat komponen pertama kali dimuat
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Fetch antrian aktif saat user pertama kali load page
  useEffect(() => {
    const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
    if (activeView === 'history' && patientId) {
      fetchPatientHistory(patientId);
      // TAMBAHKAN INI: Memanggil data booking/appointment
      fetchPatientAppointments(patientId); 
    }
  }, [activeView, user, fetchPatientHistory, fetchPatientAppointments]);

  // Set activeQueueId jika ada antrian aktif (WAITING/CALLED/IN_PROGRESS)
  useEffect(() => {
    if (patientHistory && patientHistory.length > 0) {
      const activeQueue = patientHistory.find(q => 
        ['WAITING', 'CALLED', 'IN_PROGRESS'].includes(q.status)
      );
      if (activeQueue) {
        setActiveQueueId(activeQueue.id);
      } else {
        setActiveQueueId(null);
      }
    } else {
      setActiveQueueId(null);
    }
  }, [patientHistory]);

  // Fetch profil HANYA SATU KALI dengan prioritas ID Pasien
  useEffect(() => {
    const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
    if (patientId) { // Dihapus: pengecekan activeView === 'profile'
      fetchProfile(patientId);
    }
  }, [user, fetchProfile]);

  // Isi formulir jika data profil berhasil diambil
  useEffect(() => {
    if (profile) {
      setFormData({
        nik: profile.nik || '',
        bpjsNumber: profile.bpjsNumber || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  // ==========================================
  // 5. KALKULASI DATA (Derived State)
  // ==========================================
  const mappedPolyclinics = departments.map((dept, index) => {
    const colors = ['rose', 'amber', 'emerald', 'blue', 'indigo', 'purple'];
    const assignedColor = colors[index % colors.length];

    return {
      id: dept.id,
      name: dept.name,
      description: dept.description || 'Tidak ada deskripsi tersedia.',
      status: 'Normal / Sedang', // Placeholder statis sampai AI aktif
      percentage: '50%', // Placeholder statis sampai AI aktif
      color: assignedColor
    };
  });

  const filteredPolyclinics = mappedPolyclinics.filter((poli) =>
    poli.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poli.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // 6. FUNGSI HANDLER
  // ==========================================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
    
    if (!patientId) {
      alert("Gagal mengidentifikasi ID Pasien pada sesi Anda.");
      return;
    }
    
    try {
      const payload = {
        nik: formData.nik || undefined,
        bpjsNumber: formData.bpjsNumber || undefined,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        address: formData.address || undefined,
      };
      
      await updateProfile(patientId, payload);
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
    } catch (err: any) {
      const responseData = err.response?.data;
      let errorMessage = "Terjadi kesalahan saat menyimpan profil.";

      // Fungsi internal untuk menerjemahkan error Zod ke Bahasa Indonesia
      const translateError = (path: string, code: string, fallbackMessage: string) => {
        if (path === 'nik') {
          if (code === 'too_small') return "NIK harus terdiri dari 16 digit.";
          if (code === 'too_big') return "NIK tidak boleh lebih dari 16 digit.";
        }
        if (path === 'phone') {
          return "Format nomor telepon tidak valid.";
        }
        if (path === 'birthDate') {
          return "Format tanggal lahir tidak valid.";
        }
        // Jika tidak ada pemetaan khusus, gunakan pesan format default yang dirapikan
        return `Format pada isian ${path.toUpperCase()} tidak sesuai.`;
      };

      if (responseData?.status === "error" && responseData?.error?.details) {
        const details = responseData.error.details;
        
        if (Array.isArray(details)) {
          // Petakan setiap error teknis menggunakan fungsi translateError
          errorMessage = details.map((d: any) => 
            `- ${translateError(d.path, d.code, d.message)}`
          ).join('\n');
        }
      } else if (responseData?.error?.message) {
        errorMessage = responseData.error.message;
      }

      alert(`Gagal Memperbarui Profil:\n\n${errorMessage}`);
    }
  };

  const handleNavigation = (view: PortalView) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const openBooking = (deptId: string, deptName: string) => {
    setSelectedDept({ id: deptId, name: deptName });
    setBookingStep(1); 
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setTimeout(() => {
      setBookingStep(1);
      setSelectedDept(null);
    }, 500); 
  };

  const handleNextStep = () => setBookingStep((prev) => prev + 1);
  const handlePrevStep = () => setBookingStep((prev) => prev - 1);
  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] relative">
      
      {/* ========================================== */}
      {/* 1. SIDEBAR & OVERLAY */}
      {/* ========================================== */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
        onClick={toggleSidebar}
      />

      <aside className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-br from-teal-900 to-slate-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="10" x2="18" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
              <circle cx="17" cy="16" r="2.5" />
              <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
            </svg>
            <span className="text-white text-lg font-extrabold font-['Manrope'] tracking-wide">RS Ethereal</span>
          </div>
          <button onClick={toggleSidebar} className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <button 
            onClick={() => handleNavigation('polyclinics')} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeView === 'polyclinics' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Pilih Poliklinik
          </button>
          
          <button 
            onClick={() => handleNavigation('history')} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeView === 'history' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Riwayat Antrean
          </button>

          <button 
            onClick={() => handleNavigation('profile')} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeView === 'profile' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profil Pasien
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Akun
          </button>
        </div>
      </aside>

      <div className="fixed w-96 h-96 -top-48 -left-48 bg-teal-100 rounded-full blur-[120px] opacity-60" />
      <div className="fixed w-96 h-96 -bottom-48 -right-48 bg-blue-100 rounded-full blur-[120px] opacity-60" />

      {/* ========================================== */}
      {/* 2. NAVBAR ATAS (Tema Gelap Transparan) */}
      {/* ========================================== */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex justify-between h-16 items-center gap-4">
            
            {/* BAGIAN KIRI: Tombol Sidebar & Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-teal-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="10" x2="18" y2="10" />
                  <line x1="8" y1="14" x2="12" y2="14" />
                  <circle cx="17" cy="16" r="2.5" />
                  <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
                </svg>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-teal-400 text-lg font-extrabold font-['Manrope'] tracking-wide">RS</span>
                  <span className="text-white text-lg font-extrabold font-['Manrope'] tracking-wide">Ethereal</span>
                </div>
              </div>
            </div>

            {/* BAGIAN KANAN: Profil User */}
            <div 
              onClick={() => handleNavigation('profile')}
              className="flex items-center gap-4 shrink-0 cursor-pointer group"
              title="Buka Profil"
            >
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-white leading-none mb-1 group-hover:text-teal-300 transition-colors">
                  {user?.name || 'Pengguna'}
                </span>
                <span className="text-[11px] font-semibold text-teal-400 tracking-wide uppercase">
                  {user?.role === 'PATIENT' ? 'Pasien' : user?.role}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/40 overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-teal-400 transition-all flex items-center justify-center">
                <span className="text-teal-300 font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* ========================================== */}
      {/* 3. KONTEN UTAMA */}
      {/* ========================================== */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 py-10 md:py-12">
        
        {/* TAMPILAN 1: PILIH POLIKLINIK */}
        {activeView === 'polyclinics' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header & Search Bar Baru */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="max-w-xl">
                <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2.5">Pilih Layanan Poliklinik</h1>
                <p className="text-slate-600 text-base leading-relaxed">Cek status keramaian poli secara <span className="font-semibold text-teal-700">real-time</span> sebelum mengambil nomor antrean.</p>
              </div>
              
              {/* Saran: Search bar dipindah ke sini agar lebih kontekstual dengan konten di bawahnya */}
              <div className="w-full md:w-80 relative shrink-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari poli..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400 shadow-sm" 
                />
              </div>
            </div>

            {/* CONDITIONAL RENDERING: Live Queue Tracker ATAU Empty State */}
            {activeQueueId ? (
              <LiveQueueTracker 
                queueId={activeQueueId} 
                onCancelSuccess={() => setActiveQueueId(null)} 
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Belum Ada Antrean Aktif</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">Anda belum mengambil tiket antrean hari ini. Silakan pilih layanan poliklinik di bawah ini untuk memulai sesi konsultasi.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tampilkan indikator loading jika data sedang diambil */}
          {isDeptLoading ? (
             <div className="col-span-full text-center py-10 font-bold text-slate-500">
               Memuat data layanan poliklinik...
             </div>
          ) : (
            filteredPolyclinics.map((poli) => (
              <PolyclinicCard
                key={poli.id} // Gunakan ID dari database
                name={poli.name}
                description={poli.description}
                status={poli.status}
                percentage={poli.percentage}
                colorClass={poli.color}
                onClick={() => openBooking(poli.id, poli.name)}
              />
            ))
          )}

              {filteredPolyclinics.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-1">Layanan tidak ditemukan</h3>
                  <p className="text-sm text-slate-500">Kami tidak dapat menemukan poliklinik dengan kata kunci "{searchQuery}".</p>
                </div>
              )}
            </div>
          </div>
        )}
            
        {/* TAMPILAN 2: RIWAYAT ANTREAN & RESERVASI (Detail Sinkron) */}
        {activeView === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            
            <div className="mb-2">
              <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2">Riwayat & Reservasi</h1>
              <p className="text-slate-600">Detail lengkap seluruh aktivitas kunjungan medis Anda.</p>
            </div>
            
            {/* TABEL 1: RESERVASI MENDATANG (Data Appointment) */}
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
                <div className="w-2 h-6 bg-teal-500 rounded-full" />
                Jadwal Reservasi Mendatang
              </h3>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="p-5 pl-8">Layanan & Dokter</th>
                        <th className="p-5">Waktu Kunjungan</th>
                        <th className="p-5">Catatan Keluhan</th>
                        <th className="p-5">Tgl. Daftar</th>
                        <th className="p-5 text-right pr-8">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium divide-y divide-slate-100">
                      {isLoadingAppointments ? (
                        <tr><td colSpan={5} className="p-12 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Menyinkronkan reservasi...</td></tr>
                      ) : patientAppointments.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">Tidak ada jadwal reservasi aktif.</td></tr>
                      ) : (
                        patientAppointments.map((apt: any) => (
                          <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-5 pl-8">
                              <div className="font-extrabold text-zinc-950 text-base">{apt?.department?.name || 'Poliklinik'}</div>
                              <div className="text-[10px] text-slate-400 font-black uppercase mt-1">{apt?.doctor?.user?.name || 'Dokter Umum'}</div>
                            </td>
                            <td className="p-5">
                              <div className="text-zinc-800 font-bold">
                                {new Date(apt.scheduledAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                              <div className="text-[10px] text-teal-600 font-black mt-1 uppercase">Sesi: {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                            </td>
                            <td className="p-5">
                              <div className="max-w-[200px] text-xs text-slate-600 italic font-medium leading-relaxed line-clamp-2" title={apt.notes}>
                                {apt.notes || "Tidak ada catatan."}
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="text-[11px] text-slate-500 font-bold">
                                {new Date(apt.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </td>
                            <td className="p-5 text-right pr-8">
                              <span className={`inline-flex px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getAppointmentStatusStyle(apt.status)}`}>
                                {getAppointmentStatusText(apt.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* TABEL 2: RIWAYAT ANTREAN (Data Queue) */}
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-500 rounded-full" />
                Riwayat Antrean Kunjungan
              </h3>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="p-5 pl-8 w-32">Nomor</th>
                        <th className="p-5">Layanan & Dokter</th>
                        <th className="p-5">Waktu Kunjungan</th>
                        <th className="p-5">Catatan Keluhan</th>
                        <th className="p-5">Tgl. Daftar</th>
                        <th className="p-5 text-right pr-8">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium divide-y divide-slate-100">
                      {isLoadingTable ? (
                        <tr><td colSpan={6} className="p-12 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Menyinkronkan riwayat...</td></tr>
                      ) : patientHistory.length === 0 ? (
                        <tr><td colSpan={6} className="p-12 text-center text-slate-400 italic">Tidak ada riwayat kunjungan.</td></tr>
                      ) : (
                        patientHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="p-5 pl-8">
                              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-black rounded-lg font-mono text-sm group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-200 transition-colors">
                                {item?.department?.code || 'XX'}-{item.queueNumber}
                              </span>
                            </td>
                            <td className="p-5">
                              <div className="font-extrabold text-zinc-950 text-base">{item?.department?.name || 'Poliklinik'}</div>
                              <div className="text-[10px] text-slate-400 font-black uppercase mt-1">{item?.doctor?.user?.name || 'Dokter Umum'}</div>
                            </td>
                            <td className="p-5">
                              <div className="text-zinc-800 font-bold">{new Date(item.queueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                              <div className="text-[10px] text-slate-400 font-black uppercase mt-1">Sesi: {new Date(item.queueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                            </td>
                            <td className="p-5">
                              <div className="max-w-[180px] text-xs text-slate-600 italic font-medium leading-relaxed line-clamp-2" title={item.notes}>
                                {item.notes || "Tidak ada catatan."}
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="text-[11px] text-slate-500 font-bold">
                                {new Date(item.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </td>
                            <td className="p-5 text-right pr-8">
                              <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border min-w-[140px] transition-colors ${getHistoryStatusStyle(item.status)}`}>
                                {getHistoryStatusText(item.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* TAMPILAN 3: PROFIL PASIEN (Premium Layout) */}
        {activeView === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2">Profil Pasien</h1>
              <p className="text-slate-600">Kelola identitas medis dan informasi kontak Anda.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm max-w-4xl overflow-hidden">
              {isProfileLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-bold animate-pulse">Menyinkronkan data rekam medis...</p>
                </div>
              ) : (
                <>
                  {/* Header Profil (Kartu Atas) */}
                  <div className="bg-gradient-to-r from-slate-50 to-white p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-teal-500 text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-teal-500/20">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center" title="Akun Aktif">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">{user?.name || 'Nama Pasien'}</h2>
                        <p className="text-slate-500 font-medium mb-2.5">{user?.email || 'email@contoh.com'}</p>
                        <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-lg uppercase tracking-widest">
                          Pasien Terverifikasi
                        </span>
                      </div>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="w-full md:w-auto px-6 py-3 bg-white text-zinc-900 border-2 border-slate-200 hover:border-teal-500 hover:text-teal-700 rounded-xl text-sm font-extrabold transition-all shadow-sm"
                      >
                        Edit Profil
                      </button>
                    )}
                  </div>

                  {/* Formulir Profil */}
                  <form onSubmit={handleSaveProfile} className="p-8">
                    
                    {/* Seksi 1: Identitas Pribadi */}
                    <div className="mb-8">
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5">Identitas Pribadi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Induk Kependudukan (NIK)</label>
                          {isEditing ? (
                            <input type="text" maxLength={16} value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all" placeholder="16 Digit NIK" />
                          ) : (
                            <div className="text-base font-bold text-zinc-900">{formData.nik || <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor BPJS (Opsional)</label>
                          {isEditing ? (
                            <input type="text" value={formData.bpjsNumber} onChange={(e) => setFormData({...formData, bpjsNumber: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all" placeholder="Nomor BPJS Kesehatan" />
                          ) : (
                            <div className="text-base font-bold text-zinc-900">{formData.bpjsNumber || <span className="text-slate-400 italic font-medium">Tidak ada BPJS</span>}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                          {isEditing ? (
                            <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all cursor-pointer">
                              <option value="">Pilih Jenis Kelamin</option>
                              <option value="MALE">Laki-laki</option>
                              <option value="FEMALE">Perempuan</option>
                            </select>
                          ) : (
                            <div className="text-base font-bold text-zinc-900">{formData.gender === 'MALE' ? 'Laki-laki' : formData.gender === 'FEMALE' ? 'Perempuan' : <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                          {isEditing ? (
                            <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all cursor-pointer" />
                          ) : (
                            <div className="text-base font-bold text-zinc-900">{formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seksi 2: Kontak & Domisili */}
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5">Kontak & Domisili</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor WhatsApp / Telepon</label>
                          {isEditing ? (
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all" placeholder="0812xxxxxxx" />
                          ) : (
                            <div className="text-base font-bold text-zinc-900">{formData.phone || <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap Saat Ini</label>
                          {isEditing ? (
                            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all resize-none" placeholder="Tuliskan nama jalan, RT/RW, dan kota..."></textarea>
                          ) : (
                            <div className="text-base font-bold text-zinc-900 leading-relaxed max-w-2xl">{formData.address || <span className="text-slate-400 italic font-medium">Alamat belum ditambahkan.</span>}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aksi Form (Hanya Muncul Saat Edit) */}
                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8 animate-in slide-in-from-bottom-2">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-extrabold rounded-xl text-sm transition-colors">
                          Batalkan
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-3.5 text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 font-extrabold rounded-xl text-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                          {isSaving ? (
                            <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg> Menyimpan Data...</>
                          ) : 'Simpan Profil'}
                        </button>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 4. BOOKING PANEL (REFACRORED) */}
      <BookingPanel 
        isOpen={isBookingOpen}
        onClose={closeBooking}
        step={bookingStep}
        selectedDept={selectedDept}
        // Teruskan data profil dari usePatientStore
        patientProfile={profile ? { 
          name: user?.name || '', 
          nik: profile.nik, 
          birthDate: profile.birthDate 
        } : null}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onBookingSuccess={(queueId) => {
          setActiveQueueId(queueId);
          setActiveView('polyclinics');
        }}
      />
    </div>
  );
}