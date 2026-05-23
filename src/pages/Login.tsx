// src/pages/Login.tsx
import { Link } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

export default function Login() {
  return (
    <div className="w-full min-h-screen flex font-['Inter']">
      {/* Sisi Kiri: Branding & Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="w-96 h-96 absolute -top-24 -left-24 bg-teal-500/20 rounded-full blur-[80px]"></div>
        <div className="w-96 h-96 absolute -bottom-24 -right-24 bg-blue-500/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex items-center justify-start gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-teal-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="10" x2="18" y2="10" />
            <line x1="8" y1="14" x2="12" y2="14" />
            <circle cx="17" cy="16" r="2.5" />
            <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
          </svg>
          <div className="flex items-center gap-1">
            <span className="text-teal-400 text-2xl font-extrabold font-['Manrope'] tracking-wide">RS</span>
            <span className="text-white text-2xl font-extrabold font-['Manrope'] tracking-wide">Ethereal</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-6 max-w-md">
          <h1 className="text-white text-5xl font-extrabold font-['Manrope'] leading-tight">
            Selamat Datang di Portal Pasien
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Kelola jadwal, pantau antrean real-time, dan akses riwayat medis Anda dalam satu platform cerdas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-max">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex justify-center items-center">
            <div className="w-4 h-5 bg-teal-400 rounded-sm"></div>
          </div>
          <div className="flex flex-col text-white">
            <span className="text-sm font-bold">Terintegrasi & Aman</span>
            <span className="text-slate-400 text-xs">Sistem Enkripsi Standar Medis</span>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Form Autentikasi */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden">
        
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-teal-900 to-slate-900 z-0"></div>
        <div className="lg:hidden w-64 h-64 absolute -top-10 -left-10 bg-teal-500/20 rounded-full blur-[60px] z-0"></div>
        <div className="lg:hidden w-64 h-64 absolute -bottom-10 -right-10 bg-blue-500/20 rounded-full blur-[60px] z-0"></div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-900/10 lg:shadow-slate-200/50 border border-slate-100 p-8 md:p-10 flex flex-col relative z-10">
          
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-zinc-900 text-3xl font-bold font-['Manrope']">Masuk ke Akun</h2>
            <p className="text-zinc-500 text-sm">Silakan masukkan kredensial Anda.</p>
          </div>

          <div className="flex w-full border-b border-slate-200 mb-8">
            <Link to="/login" className="w-1/2 pb-4 text-center text-teal-600 text-sm font-bold border-b-2 border-teal-600 transition-all focus:outline-none">
              Masuk
            </Link>
            <Link to="/register" className="w-1/2 pb-4 text-center text-slate-400 hover:text-slate-600 text-sm font-semibold transition-all focus:outline-none">
              Daftar Baru
            </Link>
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            
            <AuthInput 
              label="NIK / Nomor Rekam Medis" 
              type="text" 
              placeholder="Masukkan 16 digit NIK" 
            />

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-zinc-700 text-sm font-semibold">Kata Sandi</label>
                <Link to="/reset-password" className="text-teal-600 text-xs font-semibold hover:text-teal-700 focus:outline-none focus:underline">Lupa Sandi?</Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-400" 
              />
            </div>

            <AuthButton type="submit" isLoading={false}>
              Masuk ke Portal
            </AuthButton>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Belum memiliki rekam medis? <br/>
            <Link to="/register" className="text-teal-600 font-semibold hover:underline focus:outline-none focus:underline">Registrasi Pasien Baru</Link>
          </p>

        </div>
      </div>
    </div>
  );
}