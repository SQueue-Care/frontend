// src/pages/DoctorDashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDoctorStore } from '../store/doctorStore';
import { useQueueStore } from '../store/queueStore';
import { QueueStatus } from '../lib/types';
import apiClient from '../lib/apiClient';
import {
  getAllowedQueueTransitions,
  isValidQueueTransition,
  QUEUE_TRANSITION_CLASSES,
  QUEUE_TRANSITION_LABELS,
  QUEUE_TRANSITION_TITLES,
} from '../lib/queueStateMachine';

type DoctorView = 'dashboard' | 'patients' | 'profile';

export default function DoctorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<DoctorView>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '', licenseNumber: '', avgServiceMin: 10
  });

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const { profile, schedules, fetchProfile, fetchSchedules, updateProfile, isLoading, isSaving } = useDoctorStore();
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore();

  // Efek untuk memuat data profil dan jadwal
  useEffect(() => {
    // Peringatan Arsitektur: Pastikan backend Anda menyertakan objek 'doctor' 
    // pada respon login/auth, mirip dengan implementasi 'patient' sebelumnya.
    const doctorId = (user as any)?.doctor?.id || (user?.role === 'DOCTOR' ? user.id : null);
    
    if (doctorId) {
      fetchProfile(doctorId);
      fetchSchedules(doctorId);
    }
  }, [user, fetchProfile, fetchSchedules]);

  useEffect(() => {
    const departmentId = profile?.department?.id || profile?.departmentId;

    if (activeView === 'dashboard' && departmentId) {
      fetchQueues({ departmentId, date: new Date() });
    }
  }, [activeView, profile?.department?.id, profile?.departmentId, fetchQueues]);

  // Efek untuk mengisi form edit profil
  useEffect(() => {
    if (profile) {
      setFormData({
        specialization: profile.specialization || '',
        licenseNumber: profile.licenseNumber || '',
        avgServiceMin: profile.avgServiceMin || 10,
      });
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctorId = (user as any)?.doctor?.id || (user?.role === 'DOCTOR' ? user.id : null);
    
    if (!doctorId) {
      alert("Gagal mengidentifikasi ID Dokter pada sesi Anda.");
      return;
    }
    
    try {
      const payload = {
        specialization: formData.specialization || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        avgServiceMin: Number(formData.avgServiceMin) || undefined,
      };
      
      await updateProfile(doctorId, payload);
      setIsEditing(false);
      alert('Profil dokter berhasil diperbarui!');
    } catch (err: any) {
      const responseData = err.response?.data;
      let errorMessage = "Terjadi kesalahan saat menyimpan profil.";

      const translateError = (path: string) => {
        if (path === 'avgServiceMin') return "Rata-rata waktu layanan harus berupa angka positif maksimal 180 menit.";
        if (path === 'specialization') return "Bidang spesialisasi wajib diisi.";
        return `Format pada isian ${path.toUpperCase()} tidak sesuai.`;
      };

      if (responseData?.status === "error" && responseData?.error?.details) {
        const details = responseData.error.details;
        if (Array.isArray(details)) {
            errorMessage = details.map((d: any) => `- ${translateError(d.path)}`).join('\n');
          }
      } else if (responseData?.error?.message) {
        errorMessage = responseData.error.message;
      }

      alert(`Gagal Memperbarui Profil:\n\n${errorMessage}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const refreshDepartmentQueues = () => {
    const departmentId = profile?.department?.id || profile?.departmentId;
    if (departmentId) {
      fetchQueues({ departmentId, date: new Date() });
    }
  };

  const handleUpdateQueueStatus = async (queueId: string, currentStatus: QueueStatus, nextStatus: QueueStatus) => {
    if (!isValidQueueTransition(currentStatus, nextStatus)) {
      alert('Transisi status tidak valid.');
      return;
    }

    try {
      await apiClient.patch(`/queues/${queueId}/status`, { status: nextStatus });
      refreshDepartmentQueues();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status antrean.');
    }
  };

  const handleCancelQueue = async (queueId: string, currentStatus: QueueStatus) => {
    if (![QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SKIPPED].includes(currentStatus)) {
      alert('Antrean ini tidak bisa dibatalkan.');
      return;
    }

    try {
      await apiClient.post(`/queues/${queueId}/cancel`);
      refreshDepartmentQueues();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membatalkan antrean.');
    }
  };

  const departmentQueues = useMemo(() => {
    const departmentId = profile?.department?.id || profile?.departmentId;
    if (!departmentId) return [];

    const activeStatuses = [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_PROGRESS];
    const filtered = queues.filter((queue) => queue.department?.id === departmentId);

    return [...filtered].sort((a, b) => {
      const aActive = activeStatuses.includes(a.status) ? 0 : 1;
      const bActive = activeStatuses.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime();
    });
  }, [profile?.department?.id, profile?.departmentId, queues]);

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
                {activeView === 'dashboard' ? 'Ruang Praktik Utama' : 'Manajemen Profil'}
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
          
          {/* VIEW: RUANG PRAKTIK (DASHBOARD) */}
          {activeView === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Selamat Bertugas, {user?.name}</h1>
                <p className="text-slate-600">Pantau jadwal harian dan antrean pasien yang ditugaskan kepada Anda.</p>
              </div>

              {/* Tampilan Jadwal Dokter */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                 <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-slate-100 pb-3">Jadwal Praktik Anda</h3>
                 {isLoading ? (
                   <div className="flex justify-center py-4">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                   </div>
                 ) : schedules.length === 0 ? (
                   <p className="text-slate-500 italic text-sm">Tidak ada jadwal praktik yang terdaftar dalam sistem.</p>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {schedules.map((sched) => {
                       const dayNames: Record<string, string> = {
                         'MONDAY': 'Senin',
                         'TUESDAY': 'Selasa',
                         'WEDNESDAY': 'Rabu',
                         'THURSDAY': 'Kamis',
                         'FRIDAY': 'Jumat',
                         'SATURDAY': 'Sabtu',
                         'SUNDAY': 'Minggu'
                       };
                       return (
                         <div key={sched.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between">
                           <div>
                             <p className="font-bold text-slate-800">Hari {dayNames[sched.dayOfWeek] || sched.dayOfWeek}</p>
                             <p className="text-xs text-slate-500 font-medium mt-1">{sched.startTime} - {sched.endTime} WIB</p>
                           </div>
                           <div className="text-right">
                             <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">Kapasitas: {sched.capacity}</span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
              </div>
              
              {/* Daftar antrean pasien */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                 <div className="flex items-center justify-between gap-4 mb-4">
                   <div>
                     <h3 className="text-lg font-bold text-zinc-900">Antrean Poli Hari Ini</h3>
                     <p className="text-slate-500 text-sm">Antrean pasien untuk departemen Anda.</p>
                   </div>
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                     {departmentQueues.filter((queue) => [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_PROGRESS].includes(queue.status)).length} aktif
                   </span>
                 </div>

                 {isLoadingTable ? (
                   <div className="flex justify-center py-10">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                   </div>
                 ) : errorTable ? (
                   <div className="py-8 text-center text-rose-600 text-sm font-medium">{errorTable}</div>
                 ) : departmentQueues.length === 0 ? (
                   <div className="py-8 text-center text-slate-500 italic text-sm">
                     Belum ada antrean untuk departemen Anda hari ini.
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                           <th className="p-3 pl-0">No. Antrean</th>
                           <th className="p-3">Nama Pasien</th>
                           <th className="p-3">Status</th>
                           <th className="p-3 text-right">Aksi</th>
                         </tr>
                       </thead>
                       <tbody className="text-sm font-medium text-zinc-900 divide-y divide-slate-100">
                         {departmentQueues.map((queue) => {
                           const statusLabel: Record<QueueStatus, string> = {
                             [QueueStatus.WAITING]: 'Menunggu',
                             [QueueStatus.CALLED]: 'Dipanggil',
                             [QueueStatus.IN_PROGRESS]: 'Diperiksa',
                             [QueueStatus.DONE]: 'Selesai',
                             [QueueStatus.SKIPPED]: 'Dilewati',
                             [QueueStatus.CANCELLED]: 'Dibatalkan',
                           };

                           const statusClasses: Record<QueueStatus, string> = {
                             [QueueStatus.WAITING]: 'bg-slate-50 text-slate-700 border-slate-200',
                             [QueueStatus.CALLED]: 'bg-blue-50 text-blue-700 border-blue-200',
                             [QueueStatus.IN_PROGRESS]: 'bg-amber-50 text-amber-700 border-amber-200',
                             [QueueStatus.DONE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                             [QueueStatus.SKIPPED]: 'bg-gray-50 text-gray-600 border-gray-200',
                              [QueueStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200',
                            };

                            return (
                              <tr key={queue.id} className="hover:bg-slate-50/70 transition-colors">
                               <td className="p-3 pl-0 font-bold text-zinc-900 font-mono">
                                 {queue.department?.code || 'XX'}-{queue.queueNumber}
                               </td>
                               <td className="p-3">{queue.patient?.user?.name || '-'}</td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${statusClasses[queue.status]}`}>
                                    {statusLabel[queue.status]}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2 flex-wrap">
                                    {getAllowedQueueTransitions(queue.status)
                                      .filter((nextStatus) => nextStatus !== QueueStatus.CANCELLED)
                                      .map((nextStatus) => (
                                        <button
                                          key={nextStatus}
                                          onClick={() => handleUpdateQueueStatus(queue.id, queue.status, nextStatus)}
                                          className={QUEUE_TRANSITION_CLASSES[nextStatus]}
                                          title={QUEUE_TRANSITION_TITLES[nextStatus]}
                                        >
                                          {QUEUE_TRANSITION_LABELS[nextStatus]}
                                        </button>
                                      ))}

                                    {[QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SKIPPED].includes(queue.status) && (
                                      <button
                                        onClick={() => handleCancelQueue(queue.id, queue.status)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                        title="Batalkan antrean"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
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

          {/* VIEW: PROFIL MEDIS */}
          {activeView === 'profile' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Profil Medis & Kredensial</h1>
                <p className="text-slate-600">Perbarui spesialisasi dan estimasi waktu penanganan pasien Anda.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl">
                {isLoading ? (
                   <div className="text-center py-10 text-slate-500 font-medium">Memuat data profil dokter...</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-bold">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-zinc-900">{user?.name || 'Nama Dokter'}</h2>
                          <p className="text-slate-500 text-sm font-medium">{profile?.department?.name || 'Departemen Belum Ditentukan'}</p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">SIP Aktif</span>
                        </div>
                      </div>
                      {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                          Edit Kredensial
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-1">Bidang Spesialisasi</label>
                          <input type="text" disabled={!isEditing} value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" placeholder="Contoh: Kardiologi Intervensi" required />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Surat Izin Praktik (SIP)</label>
                          <input type="text" disabled={!isEditing} value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" placeholder="Opsional" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Rata-rata Waktu Layanan (Menit)</label>
                          <input type="number" min="1" max="180" disabled={!isEditing} value={formData.avgServiceMin} onChange={(e) => setFormData({...formData, avgServiceMin: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" placeholder="Standar: 10 Menit" required />
                          <p className="text-[11px] text-slate-500 mt-1">*Digunakan oleh sistem AI untuk prediksi antrean.</p>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                          <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-sm transition-colors">Batal</button>
                          <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-sm transition-colors">{isSaving ? 'Menyimpan...' : 'Simpan Kredensial'}</button>
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
    </div>
  );
}
