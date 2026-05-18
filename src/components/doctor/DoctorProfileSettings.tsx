// src/components/DoctorProfileSettings.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDoctorStore } from '../store/doctorStore';

export default function DoctorProfileSettings() {
  const user = useAuthStore((state) => state.user);
  
  const {
    profile,
    schedules,
    fetchProfile,
    fetchSchedules,
    updateProfile,
    isLoadingProfile,
    isLoadingSchedules,
    isSaving,
  } = useDoctorStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '', licenseNumber: '', avgServiceMin: 10
  });

  const doctorId = (user as any)?.doctor?.id || (user?.role === 'DOCTOR' ? user.id : null);

  // Ambil data profil dan jadwal jika belum ada
  useEffect(() => {
    if (doctorId) {
      fetchProfile(doctorId);
      fetchSchedules(doctorId);
    }
  }, [doctorId, fetchProfile, fetchSchedules]);

  // Sinkronisasi data ke dalam form internal
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

  return (
    <div className="animate-in fade-in duration-500 flex flex-col lg:flex-row gap-6 items-stretch w-full">
      
      {/* KARTU KIRI: FORMULIR PROFIL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm w-full lg:w-[460px] shrink-0 flex flex-col justify-between">
        {isLoadingProfile ? (
          <div className="text-center py-10 text-slate-500 font-medium my-auto">Memuat data profil dokter...</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 leading-tight">{user?.name || 'Nama Dokter'}</h2>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">{profile?.department?.name || 'Departemen Belum Ditentukan'}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded uppercase tracking-wider">SIP Aktif</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bidang Spesialisasi</label>
                  <input type="text" disabled={!isEditing} value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 font-medium text-zinc-800" placeholder="Contoh: Kardiologi Intervensi" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat Izin Praktik (SIP)</label>
                  <input type="text" disabled={!isEditing} value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 font-medium text-zinc-800" placeholder="Opsional" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rata-rata Waktu Layanan (Menit)</label>
                  <input type="number" min="1" max="180" disabled={!isEditing} value={formData.avgServiceMin} onChange={(e) => setFormData({...formData, avgServiceMin: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 font-medium text-zinc-800" placeholder="Standar: 10 Menit" required />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">*Digunakan oleh sistem AI untuk prediksi antrean.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 shrink-0 flex gap-2 justify-end">
                {isEditing ? (
                  <>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors">Batal</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/10 transition-colors">
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-zinc-900/10 transition-colors">
                    Edit Kredensial
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      {/* KARTU KANAN: JADWAL PRAKTIK */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex-1 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 shrink-0">
          <h3 className="text-lg font-bold text-zinc-900">Jadwal Praktik Rutin</h3>
        </div>
         
        <div className="flex-1 overflow-y-auto pb-12 pr-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isLoadingProfile || isLoadingSchedules ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-slate-500 italic text-sm text-center py-10">Tidak ada jadwal praktik yang terdaftar dalam sistem.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {schedules.map((sched) => {
                const dayNames: Record<string, string> = {
                  'MONDAY': 'Senin', 'TUESDAY': 'Selasa', 'WEDNESDAY': 'Rabu',
                  'THURSDAY': 'Kamis', 'FRIDAY': 'Jumat', 'SATURDAY': 'Sabtu', 'SUNDAY': 'Minggu'
                };
                return (
                  <div key={sched.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between hover:border-indigo-200 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Hari {dayNames[sched.dayOfWeek] || sched.dayOfWeek}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">{sched.startTime} - {sched.endTime} WIB</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-wider">
                        Kapasitas: {sched.capacity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none rounded-b-2xl z-10" />
      </div>

    </div>
  );
}