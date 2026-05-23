import { QueueStatus } from '../../lib/types'

interface QueueDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  status: QueueStatus
}

// 1. SINKRONISASI SKEMA WARNA
const statusMeta: Record<QueueStatus, { title: string; tone: string; message: string }> = {
  [QueueStatus.WAITING]: {
    title: 'Menunggu',
    tone: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    message: 'Antrean Anda sedang aktif dan berjalan normal.',
  },
  [QueueStatus.CALLED]: {
    title: 'Giliran Anda',
    tone: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    message: 'Silakan masuk, giliran Anda diperiksa.',
  },
  [QueueStatus.IN_PROGRESS]: {
    title: 'Sedang Diperiksa',
    tone: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    message: 'Pemeriksaan sedang berlangsung di ruangan dokter.',
  },
  [QueueStatus.DONE]: {
    title: 'Selesai',
    tone: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    message: 'Pemeriksaan telah selesai.',
  },
  [QueueStatus.SKIPPED]: {
    title: 'Dilewati',
    tone: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    message: 'Antrean Anda dilewati dan masuk ke riwayat inaktif.',
  },
  [QueueStatus.CANCELLED]: {
    title: 'Dibatalkan',
    tone: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    message: 'Antrean Anda telah dibatalkan.',
  },
}

export default function QueueDetailsModal({ isOpen, onClose, status }: QueueDetailsModalProps) {
  const meta = statusMeta[status]

  // Penjaga keamanan jika status tidak valid
  if (!meta) return null

  const isWaiting = status === QueueStatus.WAITING
  const isCalled = status === QueueStatus.CALLED
  const isInProgress = status === QueueStatus.IN_PROGRESS
  const isDone = status === QueueStatus.DONE
  const isSkipped = status === QueueStatus.SKIPPED
  const isCancelled = status === QueueStatus.CANCELLED

  // 2. KELOMPOK STATUS UNTUK LOGIKA TIMELINE
  const isFinal = isDone || isSkipped || isCancelled
  const isExamining = isCalled || isInProgress

  return (
    <>
      {/* Overlay Background */}
      <div
        className={`fixed inset-0 z-100 bg-white/40 backdrop-blur-sm transition-all duration-300 dark:bg-[#131314]/80 ${
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Kontainer Modal */}
      <div
        className={`fixed top-[55%] left-1/2 z-110 flex max-h-[80vh] w-[90%] max-w-md origin-center flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500 ease-out dark:bg-[#1e1f20] ${
          isOpen
            ? 'visible -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100'
            : 'pointer-events-none invisible -translate-x-1/2 translate-y-[-70%] scale-95 opacity-0'
        }`}
      >
        {/* Header Modal - Desain Lebih Bersih */}
        <div className="flex items-center justify-between p-6 pb-4 transition-colors md:p-8">
          <div>
            <h3 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-zinc-950 transition-colors dark:text-zinc-100">
              Detail Antrean
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 transition-colors dark:text-zinc-400">
              Lacak tahapan medis terkini
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-all outline-none hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 dark:focus:ring-zinc-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="no-scrollbar overflow-y-auto px-6 pb-6 md:px-8">
          {/* Badge Indikator Status Utama */}
          <div className="mb-8">
            <span
              className={`inline-flex items-center rounded-lg border px-3.5 py-1.5 text-[11px] font-black tracking-widest uppercase transition-colors ${meta.tone}`}
            >
              {meta.title}
            </span>
            <p className="mt-3 text-sm leading-relaxed font-medium text-zinc-700 transition-colors dark:text-zinc-300">
              {meta.message}
            </p>
          </div>

          {/* 3. TIMELINE VISUAL MONOKROMATIK & AKSEN */}
          <div className="relative ml-3 space-y-8 border-l-2 border-slate-200 pb-4 transition-colors dark:border-zinc-800">
            {/* Tahap 1: Tiket Diterbitkan (Selalu Abu-abu/Masa Lalu) */}
            <div className="relative pl-8">
              <div className="absolute top-1 left-[-9px] h-4 w-4 rounded-full bg-slate-300 ring-4 ring-white transition-colors dark:bg-zinc-600 dark:ring-[#1e1f20]" />
              <h4 className="text-sm font-extrabold text-zinc-900 transition-colors dark:text-zinc-100">
                Tiket Diterbitkan
              </h4>
              <p className="mt-1 text-xs text-slate-500 transition-colors dark:text-zinc-400">
                Sistem menerima pendaftaran.
              </p>
            </div>

            {/* Tahap 2: Menunggu Giliran */}
            <div className="relative pl-8">
              <div
                className={`absolute top-1 left-[-9px] h-4 w-4 rounded-full ring-4 transition-colors duration-500 ${
                  isWaiting
                    ? 'animate-pulse bg-emerald-500 ring-emerald-50 dark:ring-emerald-900/30' // Sedang Terjadi (Hijau)
                    : isFinal || isExamining
                      ? 'bg-slate-300 ring-white dark:bg-zinc-600 dark:ring-[#1e1f20]' // Sudah Lewat (Abu-abu)
                      : 'border-2 border-slate-300 bg-white ring-white dark:border-zinc-700 dark:bg-[#1e1f20] dark:ring-[#1e1f20]' // Belum Terjadi (Kosong)
                }`}
              />
              <h4
                className={`text-sm font-extrabold transition-colors ${isWaiting ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}
              >
                Menunggu Giliran
              </h4>
              <p className="mt-1 text-xs text-slate-500 transition-colors dark:text-zinc-400">
                {isWaiting ? 'Antrean sedang berlangsung...' : 'Tahap selesai dilewati.'}
              </p>
            </div>

            {/* Tahap 3: Pemeriksaan Dokter */}
            <div className="relative pl-8">
              <div
                className={`absolute top-1 left-[-9px] h-4 w-4 rounded-full ring-4 transition-colors duration-500 ${
                  isExamining
                    ? 'animate-pulse bg-amber-500 ring-amber-50 dark:ring-amber-900/30' // Sedang Terjadi (Kuning)
                    : isDone
                      ? 'bg-slate-300 ring-white dark:bg-zinc-600 dark:ring-[#1e1f20]' // Sudah Lewat (Abu-abu)
                      : 'border-2 border-slate-200 bg-white ring-white dark:border-zinc-700 dark:bg-[#1e1f20] dark:ring-[#1e1f20]' // Belum Terjadi (Kosong)
                }`}
              />
              <h4
                className={`text-sm font-extrabold transition-colors ${isExamining ? 'text-amber-700 dark:text-amber-400' : isDone ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'}`}
              >
                Pemeriksaan Dokter
              </h4>
              <p className="mt-1 text-xs text-slate-500 transition-colors dark:text-zinc-400">
                {isExamining
                  ? 'Silakan masuk ke ruangan poli.'
                  : isDone
                    ? 'Pemeriksaan telah diselesaikan.'
                    : 'Belum dimulai.'}
              </p>
            </div>

            {/* Tahap 4: Status Akhir */}
            <div className="relative pl-8">
              <div
                className={`absolute top-1 left-[-9px] h-4 w-4 rounded-full ring-4 transition-colors duration-500 ${
                  isFinal
                    ? 'bg-slate-600 ring-slate-50 dark:bg-zinc-500 dark:ring-zinc-800' // Sedang Terjadi/Final (Abu Gelap)
                    : 'border-2 border-slate-200 bg-white ring-white dark:border-zinc-700 dark:bg-[#1e1f20] dark:ring-[#1e1f20]' // Belum Terjadi (Kosong)
                }`}
              />
              <h4
                className={`text-sm font-extrabold transition-colors ${
                  isFinal ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'
                }`}
              >
                Status Akhir
              </h4>
              <p className="mt-1 text-xs text-slate-500 transition-colors dark:text-zinc-400">
                {isDone
                  ? 'Selesai'
                  : isSkipped
                    ? 'Dilewati'
                    : isCancelled
                      ? 'Dibatalkan'
                      : 'Belum final'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 transition-colors dark:border-zinc-800 dark:bg-[#131314]/50">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 font-extrabold text-slate-700 shadow-sm transition-all outline-none hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </>
  )
}
