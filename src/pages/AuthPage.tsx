// src/pages/AuthPage.tsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import { useAuthStore } from '../store/authStore';
import apiClient from '../lib/apiClient';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  
  // State untuk mengontrol animasi transisi
  const [isAnimate, setIsAnimate] = useState(true);

  // Fungsi untuk berpindah mode dengan animasi
  const toggleMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setIsAnimate(false); 
    setTimeout(() => {
      setMode(newMode);
      setIsAnimate(true); 
    }, 200);
  };

  // 1. Memori Data Form
  const [formData, setFormData] = useState({
    nama: '',
    email: '', 
    password: '',
    confirmPassword: '',
    agreed: false
  });

  // 2. Memori Error Validasi
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 3. Mesin Kalkulasi Kekuatan Sandi (Hanya berjalan ulang jika password berubah)
  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (formData.password.length >= 8) strength++; // Minimal 8 karakter
    if (/[A-Z]/.test(formData.password)) strength++; // Ada huruf besar
    if (/[0-9]/.test(formData.password)) strength++; // Ada angka
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++; // Ada simbol
    return strength;
  }, [formData.password]);

  // 4. Logika Pengecekan Form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validasi Khusus Register
    if (mode === 'register') {
      if (!formData.nama.trim()) newErrors.nama = "Nama lengkap wajib diisi";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok";
      }
      if (!formData.agreed) {
        newErrors.agreed = "Syarat dan ketentuan wajib disetujui";
      }
    }

    // Validasi Umum (Login & Register)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Mengembalikan 'true' jika tidak ada error
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return; 

    setIsLoading(true);
    setErrors({}); 

    try {
      if (mode === 'login') {
        // 1. Eksekusi Login 
        await login(formData.email, formData.password);
        
        // 2. Tarik data user terbaru dari state (Zustand) setelah login berhasil
        const currentUser = useAuthStore.getState().user;

        // 3. Pengalihan cerdas berbasis peran (Role-Based Redirect)
        if (currentUser?.role === 'PATIENT') {
          navigate('/portal');
        } else if (currentUser?.role === 'DOCTOR') {
          navigate('/doctor');
        } else if (currentUser?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          // Fallback keamanan jika role tidak terdeteksi
          setErrors({ api: "Peran pengguna tidak valid." });
        }
        
      } else {
        // Eksekusi Register
        await apiClient.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          name: formData.nama,
          role: 'PATIENT' // Menambahkan role eksplicit untuk memastikan pengguna baru adalah pasien
        });
        alert('Registrasi Berhasil! Silakan masuk dengan akun Anda.');
        setMode('login'); 
      }
    } catch (error: any) {
      setErrors({ 
        api: error.response?.data?.message || error.message || 'Terjadi kesalahan pada server. Silakan coba lagi.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex font-['Inter'] overflow-hidden bg-white">
      
      {/* SISI KIRI */}
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
            Portal Layanan Kesehatan Digital
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Satu akses aman untuk manajemen antrean, riwayat medis, dan jadwal konsultasi Anda.
          </p>
        </div>

        <div className="relative z-10 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-max">
          <span className="text-teal-400 text-sm font-bold tracking-wider uppercase">Keamanan Standar Medis</span>
        </div>
      </div>

      {/* SISI KANAN */}
      <div className="w-full lg:flex-1 bg-slate-50 h-full overflow-y-auto pt-16 pb-20 px-6 sm:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Card dengan Efek Transisi (Opacity & Transform) */}
        <div className={`w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-10 mx-auto transition-all duration-300 transform ${
          isAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          <div className="flex flex-col gap-2 mb-8 text-center lg:text-left">
            <h2 className="text-zinc-900 text-3xl font-bold font-['Manrope']">
              {mode === 'login' ? 'Masuk' : 'Daftar Baru'}
            </h2>
            <p className="text-zinc-500 text-sm">
              {mode === 'login' ? 'Gunakan akun rekam medis Anda.' : 'Lengkapi data untuk akses portal.'}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex w-full border-b border-slate-200 mb-8">
            <button 
              onClick={() => toggleMode('login')}
              className={`w-1/2 pb-4 text-sm font-bold transition-all ${mode === 'login' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => toggleMode('register')}
              className={`w-1/2 pb-4 text-sm font-bold transition-all ${mode === 'register' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400'}`}
            >
              Daftar
            </button>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleAuth}>
            
            {/* Tampilkan Error API jika ada */}
            {errors.api && (
              <div className="p-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {errors.api}
              </div>
            )}

            {mode === 'register' && (
              <AuthInput 
                label="Nama Lengkap" 
                placeholder="Nama sesuai identitas" 
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                error={errors.nama}
              />
            )}

            {/* Ubah label dan binding nilai dari NIK ke Email */}
            <AuthInput 
              label="Email Terdaftar" 
              type="email"
              placeholder="contoh@email.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              error={errors.email}
            />

            <div className="flex flex-col gap-1">
              <AuthInput 
                label="Kata Sandi" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                error={errors.password}
              />

              {mode === 'login' && (
                <div className="flex justify-end mt-1">
                  <Link to="/reset-password" className="text-xs font-semibold text-teal-600 hover:text-teal-700 focus:outline-none focus:underline">
                    Lupa Sandi?
                  </Link>
                </div>
              )}
              
              {/* Indikator Kekuatan Sandi (Hanya untuk Register) */}
              {mode === 'register' && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1.5 w-1/4 rounded-full transition-all duration-300 ${
                          passwordStrength >= level 
                            ? passwordStrength <= 2 ? 'bg-amber-500' : 'bg-teal-500' 
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <AuthInput 
                label="Verifikasi Kata Sandi" 
                type="password" 
                placeholder="Ulangi kata sandi" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                error={errors.confirmPassword}
              />
            )}

            {mode === 'register' && (
              <div className="flex items-start gap-3 mt-1">
                <input 
                  type="checkbox" 
                  id="terms"
                  checked={formData.agreed}
                  onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                  className="mt-1 w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer">
                    Saya menyetujui <span className="text-teal-600 font-semibold hover:underline">Syarat & Ketentuan</span> RS Ethereal.
                  </label>
                  {errors.agreed && <span className="text-red-500 text-xs mt-1 font-medium">{errors.agreed}</span>}
                </div>
              </div>
            )}

            <div className="mt-4">
            <AuthButton 
                type="submit" 
                isLoading={isLoading}
            >
                {mode === 'login' ? 'Masuk ke Portal' : 'Daftar Akun Pasien'}
            </AuthButton>
            </div>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            {mode === 'login' ? 'Belum punya rekam medis?' : 'Sudah punya akun?'}{' '}
            <button 
              onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
              className="text-teal-600 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Registrasi Sekarang' : 'Masuk ke Akun'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}