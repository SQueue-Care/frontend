import { useEffect, useState, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'slide-left' | 'slide-right' | 'pop-up' | 'flip-up';
}

function AnimatedElement({ children, className = '', delay = 0, animation = 'fade-up' }: AnimatedElementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // SARAN REVISI: rootMargin diubah menjadi '-25% 0px -25% 0px'. 
    // Ini memaksa elemen untuk langsung menghilang (out) ketika menyentuh 25% batas atas atau bawah layar, 
    // sehingga tidak ada dua seksi yang bertumpuk atau menyala bersamaan.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '-25% 0px -25% 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  let hiddenClass = 'opacity-0 translate-y-12';
  if (animation === 'slide-left') hiddenClass = 'opacity-0 -translate-x-24';
  if (animation === 'slide-right') hiddenClass = 'opacity-0 translate-x-24';
  if (animation === 'pop-up') hiddenClass = 'opacity-0 scale-75';
  if (animation === 'flip-up') hiddenClass = 'opacity-0 [transform:rotateX(60deg)]';

  const visibleClass = 'opacity-100 translate-x-0 translate-y-0 scale-100 [transform:rotateX(0deg)]';

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] origin-center ${
        isVisible ? visibleClass : hiddenClass
      } ${className}`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        perspective: animation === 'flip-up' ? '1000px' : 'none'
      }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useThemeStore()
  const [isMounted, setIsMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // SARAN REVISI: State baru untuk mengelola fokus kartu pada bagian prosedur.
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    const timer = setTimeout(() => setIsMounted(true), 100)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  const heroOpacity = Math.max(1 - scrollY / 600, 0);
  const heroTranslateY = scrollY * 0.4;

  const procedureCards = [
    { step: '01', title: 'Otentikasi Identitas', desc: 'Masuk portal pasien menggunakan NIK KTP atau nomor BPJS aktif Anda.', icon: 'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z' },
    { step: '02', title: 'Pilih Poliklinik', desc: 'Pilih layanan yang dituju. Sistem akan merekomendasikan dokter dengan antrean terluang.', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { step: '03', title: 'Ambil Nomor Digital', desc: 'Dapatkan kode QR dan estimasi waktu pelayanan yang akurat berdasarkan algoritma kepadatan.', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { step: '04', title: 'Validasi Kedatangan', desc: 'Datang ke rumah sakit hanya saat nomor Anda sudah dekat. Pindai QR di mesin lobi.', icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] font-['Inter'] antialiased flex flex-col transition-colors duration-500 overflow-x-hidden">
      
      {/* Navbar */}
      <header className={`fixed top-0 z-50 flex w-full justify-center border-b border-slate-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-[#131314]/70 backdrop-blur-xl transition-all duration-700 ease-out ${isMounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex w-full max-w-7xl items-center justify-between px-6 py-4">
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 shadow-sm transition-colors duration-500">
              <span className="font-['Manrope'] text-lg font-bold text-white dark:text-zinc-900">SQ</span>
            </div>
            <span className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-white tracking-tight transition-colors duration-500">
              SQueue-Care
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#prosedur" onClick={(e) => scrollToSection(e, 'prosedur')} className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Prosedur</a>
            <a href="#live-queue" onClick={(e) => scrollToSection(e, 'live-queue')} className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Live Antrean</a>
            <a href="#jadwal-dokter" onClick={(e) => scrollToSection(e, 'jadwal-dokter')} className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Jadwal Dokter</a>
            <a href="#arsitektur" onClick={(e) => scrollToSection(e, 'arsitektur')} className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-500">Arsitektur</a>
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
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

      {/* 1. HERO SECTION DENGAN EFEK PARALLAX */}
      <section className="min-h-screen flex flex-col justify-center items-center w-full pt-20 px-6 relative z-0">
        <div 
          className="absolute inset-0 w-full h-full flex flex-col justify-center items-center pointer-events-none"
          style={{ opacity: heroOpacity, transform: `translateY(${heroTranslateY}px)` }}
        >
          <div className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 -left-32 h-[600px] w-[600px] rounded-full bg-teal-600/10 dark:bg-teal-500/10 blur-3xl transition-colors duration-500"></div>
            <div className="absolute bottom-0 -right-32 h-[500px] w-[500px] rounded-full bg-blue-600/10 dark:bg-blue-500/10 blur-3xl transition-colors duration-500"></div>
          </div>

          <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center pointer-events-auto">
            <div className="flex flex-col items-start gap-6">
              
              <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] delay-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <span className="flex w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse"></span>
                <span className="text-xs font-bold tracking-wide text-teal-700 dark:text-teal-400 uppercase transition-colors duration-500">
                  Versi 1.0
                </span>
              </div>

              <h1 className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] delay-200 font-['Manrope'] text-5xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white leading-[1.1] tracking-tight ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Manajemen Antrean <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-300 transition-colors duration-500">
                  Level Enterprise
                </span>
              </h1>

              <p className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] delay-300 font-['Inter'] font-medium text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                SQueue-Care menghadirkan solusi infrastruktur medis berbasis algoritma kepadatan, mengurangi latensi tunggu dan meningkatkan operasional rumah sakit modern secara real-time.
              </p>

              <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] delay-[400ms] flex flex-wrap items-center gap-4 mt-4 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <Link
                  to="/auth"
                  className="flex items-center justify-center px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-900 font-bold text-base shadow-lg shadow-teal-600/20 dark:shadow-teal-900/40 transition-all duration-500"
                >
                  Integrasikan Sekarang
                </Link>
                <a
                  href="#prosedur"
                  onClick={(e) => scrollToSection(e, 'prosedur')}
                  className="flex items-center justify-center px-8 py-4 rounded-xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 text-slate-700 dark:text-slate-200 font-bold text-base transition-all duration-500"
                >
                  Lihat Prosedur
                </a>
              </div>
            </div>

            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] delay-[500ms] w-full flex justify-center lg:justify-end ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="w-full max-w-[520px] bg-white dark:bg-[#1e1f20] border border-slate-200/60 dark:border-zinc-800/60 rounded-3xl shadow-2xl overflow-hidden [transform:perspective(1200px)_rotateY(-10deg)_rotateX(8deg)] hover:[transform:perspective(1200px)_rotateY(0deg)_rotateX(0deg)] hover:scale-[1.02] transition-transform duration-500 ease-out">
                <div className="h-14 border-b border-slate-100 dark:border-zinc-800 flex items-center px-5 gap-2.5 bg-slate-50/80 dark:bg-[#131314]/80 backdrop-blur-sm transition-colors duration-500">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500/90 shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-sm"></div>
                  <div className="ml-4 px-3 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex-1 flex items-center">
                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 truncate">squeue-care.med/dashboard</span>
                  </div>
                </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEKSI PROSEDUR */}
      <section 
        id="prosedur" 
        className="w-full pt-16 pb-24 px-6 relative z-20 scroll-mt-28 bg-slate-50 dark:bg-[#131314] min-h-screen flex flex-col justify-start"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center w-full h-full">
          <AnimatedElement animation="fade-up" className="text-center mb-16 w-full">
            <h2 className="font-['Manrope'] text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white transition-colors duration-500">
              Prosedur Pelayanan Digital
            </h2>
            <p className="font-['Inter'] font-medium text-slate-500 dark:text-zinc-400 mt-4 max-w-2xl mx-auto transition-colors duration-500">
              Akses layanan medis tanpa birokrasi manual. Ikuti 4 langkah efisien ini untuk mendapatkan nomor antrean Anda dari rumah.
            </p>
          </AnimatedElement>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative">
            {procedureCards.map((item, idx) => {
              const isHovered = hoveredCard === idx;
              const isOthersHovered = hoveredCard !== null && hoveredCard !== idx;

              return (
                <AnimatedElement key={idx} animation="slide-left" delay={idx * 150} className="w-full h-full">
                  <div 
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`group flex flex-col bg-white dark:bg-[#1e1f20] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] h-full origin-center relative
                      ${isHovered ? 'scale-105 shadow-2xl z-20 border-teal-200 dark:border-teal-800/50' : 
                        isOthersHovered ? 'scale-90 opacity-60 z-0' : 
                        'scale-100 opacity-100 hover:-translate-y-2 z-10'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-500">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                      </div>
                      <span className="font-['Manrope'] text-3xl font-extrabold text-slate-200 dark:text-zinc-800 group-hover:text-teal-100 dark:group-hover:text-teal-900/50 transition-colors duration-500">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-white mb-3 transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="font-['Inter'] text-sm font-medium text-slate-500 dark:text-zinc-400 leading-relaxed transition-colors duration-500 mt-auto">
                      {item.desc}
                    </p>
                  </div>
                </AnimatedElement>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SEKSI LIVE ANTREAN */}
      <section id="live-queue" className="min-h-screen flex flex-col justify-center items-center py-24 px-6 w-full relative z-20 bg-white/50 dark:bg-[#1e1f20]/30 border-y border-slate-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <AnimatedElement animation="slide-left" delay={100} className="order-2 lg:order-1 flex justify-center w-full">
            <div className="w-full max-w-lg bg-white dark:bg-[#1e1f20] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-zinc-800 pb-6">
                <div>
                  <h4 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-white">Poli Penyakit Dalam</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Dr. Sarah Wijaya, Sp.PD</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">LIVE</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-[#131314] rounded-2xl border border-slate-100 dark:border-zinc-800 mb-6">
                <span className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase tracking-widest">Sedang Dilayani</span>
                <span className="font-['Manrope'] text-6xl font-extrabold text-teal-600 dark:text-teal-400 tabular-nums tracking-tighter">A-12</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-700 rounded-2xl flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1">Antrean Anda</span>
                  <span className="font-['Manrope'] text-2xl font-bold text-zinc-900 dark:text-white">A-15</span>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex flex-col">
                  <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase mb-1">Estimasi Waktu</span>
                  <span className="font-['Manrope'] text-2xl font-bold text-rose-600 dark:text-rose-400">15 Mnt</span>
                </div>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="slide-right" delay={300} className="order-1 lg:order-2 flex flex-col items-start gap-6">
            <h2 className="font-['Manrope'] text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white transition-colors duration-500 leading-tight">
              Pantau Antrean Secara <span className="text-teal-600 dark:text-teal-400">Real-Time</span>
            </h2>
            <p className="font-['Inter'] font-medium text-lg text-slate-500 dark:text-zinc-400 leading-relaxed transition-colors duration-500">
              Tinggalkan ruang tunggu rumah sakit yang penuh sesak. Teknologi WebSockets SQueue-Care menyinkronkan data nomor antrean langsung ke layar ponsel Anda dalam hitungan milidetik.
            </p>
            <ul className="flex flex-col gap-4 mt-2">
              {[
                'Hitungan estimasi waktu presisi berbasis algoritma.',
                'Notifikasi visual ketika nomor antrean Anda sudah dekat.',
                'Data dijamin tersinkron dengan layar lobi rumah sakit.'
              ].map((text, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-medium text-sm text-slate-600 dark:text-zinc-300">{text}</span>
                </li>
              ))}
            </ul>
          </AnimatedElement>
        </div>
      </section>

      {/* 4. SEKSI JADWAL DOKTER */}
      <section id="jadwal-dokter" className="min-h-screen flex flex-col justify-center items-center py-24 px-6 w-full max-w-7xl mx-auto z-20 relative bg-slate-50 dark:bg-[#131314]">
         <AnimatedElement animation="fade-up" className="text-center mb-16 w-full flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-left max-w-2xl">
            <h2 className="font-['Manrope'] text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white transition-colors duration-500">
              Jadwal Poliklinik & Dokter
            </h2>
            <p className="font-['Inter'] font-medium text-slate-500 dark:text-zinc-400 mt-4 transition-colors duration-500">
              Informasi ketersediaan tenaga medis profesional RS Ethereal hari ini. Sistem ini memfilter dokter yang siap menerima antrean baru secara dinamis.
            </p>
          </div>
          <Link to="/auth" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1e1f20] hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-white transition-all shadow-sm">
            Lihat Jadwal Lengkap <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[
            { name: 'Dr. Sarah Wijaya, Sp.PD', dept: 'Poli Penyakit Dalam', time: '08:00 - 14:00 WIB', status: 'Tersedia', statusColor: 'emerald' },
            { name: 'Dr. Budi Santoso, Sp.A', dept: 'Poli Anak', time: '10:00 - 16:00 WIB', status: 'Penuh', statusColor: 'rose' },
            { name: 'Dr. Anita Rahma, Sp.M', dept: 'Poli Mata', time: '09:00 - 13:00 WIB', status: 'Hampir Penuh', statusColor: 'amber' },
            { name: 'Dr. Hendra Gunawan, Sp.S', dept: 'Poli Saraf', time: '13:00 - 19:00 WIB', status: 'Tersedia', statusColor: 'emerald' },
            { name: 'Dr. Lestari, Sp.OG', dept: 'Poli Kandungan', time: '08:00 - 12:00 WIB', status: 'Penuh', statusColor: 'rose' },
            { name: 'Dr. Faisal, Sp.THT', dept: 'Poli THT', time: '14:00 - 20:00 WIB', status: 'Tersedia', statusColor: 'emerald' },
          ].map((doc, idx) => (
             <AnimatedElement key={idx} animation="pop-up" delay={idx * 100} className="w-full">
               <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 overflow-hidden">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-${doc.statusColor}-50 dark:bg-${doc.statusColor}-500/10 text-${doc.statusColor}-600 dark:text-${doc.statusColor}-400 border border-${doc.statusColor}-200 dark:border-${doc.statusColor}-500/20`}>
                      {doc.status}
                    </span>
                  </div>
                  <h4 className="font-['Manrope'] font-bold text-zinc-900 dark:text-white text-lg">{doc.name}</h4>
                  <span className="font-['Inter'] text-xs font-medium text-teal-600 dark:text-teal-400 mb-4">{doc.dept}</span>
                  <div className="mt-auto flex items-center gap-2 text-slate-500 dark:text-zinc-400 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold">{doc.time}</span>
                  </div>
               </div>
             </AnimatedElement>
          ))}
        </div>
      </section>

      {/* 5. SEKSI ARSITEKTUR */}
      <section id="arsitektur" className="py-24 px-6 w-full max-w-7xl mx-auto z-20 relative bg-slate-50 dark:bg-[#131314]">
        <AnimatedElement animation="fade-up" className="text-center mb-16">
          <h2 className="font-['Manrope'] text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white transition-colors duration-500">
            Arsitektur Inti Sistem
          </h2>
          <p className="font-['Inter'] font-medium text-slate-500 dark:text-zinc-400 mt-4 max-w-2xl mx-auto transition-colors duration-500">
            Platform dirancang menggunakan mikrolayanan berkinerja tinggi untuk stabilitas dan ekstensibilitas pelayanan rumah sakit skala besar.
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <AnimatedElement animation="flip-up" delay={100} className="col-span-1 md:col-span-2">
             <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-500 shadow-sm relative overflow-hidden group h-full">
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
           </AnimatedElement>
           
           <AnimatedElement animation="flip-up" delay={200} className="col-span-1">
             <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-500 shadow-sm flex flex-col relative overflow-hidden h-full">
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
           </AnimatedElement>
           
           <AnimatedElement animation="flip-up" delay={300} className="col-span-1 md:col-span-3">
             <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-500 shadow-sm flex flex-col md:flex-row items-center gap-10">
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
           </AnimatedElement>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131314] transition-colors duration-500 mt-auto py-12 px-6 relative z-20">
        <AnimatedElement animation="fade-up" className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           
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

        </AnimatedElement>
      </footer>
    </div>
  )
}