// src/pages/ResetPassword.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthButton from '../components/auth/AuthButton'
import AuthInput from '../components/auth/AuthInput'
import apiClient from '../lib/apiClient'
import { getErrorMessage } from '../lib/errors'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi input tidak boleh kosong
    if (!email.trim()) {
      setError('Email wajib diisi')
      return
    }

    // Validasi format email menggunakan RegEx
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // Eksekusi API call ke backend
      // Endpoint disesuaikan dengan standar industri (pastikan backend merespons endpoint ini)
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
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Inter']">
      {/* SISI KIRI: Branding Statis (Dipertahankan 100% dari desain Anda) */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-linear-to-br from-teal-900 to-slate-900 p-12 lg:flex">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-[80px]"></div>
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-500/20 blur-[80px]"></div>

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
            Pemulihan Akses
          </h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Jangan khawatir jika Anda melupakan kata sandi. Keamanan akun dan privasi data medis
            Anda tetap terjamin.
          </p>
        </div>

        <div className="relative z-10 w-max rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <span className="text-sm font-bold tracking-wider text-teal-400 uppercase">
            Protokol Keamanan Aktif
          </span>
        </div>
      </div>

      {/* SISI KANAN: Form Pemulihan dengan Top Anchoring */}
      <div className="h-full w-full scrollbar-none overflow-y-auto bg-slate-50 px-6 pt-16 pb-20 sm:px-12 lg:flex-1 [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200 md:p-10">
          <div className="mb-8 flex flex-col gap-2 text-center lg:text-left">
            <h2 className="font-['Manrope'] text-3xl font-bold text-zinc-900">Reset Kata Sandi</h2>
            <p className="text-sm text-zinc-500">
              Masukkan Email Anda untuk menerima instruksi pemulihan.
            </p>
          </div>

          {!isSuccess ? (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Tampilan Error API */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Disesuaikan menjadi Email saja sesuai requirement backend */}
              <AuthInput
                label="Email Terdaftar"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="mt-2">
                <AuthButton type="submit" isLoading={isLoading}>
                  Kirim Tautan Pemulihan
                </AuthButton>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <svg
                  className="h-8 w-8 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Instruksi Terkirim</h3>
              <p className="text-sm text-zinc-500">
                Kami telah mengirimkan langkah pemulihan ke kontak yang terhubung dengan akun{' '}
                <span className="font-semibold text-teal-700">{email}</span>. Silakan periksa kotak
                masuk Anda.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
