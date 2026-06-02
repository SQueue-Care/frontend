import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'

export default function Landing() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] font-['Inter'] antialiased flex flex-col transition-colors duration-500 overflow-x-hidden">
      
      {/* Navbar & Dark Mode Toggle */}
      <header className="fixed top-0 z-50 flex w-full justify-center border-b border-slate-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-[#131314]/70 backdrop-blur-xl transition-colors duration-500">
        <div className="flex w-full max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo SQueue-Care */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 shadow-sm transition-colors duration-500">
              <span className="font-['Manrope'] text-lg font-bold text-white dark:text-zinc-900">SQ</span>
            </div>
            <span className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-white tracking-tight transition-colors duration-500">
              SQueue-Care
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Fitur</a>
            <a href="#arsitektur" className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Arsitektur</a>
            <a href="#kontak" className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Kontak</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors duration-500 outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <Link
              to="/auth"
              className="hidden md:flex items-center justify-center px-5 py-2.5 rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-zinc-900 font-medium text-sm shadow-md shadow-teal-600/20 dark:shadow-teal-900/40 hover:bg-teal-700 dark:hover:bg-teal-400 transition-all duration-500"
            >
              Portal Pasien
            </Link>
          </div>
        </div>
      </header>

      {/* Interactive Hero Section (Split Layout) */}
      <main className="flex flex-col items-center w-full pt-32 pb-16 px-6 relative">
        
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-teal-600/10 dark:bg-teal-500/10 blur-3xl transition-colors duration-500"></div>
          <div className="absolute top-1/4 -right-32 h-[500px] w-[500px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-3xl transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[70vh]">
          
          {/* Left Side: Copywriting */}
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 transition-colors duration-500">
              <span className="flex w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400 uppercase transition-colors duration-500">
                Versi 1.0
              </span>
            </div>

            <h1 className="font-['Manrope'] text-5xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white leading-[1.1] tracking-tight transition-colors duration-500">
              Manajemen Antrean <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-300 transition-colors duration-500">
                Level Enterprise
              </span>
            </h1>

            <p className="font-['Inter'] font-medium text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed transition-colors duration-500">
              SQueue-Care menghadirkan solusi infrastruktur medis berbasis algoritma kepadatan, mengurangi latensi tunggu dan meningkatkan operasional rumah sakit modern secara real-time.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link
                to="/auth"
                className="flex items-center justify-center px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-900 font-medium text-base shadow-lg shadow-teal-600/20 dark:shadow-teal-900/40 transition-all duration-500"
              >
                Integrasikan Sekarang
              </Link>
              <a
                href="#arsitektur"
                className="flex items-center justify-center px-8 py-4 rounded-xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 text-slate-700 dark:text-slate-200 font-medium text-base transition-all duration-500"
              >
                Pelajari Arsitektur
              </a>
            </div>
          </div>

          {/* Right Side: 3D Mockup */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[520px] bg-white dark:bg-[#1e1f20] border border-slate-200/60 dark:border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden [transform:perspective(1200px)_rotateY(-10deg)_rotateX(8deg)] hover:[transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)] hover:scale-[1.02] transition-transform duration-500 ease-out">
              
              {/* Mockup Header */}
              <div className="h-14 border-b border-slate-100 dark:border-zinc-800 flex items-center px-5 gap-2.5 bg-slate-50/80 dark:bg-[#131314]/80 backdrop-blur-sm transition-colors duration-500">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/90 shadow-sm"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-sm"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-sm"></div>
                <div className="ml-4 px-3 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex-1 flex items-center">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 truncate">squeue-care.med/dashboard</span>
                </div>
              </div>
              
              {/* Mockup Body */}
              <div className="p-6 md:p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="w-32 h-5 rounded-md bg-slate-200 dark:bg-zinc-700 transition-colors duration-500"></div>
                    <div className="w-48 h-4 rounded-md bg-slate-100 dark:bg-zinc-800 transition-colors duration-500"></div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800/50 flex items-center justify-center transition-colors duration-500">
                    <div className="w-6 h-6 rounded-full bg-teal-600 dark:bg-teal-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/5 border border-teal-100 dark:border-teal-500/10 transition-colors duration-500">
                    <div className="w-8 h-8 rounded-lg bg-teal-200 dark:bg-teal-800/50 mb-4 transition-colors duration-500"></div>
                    <div className="w-16 h-6 rounded-md bg-teal-600 dark:bg-teal-500 mb-2 transition-colors duration-500"></div>
                    <div className="w-24 h-4 rounded-md bg-teal-200 dark:bg-teal-800/50 transition-colors duration-500"></div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800 transition-colors duration-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-700 mb-4 transition-colors duration-500"></div>
                    <div className="w-16 h-6 rounded-md bg-slate-300 dark:bg-zinc-600 mb-2 transition-colors duration-500"></div>
                    <div className="w-24 h-4 rounded-md bg-slate-200 dark:bg-zinc-700 transition-colors duration-500"></div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col gap-4 transition-colors duration-500">
                  <div className="w-full h-4 rounded-md bg-slate-100 dark:bg-zinc-800 transition-colors duration-500"></div>
                  <div className="w-5/6 h-4 rounded-md bg-slate-100 dark:bg-zinc-800 transition-colors duration-500"></div>
                  <div className="w-4/6 h-4 rounded-md bg-slate-100 dark:bg-zinc-800 transition-colors duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof Banner */}
      <div className="w-full border-y border-slate-200/80 dark:border-zinc-800 bg-white/40 dark:bg-[#1e1f20]/40 backdrop-blur-md py-5 transition-colors duration-500 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-center gap-3 text-slate-500 dark:text-zinc-400 text-center">
           <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
           </svg>
           <span className="font-['Inter'] font-medium text-sm md:text-base transition-colors duration-500">
              Infrastruktur Terintegrasi NIK & BPJS dengan Enkripsi Keamanan Data
           </span>
        </div>
      </div>

      {/* Fitur Inti (Bento Grid Layout) */}
      <section id="arsitektur" className="py-24 px-6 w-full max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="font-['Manrope'] text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white transition-colors duration-500">
            Arsitektur Inti Sistem
          </h2>
          <p className="font-['Inter'] font-medium text-slate-500 dark:text-zinc-400 mt-4 max-w-2xl mx-auto transition-colors duration-500">
            Platform dirancang menggunakan mikrolayanan berkinerja tinggi untuk stabilitas dan ekstensibilitas pelayanan rumah sakit skala besar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Card 1: Col-span 2 (Real-Time Sync) */}
           <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-500 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-500"></div>
              <h3 className="font-['Manrope'] text-2xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors duration-500">
                Sinkronisasi Antrean Real-Time
              </h3>
              <p className="font-['Inter'] text-slate-500 dark:text-zinc-400 font-medium max-w-md transition-colors duration-500">
                Memproses perubahan status pasien dalam hitungan milidetik tanpa membebani database utama melalui protokol tingkat lanjut.
              </p>
              
              <div className="mt-10 flex gap-4 items-center justify-center w-full h-44 bg-slate-50 dark:bg-[#131314] rounded-2xl border border-slate-100 dark:border-zinc-800/80 transition-colors duration-500 relative z-10">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center border border-teal-200 dark:border-teal-700/50 shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-teal-600 dark:bg-teal-500 animate-ping absolute opacity-75"></div>
                  <div className="w-6 h-6 rounded-full bg-teal-600 dark:bg-teal-500 relative"></div>
                </div>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex relative">
                   <div className="w-full h-full bg-teal-500 origin-left animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1e1f20] shadow-md flex items-center justify-center border border-slate-200 dark:border-zinc-700 transition-colors duration-500">
                  <svg className="w-7 h-7 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
           </div>
           
           {/* Card 2: Col-span 1 (Algoritma Kepadatan) */}
           <div className="col-span-1 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-500 shadow-sm flex flex-col relative overflow-hidden">
              <h3 className="font-['Manrope'] text-2xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors duration-500">
                Algoritma Kepadatan
              </h3>
              <p className="font-['Inter'] text-slate-500 dark:text-zinc-400 font-medium mb-8 transition-colors duration-500 text-sm">
                Load balancing dinamis antar poli klinik.
              </p>
              
              <div className="flex-1 flex flex-col gap-3.5 justify-end">
                 <div className="flex items-center gap-3.5 w-full bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 transition-colors duration-500">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   <span className="font-['Inter'] text-sm font-semibold text-emerald-700 dark:text-emerald-400">Poli Umum: Lancar</span>
                 </div>
                 <div className="flex items-center gap-3.5 w-full bg-amber-50 dark:bg-amber-500/10 px-4 py-3.5 rounded-xl border border-amber-100 dark:border-amber-500/20 transition-colors duration-500">
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                   <span className="font-['Inter'] text-sm font-semibold text-amber-700 dark:text-amber-400">Poli Gigi: Sedang</span>
                 </div>
                 <div className="flex items-center gap-3.5 w-full bg-rose-50 dark:bg-rose-500/10 px-4 py-3.5 rounded-xl border border-rose-100 dark:border-rose-500/20 transition-colors duration-500">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                   <span className="font-['Inter'] text-sm font-semibold text-rose-700 dark:text-rose-400">Poli Anak: Padat</span>
                 </div>
              </div>
           </div>
           
           {/* Card 3: Col-span 3 (RBAC) */}
           <div className="col-span-1 md:col-span-3 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-500 shadow-sm flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h3 className="font-['Manrope'] text-2xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors duration-500">
                  Otorisasi Rekam Medis (RBAC)
                </h3>
                <p className="font-['Inter'] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                  Diperkuat dengan Kontrol Akses Berbasis Peran (Role-Based Access Control). Setiap kueri data medis, mulai dari identitas hingga resep, dienkripsi secara end-to-end, memastikan kepatuhan penuh terhadap standar regulasi kesehatan digital.
                </p>
              </div>
              <div className="w-full md:w-auto flex justify-center flex-shrink-0">
                 <div className="w-28 h-28 bg-slate-50 dark:bg-[#131314] rounded-3xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center transform rotate-3 hover:rotate-6 transition-all duration-500 shadow-inner">
                    <svg className="w-12 h-12 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Emergency Hospital Footer */}
      <footer id="kontak" className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131314] transition-colors duration-500 mt-auto py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           
           <div className="flex flex-col items-start gap-2">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
               <span className="font-['Inter'] text-rose-600 dark:text-rose-500 font-bold text-sm tracking-wider uppercase transition-colors duration-500">
                 Instalasi Gawat Darurat
               </span>
             </div>
             <span className="font-['Manrope'] text-zinc-900 dark:text-white text-4xl font-extrabold tracking-tight transition-colors duration-500">
               IGD: 1-500-911
             </span>
             <address className="font-['Inter'] text-slate-500 dark:text-zinc-400 font-medium text-sm mt-3 not-italic transition-colors duration-500 max-w-sm leading-relaxed">
               Jl. Kesehatan No. 88, Pusat Medis SQueue-Care. Siaga Darurat 24 Jam Non-Stop.
             </address>
           </div>
           
           <div className="flex flex-col md:items-end gap-6 w-full md:w-auto">
              <div className="flex flex-wrap gap-6 border-t md:border-t-0 border-slate-100 dark:border-zinc-800 pt-6 md:pt-0 w-full md:w-auto">
                <Link to="/privacy" className="font-['Inter'] text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-zinc-500 dark:hover:text-teal-400 transition-colors duration-500">
                   Kebijakan Privasi
                </Link>
                <Link to="/terms" className="font-['Inter'] text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-zinc-500 dark:hover:text-teal-400 transition-colors duration-500">
                   Syarat & Ketentuan
                </Link>
                <a href="#kontak" className="font-['Inter'] text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-zinc-500 dark:hover:text-teal-400 transition-colors duration-500">
                   Hubungi Kami
                </a>
              </div>
              <span className="font-['Inter'] text-xs font-medium text-slate-400 dark:text-zinc-600 transition-colors duration-500">
                 &copy; 2026 SQueue-Care Hospital Systems. Hak cipta dilindungi.
              </span>
           </div>

        </div>
      </footer>
    </div>
  )
}
