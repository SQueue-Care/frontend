import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthButton from '../components/auth/AuthButton'
import AuthInput from '../components/auth/AuthInput'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import { useAuthStore } from '../store/authStore'

type AuthMode = 'login' | 'register'

export default function Auth() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimate, setIsAnimate] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleMode = (newMode: AuthMode) => {
    if (newMode === mode) return
    setIsAnimate(false)
    setTimeout(() => {
      setMode(newMode)
      setErrors({})
      setIsAnimate(true)
    }, 200)
  }

  const passwordStrength = useMemo(() => {
    let strength = 0
    if (formData.password.length >= 8) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/[0-9]/.test(formData.password)) strength++
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++
    return strength
  }, [formData.password])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Kata sandi minimal 8 karakter'
    }

    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok'
      }
      if (!formData.agreed) {
        newErrors.agreed = 'Syarat dan ketentuan wajib disetujui'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
        const user = useAuthStore.getState().user
        if (user?.role === 'PATIENT') navigate('/portal')
        else if (user?.role === 'DOCTOR') navigate('/doctor')
        else if (user?.role === 'ADMIN') navigate('/admin')
        else setErrors({ api: 'Peran pengguna tidak valid.' })
      } else {
        await apiClient.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'PATIENT',
        })
        toggleMode('login')
        setErrors({ success: 'Registrasi berhasil! Silakan masuk dengan akun Anda.' })
      }
    } catch (error: unknown) {
      setErrors({
        api: getErrorMessage(error, 'Terjadi kesalahan pada server. Silakan coba lagi.'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Inter']">
      {/* Left panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-linear-to-br from-teal-900 to-slate-900 p-12 lg:flex">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-[80px]" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-500/20 blur-[80px]" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-lg shadow-teal-500/20">
            <span className="text-xl font-bold text-white">RS</span>
          </div>
          <span className="font-['Manrope'] text-2xl font-extrabold tracking-wide text-white">
            Ethereal
          </span>
        </div>

        <div className="relative z-10 flex max-w-md flex-col gap-6">
          <h1 className="font-['Manrope'] text-5xl leading-tight font-extrabold text-white">
            Portal Layanan Kesehatan Digital
          </h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Satu akses aman untuk manajemen antrean, riwayat medis, dan jadwal konsultasi Anda.
          </p>
        </div>

        <div className="relative z-10 w-max rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <span className="text-sm font-bold tracking-wider text-teal-400 uppercase">
            Keamanan Standar Medis
          </span>
        </div>
      </div>

      {/* Right panel */}
      <div className="h-full w-full scrollbar-none overflow-y-auto bg-slate-50 px-6 pt-16 pb-20 sm:px-12 lg:flex-1 [&::-webkit-scrollbar]:hidden">
        <div
          className={`mx-auto w-full max-w-md transform rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200 transition-all duration-300 md:p-10 ${
            isAnimate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-8 flex flex-col gap-2 text-center lg:text-left">
            <h2 className="font-['Manrope'] text-3xl font-bold text-zinc-900">
              {mode === 'login' ? 'Masuk' : 'Daftar Baru'}
            </h2>
            <p className="text-sm text-zinc-500">
              {mode === 'login'
                ? 'Gunakan akun rekam medis Anda.'
                : 'Lengkapi data untuk akses portal.'}
            </p>
          </div>

          <div className="mb-8 flex w-full border-b border-slate-200">
            <button
              onClick={() => toggleMode('login')}
              className={`w-1/2 pb-4 text-sm font-bold transition-all ${
                mode === 'login' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-400'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => toggleMode('register')}
              className={`w-1/2 pb-4 text-sm font-bold transition-all ${
                mode === 'register' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-400'
              }`}
            >
              Daftar
            </button>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {errors.api && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {errors.api}
              </div>
            )}
            {errors.success && (
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-700">
                {errors.success}
              </div>
            )}

            {mode === 'register' && (
              <AuthInput
                label="Nama Lengkap"
                placeholder="Nama sesuai identitas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
            )}

            <AuthInput
              label="Email Terdaftar"
              type="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            <div className="flex flex-col gap-1">
              <AuthInput
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />

              {mode === 'login' && (
                <div className="mt-1 flex justify-end">
                  <Link
                    to="/reset-password"
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 focus:underline focus:outline-none"
                  >
                    Lupa Sandi?
                  </Link>
                </div>
              )}

              {mode === 'register' && (
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 w-1/4 rounded-full transition-all duration-300 ${
                        passwordStrength >= level
                          ? passwordStrength <= 2
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {mode === 'register' && (
              <AuthInput
                label="Verifikasi Kata Sandi"
                type="password"
                placeholder="Ulangi kata sandi"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
              />
            )}

            {mode === 'register' && (
              <div className="mt-1 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreed}
                  onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex flex-col">
                  <label htmlFor="terms" className="cursor-pointer text-xs text-slate-500">
                    Saya menyetujui{' '}
                    <span className="font-semibold text-teal-600 hover:underline">
                      Syarat & Ketentuan
                    </span>{' '}
                    RS Ethereal.
                  </label>
                  {errors.agreed && (
                    <span className="mt-1 text-xs font-medium text-red-500">{errors.agreed}</span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              <AuthButton type="submit" isLoading={isLoading}>
                {mode === 'login' ? 'Masuk ke Portal' : 'Daftar Akun Pasien'}
              </AuthButton>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            {mode === 'login' ? 'Belum punya rekam medis?' : 'Sudah punya akun?'}{' '}
            <button
              onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-teal-600 hover:underline"
            >
              {mode === 'login' ? 'Registrasi Sekarang' : 'Masuk ke Akun'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
