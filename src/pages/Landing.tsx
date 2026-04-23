import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-between font-['Inter'] relative">
      <header className="w-full flex justify-center bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-7xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex justify-center items-center shadow-sm">
              <span className="text-white font-bold font-['Manrope'] text-lg">RS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-900 text-lg font-extrabold font-['Manrope'] leading-tight">Ethereal</span>
              <span className="text-teal-600 text-[10px] font-bold uppercase tracking-widest leading-tight">Queue System</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-zinc-600 hover:text-teal-600 text-sm font-semibold transition-colors">Layanan</a>
            <a href="#" className="text-zinc-600 hover:text-teal-600 text-sm font-semibold transition-colors">Jadwal Dokter</a>
            <a href="#" className="text-zinc-600 hover:text-teal-600 text-sm font-semibold transition-colors">Cek Antrean</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="px-6 py-2.5 bg-gradient-to-r from-[#0d9488] to-[#2563eb] hover:opacity-90 transition-opacity rounded-xl text-white text-sm font-bold shadow-md shadow-teal-700/30">
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center pt-16 pb-24 px-6 gap-24">
        <div className="w-full max-w-7xl relative bg-white rounded-3xl p-12 lg:p-16 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 items-center shadow-sm border border-slate-100">
          <div className="w-96 h-96 absolute -right-32 -top-32 opacity-10 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full blur-[64px]"></div>
          <div className="w-96 h-96 absolute -left-32 -bottom-32 opacity-10 bg-gradient-to-l from-blue-600 to-teal-600 rounded-full blur-[64px]"></div>

          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="px-4 py-1.5 bg-teal-50 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-600"></div>
              <span className="text-teal-800 text-xs font-bold uppercase tracking-wider">AI-Driven Health Experience</span>
            </div>
            
            <h1 className="text-zinc-900 text-5xl lg:text-6xl font-extrabold font-['Manrope'] leading-tight text-center">
              Antre Lebih Cerdas,<br />
              <span className="bg-gradient-to-r from-[#0d9488] to-[#2563eb] bg-clip-text text-transparent">Pulih Lebih Cepat</span>
            </h1>
            
            <p className="text-zinc-600 text-lg font-normal leading-relaxed max-w-lg text-center">
              Ucapkan selamat tinggal pada ruang tunggu yang sesak. Sistem cerdas kami memprediksi waktu tunggu secara akurat sehingga Anda bisa beristirahat di rumah.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Link to="/login" className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 transition-colors rounded-xl text-white text-base font-bold shadow-lg shadow-emerald-700/20">
                Daftar Antrean
              </Link>
              <button className="px-8 py-4 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-emerald-800 text-base font-bold">
                Lihat Kapasitas Poli
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end relative z-10">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-slate-100">
              <img className="w-full h-64 object-cover" src="https://placehold.co/448x252/e2e8f0/64748b?text=Visualisasi+Aplikasi" alt="Klinik Ethereal" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl flex justify-between items-center border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex justify-center items-center">
                    <div className="w-4 h-4 bg-emerald-700 rounded-sm"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">SISA WAKTU</span>
                    <span className="text-teal-800 text-xl font-extrabold">12 Menit</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-teal-100 rounded-full">
                  <span className="text-teal-800 text-xs font-bold">Poli Anak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl flex flex-col items-center gap-12">
          <div className="text-center flex flex-col gap-4">
            <h2 className="text-zinc-900 text-3xl font-bold font-['Manrope']">Teknologi yang Peduli</h2>
            <p className="text-zinc-600 text-base font-normal max-w-2xl mx-auto">
              Kami menggunakan algoritma prediktif terbaru untuk memastikan perjalanan medis Anda seefisien mungkin.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-3xl flex flex-col gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex justify-center items-center">
                <div className="w-6 h-6 bg-teal-600 rounded-md"></div>
              </div>
              <h3 className="text-zinc-900 text-xl font-bold font-['Manrope']">Prediksi Akurat</h3>
              <p className="text-zinc-600 text-base font-normal leading-relaxed">
                AI kami menganalisis ribuan data kunjungan untuk memprediksi waktu tunggu hingga presisi 95%.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl flex flex-col gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex justify-center items-center">
                <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
              </div>
              <h3 className="text-zinc-900 text-xl font-bold font-['Manrope']">Transparansi Real-Time</h3>
              <p className="text-zinc-600 text-base font-normal leading-relaxed">
                Pantau nomor antrean Anda dari rumah. Terima notifikasi otomatis saat giliran Anda sudah dekat.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl flex flex-col gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex justify-center items-center">
                <div className="w-6 h-6 bg-amber-600 rounded-md"></div>
              </div>
              <h3 className="text-zinc-900 text-xl font-bold font-['Manrope']">Distribusi Pintar</h3>
              <p className="text-zinc-600 text-base font-normal leading-relaxed">
                Sistem mengarahkan Anda ke departemen yang paling tidak padat untuk mempercepat administrasi.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center bg-slate-900 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="w-full max-w-7xl px-6 flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="flex flex-col gap-6 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex justify-center items-center shadow-sm">
                  <span className="text-white font-bold font-['Manrope'] text-lg">RS</span>
                </div>
                <span className="text-white text-xl font-extrabold font-['Manrope']">Ethereal</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sistem manajemen antrean cerdas terintegrasi untuk memberikan pengalaman klinis terbaik tanpa menunggu lama.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-sm font-bold uppercase tracking-wider">Akses Cepat</h4>
              <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Daftar Antrean</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Jadwal Dokter</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Cek Kapasitas Poli</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-sm font-bold uppercase tracking-wider">Bantuan</h4>
              <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Pusat Bantuan</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 text-sm transition-colors">Kebijakan Privasi</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-sm font-bold uppercase tracking-wider">Kontak</h4>
              <span className="text-slate-400 text-sm">Jl. Kesehatan No. 123<br />Tangerang, Banten</span>
              <span className="text-slate-400 text-sm">halo@rsethereal.com</span>
            </div>
          </div>
          <div className="w-full pt-8 border-t border-slate-800 flex justify-between items-center">
            <span className="text-slate-500 text-xs">© 2026 RS Ethereal. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}