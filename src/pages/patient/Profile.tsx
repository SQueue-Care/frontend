import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomDatePicker from '../../components/ui/CustomDatePicker'
import CustomInput from '../../components/ui/CustomInput'
import CustomSelect from '../../components/ui/CustomSelect'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { usePatientStore } from '../../store/patientStore'

function ProfileField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-zinc-800/50 dark:bg-[#131314]/50">
      <label className="mb-1 block text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
        {label}
      </label>
      <div
        className={`text-xs font-bold text-zinc-900 dark:text-zinc-100 ${mono ? 'font-mono tracking-wider' : ''}`}
      >
        {value || (
          <span className="font-sans text-[11px] font-medium text-slate-400 italic dark:text-zinc-600">
            Belum diatur
          </span>
        )}
      </div>
    </div>
  )
}

export default function PatientProfile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const showAlert = useAlertStore((s) => s.showAlert)
  const user = useAuthStore((s) => s.user)
  const {
    profile,
    fetchProfile,
    updateProfile,
    isLoading: isProfileLoading,
    isSaving,
  } = usePatientStore()

  const patientId = user?.patient?.id ?? (user?.role === 'PATIENT' ? user?.id : null)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nik: '',
    bpjsNumber: '',
    phone: '',
    gender: '',
    birthDate: '',
    address: '',
  })

  const profileFormDefaults = useMemo(
    () => ({
      nik: profile?.nik ?? '',
      bpjsNumber: profile?.bpjsNumber ?? '',
      phone: profile?.phone ?? '',
      gender: profile?.gender ?? '',
      birthDate: profile?.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
      address: profile?.address ?? '',
    }),
    [profile]
  )

  useEffect(() => {
    if (patientId && !profile) fetchProfile(patientId)
  }, [patientId, profile, fetchProfile])

  // Sync defaults into form when not editing
  useEffect(() => {
    if (!isEditing) {
      setTimeout(() => {
        setFormData(profileFormDefaults)
      }, 0)
    }
  }, [profileFormDefaults, isEditing])

  // Auto-start editing when redirected with ?editing=1 (from NIK warning)
  useEffect(() => {
    if (searchParams.get('editing') === '1' && profile && !isEditing) {
      setTimeout(() => {
        setFormData(profileFormDefaults)
      }, 0)
      setTimeout(() => {
        setIsEditing(true)
      }, 0)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, profile, isEditing, profileFormDefaults, setSearchParams])

  const startEditing = () => {
    setFormData(profileFormDefaults)
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) {
      showAlert('Gagal mengidentifikasi ID Pasien pada sesi Anda.', 'error')
      return
    }
    try {
      const payload = {
        nik: formData.nik || undefined,
        bpjsNumber: formData.bpjsNumber || undefined,
        phone: formData.phone || undefined,
        gender: (formData.gender || undefined) as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
        birthDate: formData.birthDate ? `${formData.birthDate}T12:00:00.000Z` : undefined,
        address: formData.address || undefined,
      }
      await updateProfile(patientId, payload)
      setIsEditing(false)
      showAlert('Profil berhasil diperbarui!', 'success')
    } catch (err: unknown) {
      const responseData =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: Record<string, unknown> } }).response?.data
          : undefined
      let errorMessage = 'Terjadi kesalahan saat menyimpan profil.'

      const translateError = (path: string, code: string) => {
        if (path === 'nik') {
          if (code === 'too_small') return 'NIK harus terdiri dari 16 digit.'
          if (code === 'too_big') return 'NIK tidak boleh lebih dari 16 digit.'
        }
        if (path === 'phone') return 'Format nomor telepon tidak valid.'
        if (path === 'birthDate') return 'Format tanggal lahir tidak valid.'
        return `Format pada isian ${path.toUpperCase()} tidak sesuai.`
      }

      const errorPayload = responseData?.error as
        | { message?: string; details?: Array<{ path: string; code: string }> }
        | undefined

      if (responseData?.status === 'error' && Array.isArray(errorPayload?.details)) {
        errorMessage = errorPayload.details
          .map((d) => `- ${translateError(d.path, d.code)}`)
          .join('\n')
      } else if (errorPayload?.message) {
        errorMessage = errorPayload.message
      }

      showAlert(`Gagal Memperbarui Profil:\n\n${errorMessage}`, 'error')
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full duration-500">
      <div className="mb-6">
        <h1 className="mb-1.5 font-['Manrope'] text-2xl font-extrabold tracking-tighter text-zinc-950 dark:text-zinc-100">
          Profil Pasien
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Kelola identitas medis dan informasi kontak Anda.
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        {isProfileLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600 dark:border-zinc-800 dark:border-t-teal-400" />
            <p className="animate-pulse text-xs font-medium text-slate-400 dark:text-zinc-500">
              Menyinkronkan data rekam medis...
            </p>
          </div>
        ) : (
          <>
            <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden border-b border-slate-100 p-6 sm:flex-row sm:items-center dark:border-zinc-800">
              <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-50 blur-3xl dark:bg-teal-900/10" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-2xl font-black text-teal-600 shadow-sm dark:border-zinc-800 dark:bg-[#131314] dark:text-teal-400">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-[#1e1f20] dark:bg-emerald-600">
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-100">
                    {user?.name ?? 'Nama Pasien'}
                  </h2>
                  <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {user?.email ?? 'email@contoh.com'}
                  </p>
                  <span className="inline-flex rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-emerald-700 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Pasien Terverifikasi
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="relative z-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-zinc-900 shadow-sm transition-all outline-none hover:border-teal-500 hover:bg-slate-50 sm:w-auto dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-100 dark:hover:border-teal-800 dark:hover:bg-zinc-800"
                >
                  Edit Profil
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="mb-6">
                <h3 className="mb-4 border-b border-slate-100 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:text-zinc-500">
                  Identitas Medis Pribadi
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {isEditing ? (
                    <CustomInput
                      label="Nomor Induk Kependudukan (NIK)"
                      placeholder="Contoh: 36710xxxxx"
                      value={formData.nik}
                      onChange={(val) => setFormData({ ...formData, nik: val })}
                      maxLength={16}
                      type="text"
                    />
                  ) : (
                    <ProfileField
                      label="Nomor Induk Kependudukan (NIK)"
                      value={formData.nik}
                      mono
                    />
                  )}
                  {isEditing ? (
                    <CustomInput
                      label="Nomor BPJS"
                      placeholder="Misal: 000xxxx"
                      value={formData.bpjsNumber}
                      onChange={(val) => setFormData({ ...formData, bpjsNumber: val })}
                      type="text"
                    />
                  ) : (
                    <ProfileField label="Nomor BPJS" value={formData.bpjsNumber} mono />
                  )}
                  {isEditing ? (
                    <CustomSelect
                      label="Jenis Kelamin"
                      value={formData.gender}
                      onChange={(val) => setFormData({ ...formData, gender: val })}
                      options={[
                        { value: 'MALE', label: 'Laki-laki' },
                        { value: 'FEMALE', label: 'Perempuan' },
                      ]}
                      placeholder="Pilih Jenis Kelamin"
                    />
                  ) : (
                    <ProfileField
                      label="Jenis Kelamin"
                      value={
                        formData.gender === 'MALE'
                          ? 'Laki-laki'
                          : formData.gender === 'FEMALE'
                            ? 'Perempuan'
                            : ''
                      }
                    />
                  )}
                  {isEditing ? (
                    <CustomDatePicker
                      label="Tanggal Lahir"
                      value={formData.birthDate}
                      onChange={(val) => setFormData({ ...formData, birthDate: val })}
                    />
                  ) : (
                    <ProfileField
                      label="Tanggal Lahir"
                      value={
                        formData.birthDate
                          ? new Date(formData.birthDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : ''
                      }
                    />
                  )}
                  {isEditing ? (
                    <CustomInput
                      label="Nomor WhatsApp / Telepon"
                      placeholder="Contoh: 0812xxxxxx"
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      type="tel"
                    />
                  ) : (
                    <ProfileField label="Nomor WhatsApp / Telepon" value={formData.phone} mono />
                  )}
                </div>
              </div>

              <div className="mb-2">
                <h3 className="mb-4 border-b border-slate-100 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:text-zinc-500">
                  Domisili
                </h3>
                <div className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-zinc-800/50 dark:bg-[#131314]/50">
                  {isEditing ? (
                    <CustomInput
                      label="Alamat Lengkap Saat Ini"
                      value={formData.address}
                      onChange={(val) => setFormData({ ...formData, address: val })}
                      placeholder="Tuliskan nama jalan, RT/RW, dan kota..."
                      multiline
                      rows={2}
                    />
                  ) : (
                    <div className="text-xs leading-relaxed font-bold text-zinc-900 dark:text-zinc-100">
                      {formData.address || (
                        <span className="text-[11px] font-medium text-slate-400 italic dark:text-zinc-600">
                          Alamat belum ditambahkan.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="animate-in slide-in-from-bottom-2 mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-transparent bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-600 transition-colors outline-none hover:bg-slate-200 dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-teal-500/10 transition-all outline-none hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-700 dark:hover:bg-teal-600"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="h-3.5 w-3.5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            className="opacity-75"
                          />
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Profil'
                    )}
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
