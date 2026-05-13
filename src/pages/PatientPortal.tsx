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
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'CANCELLED': 
      return 'bg-rose-50 text-rose-600 border-rose-200'; // Merah
    case 'DONE': 
      return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // Hijau
    case 'IN_PROGRESS':
    case 'CALLED': 
      return 'bg-amber-50 text-amber-600 border-amber-200'; // Kuning
    case 'WAITING': 
      return 'bg-blue-50 text-blue-600 border-blue-200'; // Biru
    case 'SKIPPED': 
      return 'bg-slate-50 text-slate-500 border-slate-200'; // Abu-abu
    default: 
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const getStatusBadgeText = (status: string) => {
  switch (status) {
    case 'CANCELLED': return 'Dibatalkan';
    case 'DONE': return 'Selesai';
    case 'IN_PROGRESS': return 'Sedang Diperiksa';
    case 'CALLED': return 'Dipanggil';
    case 'WAITING': return 'Menunggu / Reservasi';
    case 'SKIPPED': return 'Dilewati';
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
  const { patientHistory, fetchPatientHistory, isLoadingTable } = useQueueStore();

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
    if (patientId) {
      fetchPatientHistory(patientId);
    }
  }, [user, fetchPatientHistory]);

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

  useEffect(() => {
  const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
  if (activeView === 'history' && patientId) {
    fetchPatientHistory(patientId);
  }
}, [activeView, user, fetchPatientHistory]);

  // Fetch profil HANYA SATU KALI dengan prioritas ID Pasien
  useEffect(() => {
    const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
    if (activeView === 'profile' && patientId) {
      fetchProfile(patientId);
    }
  }, [activeView, user, fetchProfile]);

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

        {/* TAMPILAN 2: RIWAYAT ANTREAN (Dinamis) */}
        {activeView === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2">Riwayat Antrean</h1>
              <p className="text-slate-600">Pantau tiket antrean aktif dan riwayat kunjungan Anda sebelumnya.</p>
            </div>
            
            {isLoadingTable ? (
              <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Memuat riwayat kunjungan...</div>
            ) : patientHistory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Belum Ada Riwayat</h3>
                <p className="text-slate-500 mt-1">Anda belum pernah melakukan pendaftaran antrean.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientHistory.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-5">
                    
                    {/* Kolom 1: Nomor & Layanan (Kiri) */}
                    <div className="flex items-center gap-4 flex-[2]">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-teal-50 transition-colors shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1 group-hover:text-teal-600">No</span>
                        <span className="text-lg font-black text-zinc-900 leading-none group-hover:text-teal-700">
                          {item.department?.code || 'XX'}-{item.queueNumber}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-sm md:text-base leading-tight">
                          {item.department?.name}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                          {item.doctor?.user?.name || 'Dokter Umum'}
                        </p>
                      </div>
                    </div>

                    {/* Kolom 2: Tanggal & Waktu (Tengah) */}
                    <div className="flex-[1.5] border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Tanggal Kunjungan
                      </span>
                      <span className="block text-sm font-bold text-zinc-800">
                        {new Date(item.queueDate).toLocaleDateString('id-ID', { 
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </span>
                    </div>

                    {/* Kolom 3: Status (Kanan) */}
                    <div className="flex-[1] flex md:justify-end w-full md:w-auto">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border w-full md:w-auto text-center ${getStatusBadgeStyle(item.status)}`}>
                        {getStatusBadgeText(item.status)}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAMPILAN 3: PROFIL PASIEN */}
        {activeView === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2">Profil Pasien</h1>
              <p className="text-slate-600">Kelola data rekam medis dan informasi pribadi Anda.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl">
              {isProfileLoading ? (
                <div className="text-center py-10 text-slate-500 font-medium">Memuat data profil...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-4xl font-bold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-zinc-900">{user?.name || 'Nama Pasien'}</h2>
                        <p className="text-slate-500 font-medium">{user?.email || 'email@contoh.com'}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">Terverifikasi</span>
                      </div>
                    </div>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                        Edit Profil
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
                        <input type="text" maxLength={16} disabled={!isEditing} value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-60" placeholder="16 Digit NIK" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nomor BPJS</label>
                        <input type="text" disabled={!isEditing} value={formData.bpjsNumber} onChange={(e) => setFormData({...formData, bpjsNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-60" placeholder="Nomor BPJS Kesehatan" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Telepon</label>
                        <input type="tel" disabled={!isEditing} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-60" placeholder="08123456789" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                        <select disabled={!isEditing} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-60">
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="MALE">Laki-laki</option>
                          <option value="FEMALE">Perempuan</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                        <input type="date" disabled={!isEditing} value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-60" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                        <textarea disabled={!isEditing} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-60" placeholder="Alamat domisili saat ini"></textarea>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-sm transition-colors">
                          Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-white bg-teal-600 hover:bg-teal-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
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
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        // Saran Rekayasa: Properti ini akan menangkap ID dari BookingPanel dan menyalakannya di Live Tracker
        onBookingSuccess={(queueId) => {
          setActiveQueueId(queueId);
          setActiveView('polyclinics'); // Memaksa UI kembali ke halaman utama untuk melihat tracker
        }}
      />
    </div>
  );
}