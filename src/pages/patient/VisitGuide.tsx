const STEPS = [
  {
    title: 'Lengkapi profil medis',
    body: 'Pastikan NIK dan data kontak Anda sudah benar di menu Profil Medis sebelum membuat antrean atau reservasi.',
  },
  {
    title: 'Pilih poliklinik',
    body: 'Dari Beranda atau menu Poliklinik, pilih layanan yang dibutuhkan. Perhatikan indikator keramaian antrean.',
  },
  {
    title: 'Ambil nomor antrean atau reservasi',
    body: 'Anda dapat mengambil antrean langsung (walk-in) atau membuat reservasi jadwal jika tersedia di poli tersebut.',
  },
  {
    title: 'Check-in reservasi',
    body: 'Pada hari kunjungan, buka detail reservasi dan lakukan check-in agar nomor antrean aktif di sistem.',
  },
  {
    title: 'Pantau giliran di Beranda',
    body: 'Kartu antrean aktif menampilkan nomor giliran, estimasi tunggu, dan status pemanggilan secara real-time.',
  },
  {
    title: 'Selesai & catatan dokter',
    body: 'Setelah pemeriksaan selesai, lihat diagnosis dan instruksi obat di menu Resep & Obat atau detail kunjungan.',
  },
]

export default function PatientVisitGuide() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
        Panduan singkat alur kunjungan pasien di sistem antrean rumah sakit/klinik ini.
      </p>

      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600 font-black text-white shadow-lg shadow-teal-500/20">
              {index + 1}
            </span>
            <div>
              <h2 className="mb-1.5 font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
                {step.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900/50 dark:bg-amber-900/10">
        <h3 className="mb-2 font-['Manrope'] text-base font-extrabold text-amber-900 dark:text-amber-200">
          Tips penting
        </h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-amber-900/90 dark:text-amber-100/90">
          <li>Datang 15 menit sebelum jadwal reservasi untuk proses administrasi.</li>
          <li>Bawa kartu identitas dan kartu BPJS (jika berlaku).</li>
          <li>Refresh halaman Beranda jika status antrean tidak berubah setelah dipanggil.</li>
        </ul>
      </div>
    </div>
  )
}
