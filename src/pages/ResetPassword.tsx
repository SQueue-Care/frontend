// src/pages/ResetPassword.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'
import CustomInput from '../components/ui/CustomInput'

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

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [isMounted, setIsMounted] = useState(false)
  const [isFormFocused, setIsFormFocused] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email wajib diisi')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await apiClient.post('/auth/forgot-password', { email })
      setIsSuccess(true)
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, 'Gagal memproses permintaan. Pastikan email terdaftar di sistem.')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] flex items-center justify-center relative overflow-hidden transition-colors duration-500 font-['Inter'] antialiased px-4 py-8">
      
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

      <div 
        className={`relative z-10 w-full max-w-md bg-white/90 dark:bg-[#1e1f20]/90 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl p-8 sm:p-10 transition-all duration-700 ease-out ${ isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0' }`}
      >
        <div className="mb-8 text-center">
          <h2 className="font-['Manrope'] text-2xl md:text-[26px] font-semibold text-zinc-950 dark:text-white tracking-tight transition-colors">
            Pemulihan Akses
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors mt-2">
            Masukkan Email Anda untuk menerima instruksi pemulihan.
          </p>
        </div>

        {!isSuccess ? (
          <form 
            className="flex flex-col gap-4" 
            onSubmit={handleSubmit}
            onFocusCapture={() => setIsFormFocused(true)}
            onBlurCapture={() => setIsFormFocused(false)}
          >
            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600 dark:text-rose-400 text-center transition-colors">
                {error}
              </div>
            )}

            <div>
              <CustomInput
                label="Email Terdaftar"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(val) => setEmail(val)}
              />
            </div>

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
                    Memproses...
                  </>
                ) : (
                  'Kirim Tautan Pemulihan'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-2 text-center animate-in fade-in duration-500">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl text-zinc-900 dark:text-white">Instruksi Terkirim</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Kami telah mengirimkan langkah pemulihan ke kontak yang terhubung dengan akun{' '}
              <span className="text-teal-600 dark:text-teal-400">{email}</span>. Silakan periksa kotak masuk Anda.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400 transition-colors hover:text-teal-600 dark:hover:text-teal-400 focus:outline-none"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  )
}
