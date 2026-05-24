import { useState } from 'react'

const FAQ = [
  {
    q: 'Bagaimana cara mengambil nomor antrean?',
    a: 'Buka Beranda, pilih kartu poliklinik, lalu ikuti langkah pemesanan. Pastikan NIK sudah terisi di profil.',
  },
  {
    q: 'Apa bedanya reservasi dan antrean langsung?',
    a: 'Reservasi menjadwalkan kunjungan di waktu tertentu. Antrean langsung (walk-in) langsung masuk antrean hari itu setelah konfirmasi.',
  },
  {
    q: 'Kapan harus check-in reservasi?',
    a: 'Check-in pada hari kunjungan melalui detail reservasi di Riwayat Kunjungan, tab Jadwal Reservasi.',
  },
  {
    q: 'Di mana melihat instruksi obat dari dokter?',
    a: 'Buka menu Resep & Obat setelah kunjungan selesai, atau detail riwayat antrean yang berstatus Selesai.',
  },
]

export default function PatientHelp() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <h2 className="mb-4 font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
            Kontak bantuan
          </h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                Call center
              </dt>
              <dd className="font-bold text-zinc-900 dark:text-zinc-100">(021) 1500-XXX</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                WhatsApp informasi
              </dt>
              <dd className="font-bold text-zinc-900 dark:text-zinc-100">0812-0000-0000</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                Email
              </dt>
              <dd className="font-bold text-zinc-900 dark:text-zinc-100">bantuan@rscontoh.go.id</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                Jam layanan informasi
              </dt>
              <dd className="font-bold text-zinc-900 dark:text-zinc-100">Senin–Sabtu, 07.00–20.00 WIB</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-teal-100 bg-teal-50/50 p-6 dark:border-teal-500/20 dark:bg-teal-500/5">
          <h2 className="mb-2 font-['Manrope'] text-lg font-extrabold text-teal-900 dark:text-teal-200">
            Darurat medis
          </h2>
          <p className="text-sm leading-relaxed text-teal-900/90 dark:text-teal-100/90">
            Untuk kondisi gawat darurat, segera menuju IGD atau hubungi 119. Portal pasien tidak
            menggantikan layanan emergensi.
          </p>
        </section>
      </div>

      <section>
        <h2 className="mb-4 font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
          Pertanyaan umum (FAQ)
        </h2>
        <ul className="space-y-3">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#1e1f20]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.q}</span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-zinc-800 dark:text-slate-400">
                    {item.a}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
