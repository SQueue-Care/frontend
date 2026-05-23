import type { Queue } from '../../lib/types'

interface QueueDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  queue: Queue | null
  patientProfile: {
    name: string
    nik: string
    address: string
  } | null
}

const getQueueStatusStyle = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
    case 'CALLED':
    case 'IN_PROGRESS':
      return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
    case 'DONE':
    case 'SKIPPED':
    case 'CANCELLED':
      return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
    default:
      return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
  }
}

const getQueueStatusText = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'Menunggu'
    case 'CALLED':
      return 'Giliran Anda'
    case 'IN_PROGRESS':
      return 'Diperiksa'
    case 'DONE':
      return 'Selesai'
    case 'SKIPPED':
      return 'Dilewati'
    case 'CANCELLED':
      return 'Dibatalkan'
    default:
      return status
  }
}

export default function QueueDetailPanel({
  isOpen,
  onClose,
  queue,
  patientProfile,
}: QueueDetailPanelProps) {
  // ANIMATION FIX: Do not return null to allow the panel to stay in the DOM and transition properly.
  // if (!queue) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-100 bg-white/40 backdrop-blur-sm transition-all duration-300 dark:bg-[#131314]/80 ${
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-110 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-500 ease-in-out sm:max-w-md dark:border-zinc-800 dark:bg-[#1e1f20] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {queue ? (
          <>
            {/* Header Panel */}
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 transition-colors md:p-8 dark:border-zinc-800 dark:bg-[#131314]/50">
              <div>
                <h3 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-zinc-950 transition-colors dark:text-zinc-100">
                  Detail Kunjungan
                </h3>
                <p className="mt-1 font-mono text-xs font-medium tracking-widest text-slate-500 uppercase transition-colors dark:text-zinc-400">
                  ID: {queue.id?.substring(0, 8) || 'XXX'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all outline-none hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 dark:focus:ring-zinc-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Konten Utama */}
            <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-6 md:p-8">
              {/* Box Nomor Antrean & Status */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-colors dark:border-zinc-800 dark:bg-[#131314]">
                <div>
                  <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Nomor Urut
                  </p>
                  <span className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 font-mono text-xl font-black text-zinc-900 shadow-sm transition-colors dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-100">
                    {queue.queueNumber}
                  </span>
                </div>
                <div className="text-right">
                  <p className="mb-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:text-zinc-500">
                    Status Antrean
                  </p>
                  <span
                    className={`inline-flex rounded-lg border px-3.5 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${getQueueStatusStyle(queue.status)}`}
                  >
                    {getQueueStatusText(queue.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50 p-5 transition-colors dark:border-zinc-800 dark:bg-[#131314]">
                {/* Blok Informasi Pasien */}
                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Identitas Pasien
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Nama Lengkap
                      </span>
                      <span className="font-extrabold text-zinc-950 uppercase transition-colors dark:text-zinc-100">
                        {patientProfile?.name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        NIK
                      </span>
                      <span className="font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">
                        {patientProfile?.nik || 'Belum diatur'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Alamat Domisili
                      </span>
                      <span className="text-right leading-relaxed font-bold text-zinc-950 transition-colors dark:text-zinc-100">
                        {patientProfile?.address || 'Belum ada alamat terdaftar.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blok Poliklinik & Dokter */}
                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Unit Layanan Medis
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Layanan
                      </span>
                      <span className="font-extrabold text-teal-700 transition-colors dark:text-teal-400">
                        {queue?.department?.name || 'Poliklinik'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Dokter Praktik
                      </span>
                      <span className="font-extrabold text-zinc-950 uppercase transition-colors dark:text-zinc-100">
                        {queue?.doctor?.user?.name || 'Belum ditentukan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blok Jadwal & Waktu */}
                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Waktu Kunjungan
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Tanggal Kunjungan
                      </span>
                      <span className="font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">
                        {new Date(queue.queueDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Jam Sesi
                      </span>
                      <span className="font-extrabold text-zinc-950 transition-colors dark:text-zinc-100">
                        {new Date(queue.queueDate).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500 transition-colors dark:text-zinc-400">
                        Tgl. Didaftarkan
                      </span>
                      <span className="font-bold text-zinc-600 italic transition-colors dark:text-zinc-400">
                        {queue.createdAt
                          ? new Date(queue.createdAt).toLocaleDateString('id-ID')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blok Dinamis: Keluhan vs Catatan Dokter */}
                <div>
                  <h4 className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors dark:border-zinc-800 dark:text-zinc-500">
                    Catatan Keluhan Awal Pasien
                  </h4>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-zinc-700 transition-colors dark:text-zinc-300">
                      {queue.notes || (
                        <span className="text-slate-400 italic transition-colors dark:text-zinc-600">
                          Tidak ada catatan keluhan tertulis saat pendaftaran.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 2. BLOK CATATAN & PENGINGAT DOKTER (Muncul saat Antrean Selesai/DONE) */}
                {queue.status === 'DONE' && (
                  <div className="animate-in fade-in duration-500">
                    <h4 className="mb-3 border-b border-amber-200 pb-2 text-[10px] font-black tracking-widest text-amber-600 uppercase transition-colors dark:border-amber-900/50 dark:text-amber-500">
                      Catatan Dokter & Pengingat Penyakit
                    </h4>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm transition-colors dark:border-amber-900/50 dark:bg-amber-900/10">
                      <p className="text-sm leading-relaxed font-semibold whitespace-pre-wrap text-zinc-800 transition-colors dark:text-amber-100">
                        {/* Asumsi field dari backend/store menggunakan nama doctorNotes */}
                        {queue.doctorNotes || (
                          <span className="font-normal text-slate-400 italic transition-colors dark:text-zinc-500">
                            Pemeriksaan selesai. Dokter tidak meninggalkan catatan pengingat khusus.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 bg-white p-6 transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-slate-200 bg-white py-4 font-extrabold text-slate-700 shadow-sm transition-all outline-none hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
              >
                Tutup Detail Kunjungan
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </>
  )
}
