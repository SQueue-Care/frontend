// src/components/DoctorProfileSettings.tsx
import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/errors'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { useDoctorStore } from '../../store/doctorStore'

export default function DoctorProfileSettings() {
  const user = useAuthStore((state) => state.user)

  const {
    profile,
    schedules,
    fetchProfile,
    fetchSchedules,
    updateProfile,
    isLoadingProfile,
    isLoadingSchedules,
    isSaving,
  } = useDoctorStore()

  const showAlert = useAlertStore((s) => s.showAlert)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    specialization: '',
    licenseNumber: '',
    avgServiceMin: 10,
  })

  const doctorId = user?.doctor?.id ?? (user?.role === 'DOCTOR' ? user.id : null)

  // Ambil data profil dan jadwal jika belum ada
  useEffect(() => {
    if (doctorId) {
      fetchProfile(doctorId)
      fetchSchedules(doctorId)
    }
  }, [doctorId, fetchProfile, fetchSchedules])

  const profileValues = {
    specialization: profile?.specialization || '',
    licenseNumber: profile?.licenseNumber || '',
    avgServiceMin: profile?.avgServiceMin || 10,
  }

  const handleStartEditing = () => {
    setFormData(profileValues)
    setIsEditing(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId) {
      showAlert('Gagal mengidentifikasi ID Dokter pada sesi Anda.', 'error')
      return
    }

    try {
      const payload = {
        specialization: formData.specialization || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        avgServiceMin: Number(formData.avgServiceMin) || undefined,
      }

      await updateProfile(doctorId, payload)
      setIsEditing(false)
      showAlert('Profil dokter berhasil diperbarui!', 'success')
    } catch (err: unknown) {
      showAlert(getErrorMessage(err, 'Terjadi kesalahan saat menyimpan profil.'), 'error')
    }
  }

  return (
    <div className="animate-in fade-in flex w-full flex-col items-stretch gap-6 duration-500 lg:flex-row">
      {/* KARTU KIRI: FORMULIR PROFIL */}
      <div className="flex w-full shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:w-[460px]">
        {isLoadingProfile ? (
          <div className="my-auto py-10 text-center font-medium text-slate-500">
            Memuat data profil dokter...
          </div>
        ) : (
          <>
            <div className="mb-6 flex shrink-0 items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h2 className="text-lg leading-tight font-bold text-zinc-900">
                    {user?.name || 'Nama Dokter'}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {profile?.department?.name || 'Departemen Belum Ditentukan'}
                  </p>
                  <span className="mt-2 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-700 uppercase">
                    SIP Aktif
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="flex flex-1 flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Bidang Spesialisasi
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={isEditing ? formData.specialization : profileValues.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    placeholder="Contoh: Kardiologi Intervensi"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nomor Surat Izin Praktik (SIP)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={isEditing ? formData.licenseNumber : profileValues.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    placeholder="Opsional"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Rata-rata Waktu Layanan (Menit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    disabled={!isEditing}
                    value={isEditing ? formData.avgServiceMin : profileValues.avgServiceMin}
                    onChange={(e) =>
                      setFormData({ ...formData, avgServiceMin: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    placeholder="Standar: 10 Menit"
                    required
                  />
                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                    *Digunakan oleh sistem AI untuk prediksi antrean.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-slate-100 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-indigo-600/10 transition-colors hover:bg-indigo-700"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-zinc-900/10 transition-colors hover:bg-zinc-800"
                  >
                    Edit Kredensial
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      {/* KARTU KANAN: JADWAL PRAKTIK */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-zinc-900">Jadwal Praktik Rutin</h3>
        </div>

        <div className="no-scrollbar flex-1 scrollbar-none overflow-y-auto pr-1 pb-12 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isLoadingProfile || isLoadingSchedules ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
          ) : schedules.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 italic">
              Tidak ada jadwal praktik yang terdaftar dalam sistem.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {schedules.map((sched) => {
                const dayNames: Record<string, string> = {
                  MONDAY: 'Senin',
                  TUESDAY: 'Selasa',
                  WEDNESDAY: 'Rabu',
                  THURSDAY: 'Kamis',
                  FRIDAY: 'Jumat',
                  SATURDAY: 'Sabtu',
                  SUNDAY: 'Minggu',
                }
                return (
                  <div
                    key={sched.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-indigo-200"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Hari {dayNames[sched.dayOfWeek] || sched.dayOfWeek}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {sched.startTime} - {sched.endTime} WIB
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded bg-indigo-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-indigo-700 uppercase">
                        Kapasitas: {sched.capacity}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-16 rounded-b-2xl bg-linear-to-t from-white via-white/90 to-transparent" />
      </div>
    </div>
  )
}
