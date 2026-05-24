export default function AdminSettings() {
  const appVersion = import.meta.env.VITE_APP_VERSION ?? '1.0.0 (dev)'
  const apiBase = import.meta.env.VITE_API_URL ?? '/api (proxy)'

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">Pengaturan Sistem</h1>
        <p className="text-slate-600 dark:text-zinc-400">
          Ringkasan konfigurasi aplikasi. Pengaturan lanjutan (biaya default, integrasi BPJS) dikelola di server.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-zinc-900 dark:text-zinc-100">Aplikasi Frontend</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-50 pb-2">
              <dt className="text-slate-500 dark:text-zinc-400">Versi</dt>
              <dd className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{appVersion}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-50 pb-2">
              <dt className="text-slate-500 dark:text-zinc-400">API Base URL</dt>
              <dd className="font-mono text-xs font-medium text-zinc-800 dark:text-zinc-200">{apiBase}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-zinc-400">Mode</dt>
              <dd className="font-medium text-zinc-800 dark:text-zinc-200">{import.meta.env.MODE}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-6">
          <h2 className="mb-2 font-bold text-amber-900 dark:text-amber-300">Variabel Server (referensi)</h2>
          <p className="mb-4 text-sm text-amber-800/80 dark:text-amber-400/80">
            Nilai aktual diatur di file <code className="rounded bg-white dark:bg-[#1e1f20] px-1">.env</code> backend. Contoh variabel yang mempengaruhi tagihan:
          </p>
          <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-300">
            <li className="rounded-lg bg-white/80 dark:bg-[#131314]/80 px-3 py-2 font-mono text-xs">CONSULTATION_FEE_DEFAULT</li>
            <li className="rounded-lg bg-white/80 dark:bg-[#131314]/80 px-3 py-2 font-mono text-xs">ADMIN_FEE_DEFAULT</li>
            <li className="rounded-lg bg-white/80 dark:bg-[#131314]/80 px-3 py-2 font-mono text-xs">BPJS_COPAY_DEFAULT</li>
            <li className="rounded-lg bg-white/80 dark:bg-[#131314]/80 px-3 py-2 font-mono text-xs">ML_SERVICE_URL (opsional)</li>
          </ul>
          <p className="mt-4 text-xs text-amber-700 dark:text-amber-400 italic">
            Placeholder — hubungi tim infrastruktur untuk mengubah nilai produksi.
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-6">
        <h2 className="mb-2 font-bold text-zinc-900 dark:text-zinc-100">Fitur Sistem</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-50 dark:bg-teal-500/100" />
            Manajemen antrean multi-poli
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-50 dark:bg-teal-500/100" />
            Alur kunjungan (tunggu → dokter → kasir → apotek)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-50 dark:bg-teal-500/100" />
            Tagihan umum & BPJS
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-50 dark:bg-teal-500/100" />
            Portal pasien & CDSS dokter
          </li>
        </ul>
      </section>
    </div>
  )
}
