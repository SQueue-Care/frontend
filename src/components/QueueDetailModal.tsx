import { QueueStatus } from '../lib/types';

interface QueueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: QueueStatus;
}

const statusMeta: Record<QueueStatus, { title: string; tone: string; message: string }> = {
  [QueueStatus.WAITING]: {
    title: 'Menunggu',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    message: 'Antrian masih menunggu panggilan sistem.',
  },
  [QueueStatus.CALLED]: {
    title: 'Dipanggil',
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    message: 'Nomor Anda sudah dipanggil. Silakan bersiap menuju ruangan.',
  },
  [QueueStatus.IN_PROGRESS]: {
    title: 'Sedang Diperiksa',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    message: 'Pemeriksaan sedang berlangsung.',
  },
  [QueueStatus.DONE]: {
    title: 'Selesai',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    message: 'Pemeriksaan telah selesai.',
  },
  [QueueStatus.SKIPPED]: {
    title: 'Dilewati',
    tone: 'bg-slate-50 text-slate-600 border-slate-200',
    message: 'Antrian Anda dilewati dan bisa diproses ulang sesuai kebijakan poli.',
  },
  [QueueStatus.CANCELLED]: {
    title: 'Dibatalkan',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
    message: 'Antrian sudah dibatalkan.',
  },
};

export default function QueueDetailsModal({ isOpen, onClose, status }: QueueDetailsModalProps) {
  const meta = statusMeta[status];
  const isWaiting = status === QueueStatus.WAITING;
  const isCalled = status === QueueStatus.CALLED;
  const isInProgress = status === QueueStatus.IN_PROGRESS;
  const isDone = status === QueueStatus.DONE;
  const isSkipped = status === QueueStatus.SKIPPED;
  const isCancelled = status === QueueStatus.CANCELLED;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-[55%] left-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden flex flex-col max-h-[80vh] transition-all duration-500 ease-out origin-center ${
          isOpen
            ? 'opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100 visible'
            : 'opacity-0 -translate-x-1/2 -translate-y-[70%] scale-95 invisible pointer-events-none'
        }`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-950 font-['Manrope']">Detail Antrean</h3>
            <p className="text-sm text-teal-600 font-semibold">Status: {meta.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${meta.tone}`}>
              {meta.title}
            </span>
            <p className="mt-3 text-sm text-slate-600">{meta.message}</p>
          </div>

          <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-teal-50" />
              <h4 className="text-sm font-extrabold text-zinc-950">Tiket Antrean Diterbitkan</h4>
              <p className="text-xs text-slate-500 mt-1">Tahap awal</p>
            </div>

            <div className="relative pl-8">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${
                  isWaiting
                    ? 'bg-amber-500 ring-amber-50 animate-pulse'
                    : isCalled || isInProgress || isDone || isSkipped || isCancelled
                      ? 'bg-teal-600 ring-teal-50'
                      : 'bg-slate-200 ring-white'
                }`}
              />
              <h4 className={`text-sm font-extrabold transition-colors ${isWaiting ? 'text-amber-600' : 'text-zinc-950'}`}>
                Menunggu Giliran
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isWaiting ? 'Sedang berlangsung...' : isSkipped ? 'Dilewati' : isCancelled ? 'Dibatalkan' : 'Selesai'}
              </p>
            </div>

            <div className="relative pl-8">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${
                  isCalled
                    ? 'bg-cyan-500 ring-cyan-50 animate-pulse'
                    : isInProgress || isDone
                      ? 'bg-teal-600 ring-teal-50'
                      : isSkipped || isCancelled
                        ? 'bg-slate-300 ring-slate-50'
                        : 'bg-slate-200 ring-white'
                }`}
              />
              <h4 className={`text-sm font-extrabold transition-colors ${isCalled ? 'text-cyan-600' : isInProgress ? 'text-emerald-600' : 'text-slate-400'}`}>
                Pemeriksaan Dokter
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isCalled
                  ? 'Dipanggil dan menunggu masuk.'
                  : isInProgress
                    ? 'Silakan masuk ke ruangan poli.'
                    : isDone
                      ? 'Pemeriksaan selesai.'
                      : isSkipped
                        ? 'Antrian dilewati.'
                        : isCancelled
                          ? 'Antrian dibatalkan.'
                          : 'Belum dimulai'}
              </p>
            </div>

            <div className="relative pl-8">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${
                  isDone
                    ? 'bg-emerald-500 ring-emerald-50'
                    : isSkipped
                      ? 'bg-slate-500 ring-slate-50'
                      : isCancelled
                        ? 'bg-rose-500 ring-rose-50'
                        : 'bg-slate-200 ring-white'
                }`}
              />
              <h4 className={`text-sm font-extrabold transition-colors ${
                isDone ? 'text-emerald-600' : isSkipped ? 'text-slate-600' : isCancelled ? 'text-rose-600' : 'text-slate-400'
              }`}>
                Status Akhir
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isDone ? 'Selesai' : isSkipped ? 'Dilewati' : isCancelled ? 'Dibatalkan' : 'Belum final'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <button onClick={onClose} className="w-full py-3.5 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition-colors">
            Tutup Detail
          </button>
        </div>
      </div>
    </>
  );
}
