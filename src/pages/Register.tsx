// src/pages/Register.tsx
import { Link } from 'react-router-dom';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

export default function Register() {
  return (
    <div className="w-full min-h-screen flex font-['Inter']">
      {/* Sisi Kiri: Branding & Visual (Konsisten dengan Login) */}
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
            Mulai Perjalanan Medis Digital Anda
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Daftarkan diri Anda untuk mendapatkan akses penuh ke layanan kesehatan prediktif dan manajemen antrean cerdas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-max">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex justify-center items-center">
            <div className="w-4 h-5 bg-teal-400 rounded-sm"></div>
          </div>
          <div className="flex flex-col text-white">
            <span className="text-sm font-bold">Privasi Terjamin</span>
            <span className="text-slate-400 text-xs">Data Medis Dienkripsi End-to-End</span>
          </div>
        </div>
      </div>

      {/* Sisi Rapat: Form Registrasi */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden">
        
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-teal-900 to-slate-900 z-0"></div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-900/10 lg:shadow-slate-200/50 border border-slate-100 p-8 md:p-10 flex flex-col relative z-10 my-8">
          
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-zinc-900 text-3xl font-bold font-['Manrope']">Daftar Akun</h2>
            <p className="text-zinc-500 text-sm">Lengkapi data di bawah untuk registrasi pasien.</p>
          </div>

          <div className="flex w-full border-b border-slate-200 mb-8">
            <Link to="/login" className="w-1/2 pb-4 text-center text-slate-400 hover:text-slate-600 text-sm font-semibold transition-all focus:outline-none">
              Masuk
            </Link>
            <Link to="/register" className="w-1/2 pb-4 text-center text-teal-600 text-sm font-bold border-b-2 border-teal-600 transition-all focus:outline-none">
              Daftar Baru
            </Link>
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            
            <AuthInput 
              label="Nama Lengkap" 
              type="text" 
              placeholder="Sesuai KTP" 
            />

            <AuthInput 
              label="NIK (Nomor Induk Kependudukan)" 
              type="text" 
              placeholder="16 Digit Nomor KTP" 
            />

            <div className="flex flex-col gap-2">
              <AuthInput 
                label="Kata Sandi" 
                type="password" 
                placeholder="Minimal 8 karakter" 
              />
              {/* Password Strength Indicator Placeholder */}
              <div className="flex gap-1 mt-1">
                <div className="h-1 w-1/4 rounded-full bg-slate-200"></div>
                <div className="h-1 w-1/4 rounded-full bg-slate-200"></div>
                <div className="h-1 w-1/4 rounded-full bg-slate-200"></div>
                <div className="h-1 w-1/4 rounded-full bg-slate-200"></div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium italic">Gunakan kombinasi huruf, angka, dan simbol.</span>
            </div>

            <AuthInput 
              label="Konfirmasi Kata Sandi" 
              type="password" 
              placeholder="Ulangi kata sandi" 
            />

            {/* Terms and Conditions Acknowledgment */}
            <div className="flex items-start gap-3 mt-2">
              <input 
                type="checkbox" 
                id="terms"
                className="mt-1 w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                Saya menyetujui <a href="#" className="text-teal-600 font-semibold hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-teal-600 font-semibold hover:underline">Kebijakan Privasi</a> RS Ethereal.
              </label>
            </div>

            <AuthButton type="submit">
              Daftar Akun Baru
            </AuthButton>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Sudah terdaftar sebelumnya? <br/>
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Masuk ke Portal</Link>
          </p>

        </div>
      </div>
    </div>
  );
}