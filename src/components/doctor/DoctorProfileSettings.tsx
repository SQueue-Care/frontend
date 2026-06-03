// src/components/DoctorProfileSettings.tsx
import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/errors'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { useDoctorStore } from '../../store/doctorStore'
import CustomInput from '../ui/CustomInput'

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
      <div className="flex w-full shrink-0 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#1e1f20] lg:w-[460px]">
        {isLoadingProfile ? (
          <div className="my-auto py-10 text-center font-medium text-slate-500 dark:text-zinc-400">
            Memuat data profil dokter...
          </div>
        ) : (
          <>
            <div className="mb-6 flex shrink-0 items-center justify-between border-b border-slate-100 pb-6 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h2 className="font-['Manrope'] text-xl font-bold leading-tight text-zinc-900 dark:text-zinc-100">
                    {user?.name || 'Nama Dokter'}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {profile?.department?.name || 'Departemen Belum Ditentukan'}
                  </p>
                  <span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:bg-emerald-500/10 dark:text-emerald-400">
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
                <div className={!isEditing ? "pointer-events-none opacity-60" : ""}>
                  <CustomInput
                    label="Bidang Spesialisasi"
                    value={isEditing ? formData.specialization : profileValues.specialization}
                    onChange={(val) => setFormData({ ...formData, specialization: val })}
                    placeholder="Contoh: Kardiologi Intervensi"
                  />
                </div>
                <div className={!isEditing ? "pointer-events-none opacity-60" : ""}>
                  <CustomInput
                    label="Nomor Surat Izin Praktik (SIP)"
                    value={isEditing ? formData.licenseNumber : profileValues.licenseNumber}
                    onChange={(val) => setFormData({ ...formData, licenseNumber: val })}
                    placeholder="Opsional"
                  />
                </div>
                <div className={!isEditing ? "pointer-events-none opacity-60" : ""}>
                  <CustomInput
                    type="number"
                    label="Rata-rata Waktu Layanan (Menit)"
                    value={String(isEditing ? formData.avgServiceMin : profileValues.avgServiceMin)}
                    onChange={(val) => setFormData({ ...formData, avgServiceMin: Number(val) })}
                    placeholder="Standar: 10 Menit"
                  />
                  <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                    *Digunakan oleh sistem AI untuk prediksi kalkulasi antrean.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-100 pt-6 dark:border-zinc-800">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold tracking-widest text-slate-600 uppercase transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 dark:bg-indigo-500 dark:text-zinc-900 dark:shadow-indigo-900/40 dark:hover:bg-indigo-400"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="mb-6 flex shrink-0 items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
          <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-zinc-100">Jadwal Praktik Rutin</h3>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto pr-1 pb-12">
          {isLoadingProfile || isLoadingSchedules ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-b-indigo-600 dark:border-zinc-800 dark:border-b-indigo-500"></div>
            </div>
          ) : schedules.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium italic text-slate-500 dark:text-zinc-400">
              Tidak ada jadwal praktik yang terdaftar dalam sistem.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-colors hover:border-indigo-200 dark:border-zinc-800 dark:bg-[#131314] dark:hover:border-indigo-500/50"
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        Hari {dayNames[sched.dayOfWeek] || sched.dayOfWeek}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-zinc-400">
                        {sched.startTime} - {sched.endTime} WIB
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-widest text-indigo-600 uppercase dark:bg-indigo-500/10 dark:text-indigo-400">
                        Kapasitas: {sched.capacity}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {/* REVISI: Perbaikan warna gradient mode gelap agar tidak menjadi kabut putih */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-20 rounded-b-3xl bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#1e1f20] dark:via-[#1e1f20]/90 dark:to-transparent" />
      </div>
    </div>
  )
}