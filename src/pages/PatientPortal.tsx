// src/pages/PatientPortal.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import PolyclinicCard from '../components/patient/PolyclinicCard';
import BookingPanel from '../components/patient/BookingPanel';
import LiveQueueTracker from '../components/patient/LiveQueueTracker';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDepartmentStore } from '../store/departmentStore';
import { usePatientStore } from '../store/patientStore';
import { useQueueStore } from '../store/queueStore';
import PatientSidebar from '../components/patient/PatientSidebar';
import PatientNavbar from '../components/patient/PatientNavbar';
import ReservationDetailPanel from '../components/patient/ReservationDetailPanel';
import QueueDetailPanel from '../components/patient/QueueDetailPanel'; 
import { useThemeStore } from '../store/themeStore';

type PortalView = 'dashboard' | 'polyclinics' | 'reservations' | 'queues' | 'profile';

const getHistoryStatusStyle = (status: string) => {
  switch (status) {
    case 'WAITING': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CALLED':
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'DONE':
    case 'SKIPPED':
    case 'CANCELLED': return 'bg-slate-50 text-slate-600 border-slate-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const getHistoryStatusText = (status: string) => {
  switch (status) {
    case 'WAITING': return 'Menunggu';
    case 'CALLED': return 'Giliran Anda';
    case 'IN_PROGRESS': return 'Diperiksa';
    case 'DONE': return 'Selesai';
    case 'SKIPPED': return 'Dilewati';
    case 'CANCELLED': return 'Dibatalkan';
    default: return status;
  }
};

// Helper untuk status Reservasi
const getAppointmentStatusStyle = (status: string) => {
  switch (status) {
    case 'BOOKED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CONFIRMED': return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'COMPLETED':
    case 'CANCELLED': return 'bg-slate-50 text-slate-600 border-slate-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const getAppointmentStatusText = (status: string) => {
  switch (status) {
    case 'BOOKED': return 'Menunggu Konfirmasi';
    case 'CONFIRMED': return 'Terkonfirmasi';
    case 'COMPLETED': return 'Selesai';
    case 'CANCELLED': return 'Dibatalkan';
    default: return status;
  }
};

const getDensityStatus = (activeCount: number = 0) => {
  // Asumsi kapasitas rasional maksimal 1 poli adalah 30 pasien per hari
  const maxCapacity = 30; 
  const percentage = Math.min(Math.round((activeCount / maxCapacity) * 100), 100);

  if (activeCount <= 10) {
    return { status: `${activeCount} Antrean (Sepi)`, color: 'emerald', percentage: `${percentage}%` };
  } else if (activeCount <= 18) {
    return { status: `${activeCount} Antrean (Sedang)`, color: 'amber', percentage: `${percentage}%` };
  } else {
    return { status: `${activeCount} Antrean (Ramai)`, color: 'rose', percentage: `${percentage}%` };
  }
};

export default function PatientPortal() {
  // ==========================================
  // 2. STATE LOKAL (useState)
  // ==========================================
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState<{ id: string, name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<PortalView>('dashboard');
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nik: '', bpjsNumber: '', phone: '', gender: '', birthDate: '', address: ''
  });
  const [isNikWarningOpen, setIsNikWarningOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<any>(null); 
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(false);


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
  const { addAppointmentId } = usePatientStore();
  const theme = useThemeStore((state) => state.theme);

  // ==========================================
  // 4. EFEK SAMPING (useEffect)
  // ==========================================
  // Fetch departemen saat komponen pertama kali dimuat
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Fetch antrian dan appointments saat user pertama kali load page
  useEffect(() => {
    const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
    if (patientId) {
      fetchPatientHistory(patientId);
      fetchPatientAppointments(patientId);
    }
  }, [user?.id, user?.patient?.id]);

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

  // Fetch profil saat user atau patient ID berubah
  useEffect(() => {
    const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
    if (patientId) {
      fetchProfile(patientId);
    }
  }, [user?.id, user?.patient?.id]);

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
  const mappedPolyclinics = departments.map((dept: any) => {
    // Fallback: Jika backend belum merespons activeQueueCount, nilai menjadi 0.
    // Jika Anda ingin menguji UI secara visual sebelum backend siap, 
    // ubah angka 0 menjadi: Math.floor(Math.random() * 25)
    const currentQueueCount = dept.activeQueueCount || 0; 
    
    // Injeksi nilai ke dalam algoritma kepadatan
    const density = getDensityStatus(currentQueueCount);

    return {
      id: dept.id,
      name: dept.name,
      description: dept.description || 'Tidak ada deskripsi tersedia.',
      status: density.status,
      percentage: density.percentage,
      color: density.color 
    };
  });

  const filteredPolyclinics = mappedPolyclinics.filter((poli) =>
    poli.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        birthDate: formData.birthDate ? `${formData.birthDate}T12:00:00.000Z` : undefined,
        address: formData.address || undefined,
      };

      await updateProfile(patientId, payload);
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
    } catch (err: any) {
      const responseData = err.response?.data;
      let errorMessage = "Terjadi kesalahan saat menyimpan profil.";

      // Fungsi internal untuk menerjemahkan error Zod ke Bahasa Indonesia
      const translateError = (path: string, code: string) => {
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
            `- ${translateError(d.path, d.code)}`
          ).join('\n');
        }
      } else if (responseData?.error?.message) {
        errorMessage = responseData.error.message;
      }

      alert(`Gagal Memperbarui Profil:\n\n${errorMessage}`);
    }
  };

  const executeCheckIn = async (appointmentId: string) => {
    try {
      const token = useAuthStore.getState().token; // Menarik token otentikasi
      
      // Lakukan panggilan ke endpoint backend yang baru kita buat
      // Sesuaikan URL jika base URL backend Anda berbeda
      const response = await axios.post(
        `http://localhost:5000/api/v1/appointments/${appointmentId}/check-in`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newQueue = response.data?.data;

      alert('Check-in berhasil! Anda telah dipindahkan ke Antrean Berjalan (Live Queue).');
      
      // 1. Tutup panel detail
      setIsDetailPanelOpen(false);
      
      // 2. Tarik ulang data mutakhir dari backend
      const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);
      if (patientId) {
        fetchPatientAppointments(patientId);
        fetchPatientHistory(patientId);
      }
      
      // 3. Arahkan pasien langsung ke halaman Live Queue
      if (newQueue?.id) {
        setActiveQueueId(newQueue.id);
      }
      setActiveView('polyclinics');

    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Terjadi kesalahan sistem saat check-in.';
      alert(`Gagal Melakukan Check-In:\n\n${errorMessage}`);
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
    // Validasi Mutlak: Cegat jika NIK kosong atau hanya spasi
    if (!profile?.nik || profile.nik.trim() === '') {
      setIsNikWarningOpen(true);
      return; // Hentikan eksekusi, panel booking tidak akan terbuka
    }

    // Jika NIK ada, lanjutkan proses normal
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
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      {/* Tambahkan dark:bg-slate-900 untuk melihat langsung perubahan warna latar saat di-toggle */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-['Inter'] relative transition-colors duration-500">

        {/* ========================================== */}
        {/* 1. MODULAR SIDEBAR & OVERLAY               */}
        {/* ========================================== */}
        <PatientSidebar 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeView={activeView}
          handleNavigation={handleNavigation}
          user={user}
          handleLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-[76px]">
          <div className="fixed w-96 h-96 -top-48 -left-48 bg-teal-100 rounded-full blur-[120px] opacity-60" />
          <div className="fixed w-96 h-96 -bottom-48 -right-48 bg-blue-100 rounded-full blur-[120px] opacity-60" />

            {/* ========================================== */}
            {/* 2. MODULAR NAVBAR ATAS                     */}
            {/* ========================================== */}
            <PatientNavbar 
              toggleSidebar={toggleSidebar} 
              activeView={activeView} 
            />

          {/* ========================================== */}
          {/* 3. KONTEN UTAMA */}
          {/* ========================================== */}
          <main className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-15 py-10 md:py-12 flex-1">

            {/* TAMPILAN 1: PILIH POLIKLINIK */}
            {activeView === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

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
                {/* LIVE QUEUE TRACKER & PROMOTIONAL BANNER */}
                <LiveQueueTracker
                    queueId={activeQueueId}
                    onCancelSuccess={() => setActiveQueueId(null)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Tampilkan indikator loading jika data sedang diambil */}
                  {isDeptLoading ? (
                    <div className="col-span-full text-center py-10 font-bold text-slate-500">
                      Memuat data layanan poliklinik...
                    </div>
                  ) : (
                    filteredPolyclinics.map((poli, index) => (
                      <div 
                        key={poli.id}
                        className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out"
                        style={{ 
                          animationDelay: `${index * 150}ms`,
                          animationFillMode: 'both'          
                        }}
                      >
                        <PolyclinicCard
                          name={poli.name}
                          description={poli.description}
                          status={poli.status}
                          percentage={poli.percentage}
                          colorClass={poli.color}
                          onClick={() => openBooking(poli.id, poli.name)}
                        />
                      </div>
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
            {activeView === 'polyclinics' && (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                <svg className="w-20 h-20 text-slate-300 animate-[spin_3s_linear_infinite] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Fitur Sedang Dibangun</h2>
                <p className="text-slate-500 max-w-md mx-auto">Halaman manajemen poliklinik ini sedang dalam tahap pengembangan teknis. Silakan kembali lagi nanti.</p>
              </div>
            )}

            {/* TAMPILAN 2A: HALAMAN JADWAL RESERVASI */}
            {activeView === 'reservations' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2">Jadwal Reservasi</h1>
                  <p className="text-slate-600 text-sm font-medium">Daftar pemesanan sesi konsultasi medis Anda yang telah terjadwal.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      
                      {/* KEPALA TABEL (DIKEMBALIKAN KE AWAL) */}
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="p-6 pl-8">Layanan & Dokter</th>
                          <th className="p-6">Waktu Kunjungan</th>
                          <th className="p-6">Catatan Keluhan</th>
                          <th className="p-6">Tgl. Daftar</th>
                          <th className="p-6 text-right pr-8">Status</th>
                        </tr>
                      </thead>
                      
                      <tbody className="text-sm divide-y divide-slate-100">
                        {isLoadingAppointments ? (
                          <tr><td colSpan={5} className="p-16 text-center animate-pulse text-teal-700 font-bold uppercase tracking-widest text-xs bg-slate-50/50">Menyinkronkan reservasi...</td></tr>
                        ) : patientAppointments.length === 0 ? (
                          <tr><td colSpan={5} className="p-16 text-center text-slate-400 italic font-medium bg-slate-50/50">Tidak ada jadwal reservasi aktif saat ini.</td></tr>
                        ) : (
                          patientAppointments.map((apt: any) => (
                            <tr 
                              key={apt.id} 
                              className="hover:bg-slate-50/80 transition-all duration-200 group cursor-pointer active:bg-slate-100/70"
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setIsDetailPanelOpen(true);
                              }}
                            >
                              <td className="p-6 pl-8 align-top">
                                <div className="font-extrabold text-zinc-900 text-base mb-1">{apt?.department?.name || 'Poliklinik'}</div>
                                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">{apt?.doctor?.user?.name || 'Dokter belum ditentukan'}</div>
                              </td>
                              <td className="p-6 align-top">
                                <div className="text-zinc-900 font-extrabold mb-1">
                                  {new Date(apt.scheduledAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                                  Sesi: {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </div>
                              </td>
                              <td className="p-6 align-top">
                                <div className="max-w-[220px] text-xs text-slate-500 font-medium leading-relaxed line-clamp-3" title={apt.notes}>
                                  {apt.notes || <span className="italic text-slate-400">Tidak ada catatan keluhan.</span>}
                                </div>
                              </td>
                              <td className="p-6 align-top">
                                <span className="text-xs text-slate-500 font-bold">{new Date(apt.createdAt).toLocaleDateString('id-ID')}</span>
                              </td>
                              <td className="p-6 text-right pr-8 align-top">
                                <span className={`inline-flex px-3.5 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest transition-colors ${getAppointmentStatusStyle(apt.status)}`}>
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
            )}

            {/* TAMPILAN 2B: HALAMAN NOMOR ANTREAN */}
            {activeView === 'queues' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter mb-2">Riwayat Kunjungan</h1>
                  <p className="text-slate-600 text-sm font-medium">Arsip rekam jejak pengambilan nomor antrean klinik Anda.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="p-6 pl-8">Layanan Medis</th>
                          <th className="p-6">Tgl. Kunjungan</th>
                          <th className="p-6">Jam Kunjungan</th>
                          <th className="p-6">Catatan Keluhan</th>
                          <th className="p-6 text-right pr-8">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {isLoadingTable ? (
                          <tr><td colSpan={5} className="p-16 text-center animate-pulse text-teal-700 font-bold uppercase tracking-widest text-xs bg-slate-50/50">Menyinkronkan riwayat...</td></tr>
                        ) : patientHistory.length === 0 ? (
                          <tr><td colSpan={5} className="p-16 text-center text-slate-400 italic font-medium bg-slate-50/50">Tidak ada riwayat kunjungan yang terekam.</td></tr>
                        ) : (
                          patientHistory.map((item) => (
                            <tr 
                              key={item.id} 
                              className="hover:bg-slate-50/80 transition-all duration-200 group cursor-pointer active:bg-slate-100/70"
                              onClick={() => {
                                setSelectedQueue(item);
                                setIsQueuePanelOpen(true);
                              }}
                            >
                              <td className="p-6 pl-8 align-top">
                                <div className="font-extrabold text-zinc-900 text-base mb-1">{item?.department?.name || 'Poliklinik'}</div>
                                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">{item?.doctor?.user?.name || 'Dokter belum ditentukan'}</div>
                              </td>
                              <td className="p-6 align-top">
                                <div className="text-zinc-900 font-extrabold">
                                  {new Date(item.queueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td className="p-6 align-top">
                                <div className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                                  {new Date(item.queueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </div>
                              </td>
                              <td className="p-6 align-top">
                                <div className="max-w-[200px] text-xs text-slate-500 font-medium leading-relaxed line-clamp-3" title={item.notes}>
                                  {item.notes || <span className="italic text-slate-400">Tidak ada catatan keluhan.</span>}
                                </div>
                              </td>
                              <td className="p-6 text-right pr-8 align-top">
                                <span className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border min-w-[120px] transition-colors ${getHistoryStatusStyle(item.status)}`}>
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
                                <input type="text" maxLength={16} value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all" placeholder="16 Digit NIK" />
                              ) : (
                                <div className="text-base font-bold text-zinc-900">{formData.nik || <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
                              )}
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor BPJS (Opsional)</label>
                              {isEditing ? (
                                <input type="text" value={formData.bpjsNumber} onChange={(e) => setFormData({ ...formData, bpjsNumber: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all" placeholder="Nomor BPJS Kesehatan" />
                              ) : (
                                <div className="text-base font-bold text-zinc-900">{formData.bpjsNumber || <span className="text-slate-400 italic font-medium">Tidak ada BPJS</span>}</div>
                              )}
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                              {isEditing ? (
                                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all cursor-pointer">
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
                                <input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all cursor-pointer" />
                              ) : (
                                <div className="text-base font-bold text-zinc-900">{formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
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
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all" placeholder="0812xxxxxxx" />
                              ) : (
                                <div className="text-base font-bold text-zinc-900">{formData.phone || <span className="text-slate-400 italic font-medium">Belum diatur</span>}</div>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap Saat Ini</label>
                              {isEditing ? (
                                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-zinc-900 outline-none transition-all resize-none" placeholder="Tuliskan nama jalan, RT/RW, dan kota..."></textarea>
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
        </div> 

        {/* 4. BOOKING PANEL (REFACRORED) */}
        <BookingPanel
          isOpen={isBookingOpen}
          onClose={closeBooking}
          step={bookingStep}
          selectedDept={selectedDept}
          hasActiveQueue={!!activeQueueId}
          patientProfile={profile ? {
            name: user?.name || '',
            nik: profile.nik || '',
            birthDate: profile.birthDate || ''
          } : null}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          onBookingSuccess={(id, isAppointment) => {
            const patientId = user?.patient?.id || (user?.role === 'PATIENT' ? user.id : null);

            if (isAppointment && patientId) {
              // Save appointment ID and refresh list from backend
              addAppointmentId(patientId, id);
              fetchPatientAppointments(patientId);
            } else {
              setActiveQueueId(id);
            }
            setActiveView('polyclinics');
          }}
        />
        <ReservationDetailPanel
          isOpen={isDetailPanelOpen}
          onClose={() => setIsDetailPanelOpen(false)}
          appointment={selectedAppointment}
          patientProfile={profile ? {
            name: user?.name || '',
            nik: profile.nik || '',
            address: profile.address || ''
          } : null}
          onCheckIn={executeCheckIn} 
        />
        <QueueDetailPanel
          isOpen={isQueuePanelOpen}
          onClose={() => setIsQueuePanelOpen(false)}
          queue={selectedQueue}
          patientProfile={profile ? {
            name: user?.name || '',
            nik: profile.nik || '',
            address: profile.address || ''
          } : null}
        />

        {/* 5. MODAL PERINGATAN KELENGKAPAN NIK */}
        {isNikWarningOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden text-center animate-in zoom-in-95 duration-300">
              <div className="p-8">
                {/* Ikon Peringatan Kuning/Amber */}
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2">Akses Layanan Ditahan</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  Anda diwajibkan untuk melengkapi <strong className="text-zinc-800">Nomor Induk Kependudukan (NIK)</strong> pada profil medis Anda sebelum dapat membuat antrean atau reservasi.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsNikWarningOpen(false); // Tutup modal
                      handleNavigation('profile'); // Arahkan langsung ke halaman profil
                      // Opsional: Langsung buka mode edit agar pasien bisa langsung mengetik
                      setTimeout(() => setIsEditing(true), 300); 
                    }}
                    className="w-full px-4 py-3.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                  >
                    Lengkapi Profil Sekarang
                  </button>
                  <button
                    onClick={() => setIsNikWarningOpen(false)}
                    className="w-full px-4 py-3.5 text-slate-500 font-extrabold hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                  >
                    Nanti Saja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
