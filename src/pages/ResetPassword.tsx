// src/pages/ResetPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import apiClient from '../lib/apiClient';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input tidak boleh kosong
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    // Validasi format email menggunakan RegEx
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Eksekusi API call ke backend
      // Endpoint disesuaikan dengan standar industri (pastikan backend merespons endpoint ini)
      await apiClient.post('/auth/forgot-password', { email });
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses permintaan. Pastikan email terdaftar di sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex font-['Inter'] overflow-hidden bg-white">
      
      {/* SISI KIRI: Branding Statis (Dipertahankan 100% dari desain Anda) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="w-96 h-96 absolute -top-24 -left-24 bg-teal-500/20 rounded-full blur-[80px]"></div>
        <div className="w-96 h-96 absolute -bottom-24 -right-24 bg-blue-500/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
             <span className="text-white font-bold text-xl">RS</span>
          </div>
          <span className="text-white text-2xl font-extrabold font-['Manrope'] tracking-wide">Ethereal</span>
        </div>

        <div className="relative z-10 flex flex-col gap-6 max-w-md">
          <h1 className="text-white text-5xl font-extrabold font-['Manrope'] leading-tight">
            Pemulihan Akses
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Jangan khawatir jika Anda melupakan kata sandi. Keamanan akun dan privasi data medis Anda tetap terjamin.
          </p>
        </div>

        <div className="relative z-10 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-max">
          <span className="text-teal-400 text-sm font-bold tracking-wider uppercase">Protokol Keamanan Aktif</span>
        </div>
      </div>

      {/* SISI KANAN: Form Pemulihan dengan Top Anchoring */}
      <div className="w-full lg:flex-1 bg-slate-50 h-full overflow-y-auto pt-16 pb-20 px-6 sm:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-10 mx-auto">
          
          <div className="flex flex-col gap-2 mb-8 text-center lg:text-left">
            <h2 className="text-zinc-900 text-3xl font-bold font-['Manrope']">
              Reset Kata Sandi
            </h2>
            <p className="text-zinc-500 text-sm">
              Masukkan Email Anda untuk menerima instruksi pemulihan.
            </p>
          </div>

          {!isSuccess ? (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              
              {/* Tampilan Error API */}
              {error && (
                <div className="p-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
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
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Instruksi Terkirim</h3>
              <p className="text-sm text-zinc-500">
                Kami telah mengirimkan langkah pemulihan ke kontak yang terhubung dengan akun <span className="font-semibold text-teal-700">{email}</span>. Silakan periksa kotak masuk Anda.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/auth" className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Halaman Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}