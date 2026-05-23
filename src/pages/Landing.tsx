import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-slate-50 font-['Inter']">
      <header className="sticky top-0 z-50 flex w-full justify-center border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
              <span className="font-['Manrope'] text-lg font-bold text-white">RS</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Manrope'] text-lg leading-tight font-extrabold text-zinc-900">
                Ethereal
              </span>
              <span className="text-[10px] leading-tight font-bold tracking-widest text-teal-600 uppercase">
                Queue System
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#"
              className="text-sm font-semibold text-zinc-600 transition-colors hover:text-teal-600"
            >
              Layanan
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-zinc-600 transition-colors hover:text-teal-600"
            >
              Jadwal Dokter
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-zinc-600 transition-colors hover:text-teal-600"
            >
              Cek Antrean
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="rounded-xl bg-linear-to-r from-[#0d9488] to-[#2563eb] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-700/30 transition-opacity hover:opacity-90"
            >
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex w-full flex-col items-center gap-24 px-6 pt-16 pb-24">
        <div className="relative grid w-full max-w-7xl grid-cols-1 items-center gap-12 overflow-hidden rounded-3xl border border-slate-100 bg-white p-12 shadow-sm lg:grid-cols-2 lg:p-16">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-linear-to-br from-teal-600 to-blue-600 opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-linear-to-l from-blue-600 to-teal-600 opacity-10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-teal-600"></div>
              <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
                AI-Driven Health Experience
              </span>
            </div>

            <h1 className="text-center font-['Manrope'] text-5xl leading-tight font-extrabold text-zinc-900 lg:text-6xl">
              Antre Lebih Cerdas,
              <br />
              <span className="bg-linear-to-r from-[#0d9488] to-[#2563eb] bg-clip-text text-transparent">
                Pulih Lebih Cepat
              </span>
            </h1>

            <p className="max-w-lg text-center text-lg leading-relaxed font-normal text-zinc-600">
              Ucapkan selamat tinggal pada ruang tunggu yang sesak. Sistem cerdas kami memprediksi
              waktu tunggu secara akurat sehingga Anda bisa beristirahat di rumah.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/20 transition-colors hover:bg-emerald-800"
              >
                Daftar Antrean
              </Link>
              <button className="rounded-xl bg-slate-100 px-8 py-4 text-base font-bold text-emerald-800 transition-colors hover:bg-slate-200">
                Lihat Kapasitas Poli
              </button>
            </div>
          </div>

          <div className="relative z-10 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
              <img
                className="h-64 w-full object-cover"
                src="https://placehold.co/448x252/e2e8f0/64748b?text=Visualisasi+Aplikasi"
                alt="Klinik Ethereal"
              />
              <div className="absolute right-6 bottom-6 left-6 flex items-center justify-between rounded-2xl border border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <div className="h-4 w-4 rounded-sm bg-emerald-700"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      SISA WAKTU
                    </span>
                    <span className="text-xl font-extrabold text-teal-800">12 Menit</span>
                  </div>
                </div>
                <div className="rounded-full bg-teal-100 px-3 py-1">
                  <span className="text-xs font-bold text-teal-800">Poli Anak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-7xl flex-col items-center gap-12">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="font-['Manrope'] text-3xl font-bold text-zinc-900">
              Teknologi yang Peduli
            </h2>
            <p className="mx-auto max-w-2xl text-base font-normal text-zinc-600">
              Kami menggunakan algoritma prediktif terbaru untuk memastikan perjalanan medis Anda
              seefisien mungkin.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                <div className="h-6 w-6 rounded-md bg-teal-600"></div>
              </div>
              <h3 className="font-['Manrope'] text-xl font-bold text-zinc-900">Prediksi Akurat</h3>
              <p className="text-base leading-relaxed font-normal text-zinc-600">
                AI kami menganalisis ribuan data kunjungan untuk memprediksi waktu tunggu hingga
                presisi 95%.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <div className="h-6 w-6 rounded-md bg-blue-600"></div>
              </div>
              <h3 className="font-['Manrope'] text-xl font-bold text-zinc-900">
                Transparansi Real-Time
              </h3>
              <p className="text-base leading-relaxed font-normal text-zinc-600">
                Pantau nomor antrean Anda dari rumah. Terima notifikasi otomatis saat giliran Anda
                sudah dekat.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <div className="h-6 w-6 rounded-md bg-amber-600"></div>
              </div>
              <h3 className="font-['Manrope'] text-xl font-bold text-zinc-900">
                Distribusi Pintar
              </h3>
              <p className="text-base leading-relaxed font-normal text-zinc-600">
                Sistem mengarahkan Anda ke departemen yang paling tidak padat untuk mempercepat
                administrasi.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto flex w-full justify-center border-t border-slate-800 bg-slate-900 pt-16 pb-8">
        <div className="flex w-full max-w-7xl flex-col gap-12 px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="flex flex-col gap-6 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-sm">
                  <span className="font-['Manrope'] text-lg font-bold text-white">RS</span>
                </div>
                <span className="font-['Manrope'] text-xl font-extrabold text-white">Ethereal</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Sistem manajemen antrean cerdas terintegrasi untuk memberikan pengalaman klinis
                terbaik tanpa menunggu lama.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold tracking-wider text-white uppercase">Akses Cepat</h4>
              <a href="#" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                Daftar Antrean
              </a>
              <a href="#" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                Jadwal Dokter
              </a>
              <a href="#" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                Cek Kapasitas Poli
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold tracking-wider text-white uppercase">Bantuan</h4>
              <a href="#" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                Pusat Bantuan
              </a>
              <a href="#" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                Kebijakan Privasi
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold tracking-wider text-white uppercase">Kontak</h4>
              <span className="text-sm text-slate-400">
                Jl. Kesehatan No. 123
                <br />
                Tangerang, Banten
              </span>
              <span className="text-sm text-slate-400">halo@rsethereal.com</span>
            </div>
          </div>
          <div className="flex w-full items-center justify-between border-t border-slate-800 pt-8">
            <span className="text-xs text-slate-500">© 2026 RS Ethereal. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
