// src/pages/Auth.tsx
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import { useAuthStore } from '../store/authStore'
import CustomInput from '../components/ui/CustomInput'

type AuthMode = 'login' | 'register'

// Daftar SVG Path untuk motif batik medis
const medicalIconPaths = [
  "M12 4.5v15m7.5-7.5h-15", // Salib Medis
  "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", // Hati (Heart)
  "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", // Rekam Medis (Clipboard)
  "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Perlindungan (Shield Check)
];

export default function Auth() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimate, setIsAnimate] = useState(true)
  
  // STATE BARU: Untuk mendeteksi fokus kursor dan memicu Dynamic Blur
  const [isFormFocused, setIsFormFocused] = useState(false)

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] flex items-center justify-center relative overflow-hidden transition-colors duration-500 font-['Inter'] px-4 py-8">
      
      {/* 1. LATAR BELAKANG MOTIF BATIK (Grid Ikon Medis Berulang) */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out flex items-center justify-center ${isFormFocused ? 'blur-md scale-105 opacity-50' : 'blur-none scale-100 opacity-100'}`}>
        <div className="w-full h-full grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-8 md:gap-12 p-8 justify-items-center content-center opacity-70">
          {Array.from({ length: 72 }).map((_, i) => {
            const path = medicalIconPaths[i % medicalIconPaths.length]
            const rotationClass = i % 2 === 0 ? 'rotate-45' : '-rotate-12'
            
            return (
              <svg 
                key={i} 
                className={`w-8 h-8 text-teal-600/5 dark:text-teal-500/5 transition-colors ${rotationClass}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={path} />
              </svg>
            )
          })}
        </div>
      </div>

      {/* 2. KARTU UTAMA (Centered Layout & Glassmorphism) */}
      <div 
        className={`relative z-10 w-full max-w-md bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 sm:p-10 transition-all duration-300 ${
          isAnimate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="mb-8 text-center">
          <h2 className="font-['Manrope'] text-2xl font-bold text-zinc-950 dark:text-zinc-100 tracking-tight transition-colors">
            {mode === 'login' ? 'Masuk ke Sistem' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-sm font-normal text-slate-500 dark:text-zinc-400 transition-colors mt-1.5">
            {mode === 'login' ? 'Gunakan akun rekam medis Anda.' : 'Lengkapi data identitas Anda.'}
          </p>
        </div>

        {/* TAB NAVIGASI */}
        <div className="mb-8 flex w-full border-b border-slate-200 dark:border-zinc-800 transition-colors">
          <button
            type="button"
            onClick={() => toggleMode('login')}
            className={`w-1/2 pb-3.5 text-xs font-bold tracking-widest uppercase transition-all outline-none ${
              mode === 'login' ? 'border-b-2 border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => toggleMode('register')}
            className={`w-1/2 pb-3.5 text-xs font-bold tracking-widest uppercase transition-all outline-none ${
              mode === 'register' ? 'border-b-2 border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* 3. EVENT DELEGATION FORM (Memicu blur saat fokus) */}
        <form 
          className="flex flex-col gap-4" 
          onSubmit={handleSubmit}
          onFocusCapture={() => setIsFormFocused(true)}
          onBlurCapture={() => setIsFormFocused(false)}
        >
          {errors.api && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600 dark:text-rose-400 text-center transition-colors">
              {errors.api}
            </div>
          )}
          {errors.success && (
            <div className="rounded-xl border border-teal-200 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/10 p-3.5 text-xs font-medium text-teal-700 dark:text-teal-400 text-center transition-colors">
              {errors.success}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <CustomInput
                label="Nama Lengkap Sesuai KTP"
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
              />
              {errors.name && <span className="mt-1 ml-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.name}</span>}
            </div>
          )}

          <div>
            <CustomInput
              label="Alamat Email"
              type="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={(val) => setFormData({ ...formData, email: val })}
            />
            {errors.email && <span className="mt-1 ml-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.email}</span>}
          </div>

          <div className="flex flex-col">
            <CustomInput
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(val) => setFormData({ ...formData, password: val })}
            />
            {errors.password && <span className="mt-1 ml-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.password}</span>}

            {mode === 'login' && (
              <div className="mt-2.5 flex justify-end">
                <Link
                  to="/reset-password"
                  className="text-[11px] font-bold tracking-wider text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors focus:outline-none"
                >
                  Lupa Sandi?
                </Link>
              </div>
            )}

            {mode === 'register' && (
              <div className="mt-2 flex gap-1 px-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 w-1/4 rounded-full transition-all duration-300 ${
                      passwordStrength >= level
                        ? passwordStrength <= 2
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : 'bg-teal-500 dark:bg-teal-400'
                        : 'bg-slate-200 dark:bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <CustomInput
                label="Verifikasi Kata Sandi"
                type="password"
                placeholder="Ulangi kata sandi"
                value={formData.confirmPassword}
                onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
              />
              {errors.confirmPassword && <span className="mt-1 ml-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.confirmPassword}</span>}
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-2 flex items-start gap-3 px-1">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#131314] text-teal-600 focus:ring-teal-500 transition-colors"
              />
              <div className="flex flex-col">
                <label htmlFor="terms" className="cursor-pointer text-xs font-normal text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Saya menyetujui {' '}
                  <span className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    Syarat & Ketentuan
                  </span>{' '}
                  RS Ethereal.
                </label>
                {errors.agreed && (
                  <span className="mt-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.agreed}</span>
                )}
              </div>
            </div>
          )}

          <div className="mt-5">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-teal-600 text-white hover:bg-teal-700 font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-teal-500/20 transition-all outline-none active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                mode === 'login' ? 'Masuk ke Portal' : 'Daftar Akun'
              )}
            </button>
          </div>
        </form>
        
        {/* 4. DIVIDER & SSO GOOGLE */}
        <div className="mt-8 mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800 transition-colors"></div>
          </div>
          <div className="relative bg-white dark:bg-[#1e1f20] px-4 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-zinc-500 transition-colors">
            Atau Lanjutkan Dengan
          </div>
        </div>

        <button 
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#131314] text-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-sm rounded-xl shadow-sm transition-all outline-none active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google SSO
        </button>

      </div>
    </div>
  )
}