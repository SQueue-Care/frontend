// src/pages/PatientPortal.tsx
import { useState } from 'react';
import PolyclinicCard from '../components/PolyclinicCard';
import BookingPanel from '../components/BookingPanel';

/**
 * SARAN ARSITEKTUR:
 * Ke depannya, keenam kartu poliklinik ini harus dipisahkan menjadi komponen tersendiri 
 * (misal: <PolyclinicCard />) lalu di-render menggunakan metode .map() dari sebuah array data.
 * Saat ini kita menggunakan struktur statis penuh sesuai dengan file HTML referensi Anda.
 */

export default function PatientPortal() {
  // Manajemen State untuk Sidebar dan Panel Booking
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedPoli, setSelectedPoli] = useState("Poli Umum");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Handler 
  const openBooking = (poliName: string) => {
    setSelectedPoli(poliName);
    setBookingStep(1); // Selalu mulai dari step 1 saat dibuka
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setTimeout(() => setBookingStep(1), 500); // Reset step setelah animasi tutup selesai
  };

  const handleNextStep = () => setBookingStep((prev) => prev + 1);
  const handlePrevStep = () => setBookingStep((prev) => prev - 1);

  const polyclinics = [
    { name: 'Poli Umum', description: 'Pelayanan kesehatan dasar, pemeriksaan fisik, dan konsultasi keluhan medis umum.', status: 'Sangat Ramai', percentage: '90%', color: 'rose' },
    { name: 'Poli Gigi', description: 'Perawatan kesehatan gigi, pencabutan, pembersihan karang, dan ortodonti.', status: 'Normal / Sedang', percentage: '50%', color: 'amber' },
    { name: 'Poli Anak', description: 'Konsultasi tumbuh kembang anak, imunisasi, dan penanganan penyakit pada anak.', status: 'Sepi / Lengang', percentage: '25%', color: 'emerald' },
    { name: 'Poli Mata', description: 'Pemeriksaan visus, katarak, glaukoma, dan konsultasi kesehatan penglihatan menyeluruh.', status: 'Normal / Sedang', percentage: '40%', color: 'amber' },
    { name: 'Poli Jantung', description: 'Layanan rekam jantung (EKG), ekokardiografi, dan konsultasi kardiovaskular spesialis.', status: 'Sangat Ramai', percentage: '85%', color: 'rose' },
    { name: 'Poli THT', description: 'Pemeriksaan telinga, hidung, dan tenggorokan, serta penanganan gangguan pendengaran.', status: 'Sepi / Lengang', percentage: '15%', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] relative overflow-hidden">
      
      {/* ========================================== */}
      {/* 1. SIDEBAR & OVERLAY */}
      {/* ========================================== */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
        onClick={toggleSidebar}
      />

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="10" x2="18" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
              <circle cx="17" cy="16" r="2.5" />
              <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
            </svg>
            <span className="text-teal-700 text-lg font-extrabold font-['Manrope'] tracking-wide">RS Ethereal</span>
          </div>
          <button onClick={toggleSidebar} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <button onClick={toggleSidebar} className="w-full text-left flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-semibold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Pilih Poliklinik
          </button>
          <button onClick={toggleSidebar} className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-zinc-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Riwayat Antrean
          </button>
          <button onClick={toggleSidebar} className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-zinc-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profil Pasien
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full text-left flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Akun
          </button>
        </div>
      </aside>

      <div className="fixed w-96 h-96 -top-48 -left-48 bg-teal-100 rounded-full blur-[120px] opacity-60" />
      <div className="fixed w-96 h-96 -bottom-48 -right-48 bg-blue-100 rounded-full blur-[120px] opacity-60" />

      {/* ========================================== */}
      {/* 2. NAVBAR ATAS */}
      {/* ========================================== */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h4" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="10" x2="18" y2="10" />
                  <line x1="8" y1="14" x2="12" y2="14" />
                  <circle cx="17" cy="16" r="2.5" />
                  <path d="M21.5 22c-1-2-2.5-3-4.5-3s-3.5 1-4.5 3" />
                </svg>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-teal-700 text-lg font-extrabold font-['Manrope'] tracking-wide">RS</span>
                  <span className="text-slate-900 text-lg font-extrabold font-['Manrope'] tracking-wide">Ethereal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-zinc-900 leading-none mb-1">Bambang</span>
                <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">Pasien</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                <img src="https://placehold.co/100x100/e2e8f0/64748b?text=B" alt="Profil" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================== */}
      {/* 3. KONTEN UTAMA */}
      {/* ========================================== */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 mb-12">
          <div className="flex flex-col gap-2.5 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tighter">Pilih Layanan Poliklinik</h1>
            <p className="text-slate-600 text-base leading-relaxed">Cek status keramaian poli secara <span className="font-semibold text-teal-700">real-time</span> (diprediksi oleh AI) sebelum mengambil nomor antrean.</p>
          </div>

          <div className="w-full lg:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
              {/* SARAN: Perbaiki margin left (pl-4.5 bukan standar Tailwind, gunakan pl-4 atau pl-5) */}
              <svg className="w-5 h-5 text-slate-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" placeholder="Cari poli..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm placeholder:text-slate-400" />
          </div>
        </div>
        
        <div className="mb-12 bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform transition-all hover:scale-[1.01]">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[110px] shadow-inner">
              <span className="block text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-1">Nomor Anda</span>
              <span className="block text-4xl font-extrabold font-['Manrope'] tracking-tight">A-14</span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Live
                </span>
                <h4 className="text-xl font-bold font-['Manrope'] text-white">Poli Umum</h4>
              </div>
              <p className="text-slate-300 text-sm font-medium mb-3">dr. Sarah Jenkins, Sp.U</p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-teal-100 bg-black/20 w-max px-3 py-1.5 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
                  Estimasi AI: 10:45 WIB
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300">Sisa antrean: 3 </span>
              </div>
            </div>
          </div>

          <button className="relative z-10 w-full md:w-auto px-6 py-4 bg-white text-teal-900 text-sm font-extrabold rounded-xl hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            Buka Pelacak Antrean
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {polyclinics.map((poli) => (
            <PolyclinicCard
              key={poli.name}
              name={poli.name}
              description={poli.description}
              status={poli.status}
              percentage={poli.percentage}
              colorClass={poli.color}
              onClick={() => openBooking(poli.name)}
            />
          ))}
        </div>
      </main>

      {/* 4. BOOKING PANEL (REFACRORED) */}
      <BookingPanel 
        isOpen={isBookingOpen}
        onClose={closeBooking}
        step={bookingStep}
        selectedPoli={selectedPoli}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
      />
    </div>
  );
}