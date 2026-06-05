// src/pages/Auth.tsx
import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import { useAuthStore } from '../store/authStore'
import CustomInput from '../components/ui/CustomInput'

type AuthMode = 'login' | 'register'

const row1Icons = [
  "M22 12h-4l-3 9L9 3l-3 9H2", 
  "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  "M22 12h-4l-3 9L9 3l-3 9H2"
];

const row2Icons = [
  "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  "M4.8 5.6v1.8a7.2 7.2 0 1 0 14.4 0V5.6 M12 14.6v4.8 M12 19.4a2 2 0 1 0 0 4 a 2 2 0 1 0 0 -4 z",
  "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
];

const row3Icons = [
  "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
];

const row4Icons = [
  "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
];

export default function Auth() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFormFocused, setIsFormFocused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // State untuk Fitur Buka/Tutup Password
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const toggleMode = (newMode: AuthMode) => {
    if (newMode === mode) return
    setIsTransitioning(true)
    setTimeout(() => {
      setMode(newMode)
      setErrors({})
      setShowPassword(false) 
      setShowConfirmPassword(false)
      setIsTransitioning(false)
    }, 250)
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
      newErrors.email = 'Format email tidak valid.'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Kata sandi minimal 8 karakter.'
    }

    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi.'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.'
      }
      if (!formData.agreed) {
        newErrors.agreed = 'Anda harus menyetujui syarat & ketentuan.'
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
        if (user?.role === 'PATIENT') navigate('/portal', { replace: true })
        else if (user?.role === 'DOCTOR') navigate('/doctor', { replace: true })
        else if (user?.role === 'ADMIN') navigate('/admin', { replace: true })
        else setErrors({ api: 'Peran pengguna tidak valid untuk akses.' })
      } else {
        await apiClient.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'PATIENT',
        })
        toggleMode('login')
        setErrors({ success: 'Registrasi berhasil. Silakan masuk menggunakan kredensial Anda.' })
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const responseMessage = error?.response?.data?.message?.toLowerCase() || '';
      
      let errorMsg = getErrorMessage(error, 'Terjadi kegagalan komunikasi dengan peladen.');

      if (status === 404 || responseMessage.includes('not found') || responseMessage.includes('tidak ditemukan')) {
        errorMsg = 'Alamat email ini belum terdaftar di sistem kami.';
      } else if (status === 401 || responseMessage.includes('password') || responseMessage.includes('salah') || responseMessage.includes('kredensial')) {
        errorMsg = 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.';
      }

      setErrors({ api: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] flex items-center justify-center relative overflow-hidden transition-colors duration-500 font-['Inter'] antialiased px-4 py-8">
      
      {/* LATAR BELAKANG MOTIF BATIK */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center ${isFormFocused ? 'blur-md scale-105 opacity-40' : 'blur-none scale-100 opacity-100'}`}>
        <div className="w-full h-full flex flex-col justify-between overflow-hidden opacity-70 p-4">
          {Array.from({ length: 12 }).map((_, rowIndex) => {
            let iconSet = row1Icons;
            if (rowIndex % 4 === 1) iconSet = row2Icons;
            else if (rowIndex % 4 === 2) iconSet = row3Icons;
            else if (rowIndex % 4 === 3) iconSet = row4Icons;

            return (
              <div key={`row-${rowIndex}`} className="flex w-full justify-between items-center">
                {Array.from({ length: 14 }).map((_, colIndex) => {
                  if ((rowIndex + colIndex) % 2 !== 0) {
                    return <div key={`cell-${rowIndex}-${colIndex}`} className="w-8 h-8" />;
                  }

                  const path = iconSet[colIndex % iconSet.length];
                  const rotationClass = colIndex % 3 === 0 ? 'rotate-12' : colIndex % 3 === 1 ? '-rotate-6' : 'rotate-0';
                  
                  return (
                    <svg 
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`w-8 h-8 text-teal-600/15 dark:text-teal-500/20 transition-colors duration-500 ${rotationClass}`} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                    </svg>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* KARTU UTAMA */}
      <div 
        className={`relative z-10 w-full max-w-md bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl p-8 sm:p-10 transition-all duration-700 ease-out ${ isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0' }`}
      >
        <div className={`transition-all duration-250 ease-in-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="mb-8 text-center">
            <h2 className="font-['Manrope'] text-2xl md:text-[26px] font-semibold text-zinc-950 dark:text-white tracking-tight transition-colors">
              {mode === 'login' ? 'Masuk ke Sistem' : 'Daftar Akun Baru'}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors mt-2">
              {mode === 'login' ? 'Gunakan akun rekam medis Anda.' : 'Lengkapi data identitas Anda.'}
            </p>
          </div>

          <div className="mb-8 flex w-full border-b border-slate-200 dark:border-zinc-800 transition-colors">
            <button
              type="button"
              onClick={() => toggleMode('login')}
              className={`w-1/2 pb-3.5 text-sm font-medium transition-all outline-none ${ mode === 'login' ? 'border-b-2 border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300' }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => toggleMode('register')}
              className={`w-1/2 pb-3.5 text-sm font-medium transition-all outline-none ${ mode === 'register' ? 'border-b-2 border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300' }`}
            >
              Daftar
            </button>
          </div>

          <form 
            className="flex flex-col gap-4" 
            onSubmit={handleSubmit}
            onFocusCapture={() => setIsFormFocused(true)}
            onBlurCapture={() => setIsFormFocused(false)}
          >
            {errors.api && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3.5 text-sm font-medium text-rose-600 dark:text-rose-400 text-center transition-colors">
                {errors.api}
              </div>
            )}
            {errors.success && (
              <div className="rounded-xl border border-teal-200 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/10 p-3.5 text-sm font-medium text-teal-700 dark:text-teal-400 text-center transition-colors">
                {errors.success}
              </div>
            )}

            {mode === 'register' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
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
              <div className="relative">
                <CustomInput
                  label="Kata Sandi"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(val) => setFormData({ ...formData, password: val })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400 hover:text-teal-600 dark:text-zinc-500 dark:hover:text-teal-400 outline-none transition-colors"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {errors.password && <span className="mt-1 ml-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.password}</span>}

              {mode === 'login' && (
                <div className="mt-2.5 flex justify-end">
                  <Link
                    to="/reset-password"
                    className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors focus:outline-none"
                  >
                    Lupa Sandi?
                  </Link>
                </div>
              )}

              {mode === 'register' && (
                <div className="mt-2.5 flex gap-1 px-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 w-1/4 rounded-full transition-all duration-300 ${ passwordStrength >= level ? passwordStrength <= 2 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-teal-500 dark:bg-teal-400' : 'bg-slate-200 dark:bg-zinc-800' }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                  <CustomInput
                    label="Verifikasi Kata Sandi"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi"
                    value={formData.confirmPassword}
                    onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400 hover:text-teal-600 dark:text-zinc-500 dark:hover:text-teal-400 outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <span className="mt-1 ml-1 text-xs font-medium text-rose-500 dark:text-rose-400">{errors.confirmPassword}</span>}
              </div>
            )}

            {mode === 'register' && (
              <div className="mt-2 flex items-start gap-3 px-1 animate-in fade-in duration-300">
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
                    <span className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
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
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-teal-600 text-white hover:bg-teal-700 font-medium text-sm rounded-xl shadow-md shadow-teal-500/20 transition-all outline-none active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  mode === 'login' ? 'Masuk ke Portal' : 'Daftar Akun'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 mb-6 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800 transition-colors"></div>
            </div>
            <div className="relative bg-white dark:bg-[#1e1f20] px-4 text-xs font-medium text-slate-400 dark:text-zinc-500 transition-colors">
              Atau Lanjutkan Dengan
            </div>
          </div>

          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#131314] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-medium text-sm rounded-xl shadow-sm transition-all outline-none active:scale-95"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </div>
    </div>
  )
}