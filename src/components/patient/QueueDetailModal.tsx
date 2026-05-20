import React from 'react';
import { QueueStatus } from '../../lib/types';

interface QueueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: QueueStatus;
}

// 1. SINKRONISASI SKEMA WARNA
const statusMeta: Record<QueueStatus, { title: string; tone: string; message: string }> = {
  [QueueStatus.WAITING]: {
    title: 'Menunggu',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    message: 'Antrean Anda sedang aktif dan berjalan normal.',
  },
  [QueueStatus.CALLED]: {
    title: 'Giliran Anda',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    message: 'Silakan masuk, giliran Anda diperiksa.',
  },
  [QueueStatus.IN_PROGRESS]: {
    title: 'Sedang Diperiksa',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    message: 'Pemeriksaan sedang berlangsung di ruangan dokter.',
  },
  [QueueStatus.DONE]: {
    title: 'Selesai',
    tone: 'bg-slate-50 text-slate-600 border-slate-200',
    message: 'Pemeriksaan telah selesai.',
  },
  [QueueStatus.SKIPPED]: {
    title: 'Dilewati',
    tone: 'bg-slate-50 text-slate-600 border-slate-200',
    message: 'Antrean Anda dilewati dan masuk ke riwayat inaktif.',
  },
  [QueueStatus.CANCELLED]: {
    title: 'Dibatalkan',
    tone: 'bg-slate-50 text-slate-600 border-slate-200',
    message: 'Antrean Anda telah dibatalkan.',
  },
};

export default function QueueDetailsModal({ isOpen, onClose, status }: QueueDetailsModalProps) {
  const meta = statusMeta[status];

  // Penjaga keamanan jika status tidak valid
  if (!meta) return null;

  const isWaiting = status === QueueStatus.WAITING;
  const isCalled = status === QueueStatus.CALLED;
  const isInProgress = status === QueueStatus.IN_PROGRESS;
  const isDone = status === QueueStatus.DONE;
  const isSkipped = status === QueueStatus.SKIPPED;
  const isCancelled = status === QueueStatus.CANCELLED;

  // 2. KELOMPOK STATUS UNTUK LOGIKA TIMELINE
  const isFinal = isDone || isSkipped || isCancelled;
  const isExamining = isCalled || isInProgress;

  return (
    <>
      {/* Overlay Background */}
      <div
        className={`fixed inset-0 bg-white/40 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Kontainer Modal */}
      <div
        className={`fixed top-[55%] left-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden flex flex-col max-h-[80vh] transition-all duration-500 ease-out origin-center ${
          isOpen
            ? 'opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100 visible'
            : 'opacity-0 -translate-x-1/2 -translate-y-[70%] scale-95 invisible pointer-events-none'
        }`}
      >
        {/* Header Modal - Desain Lebih Bersih */}
        <div className="p-6 md:p-8 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tight">Detail Antrean</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Lacak tahapan medis terkini</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 md:px-8 overflow-y-auto no-scrollbar pb-6">
          
          {/* Badge Indikator Status Utama */}
          <div className="mb-8">
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-[11px] font-black border uppercase tracking-widest ${meta.tone}`}>
              {meta.title}
            </span>
            <p className="mt-3 text-sm text-zinc-700 font-medium leading-relaxed">{meta.message}</p>
          </div>

          {/* 3. TIMELINE VISUAL MONOKROMATIK & AKSEN */}
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
            
            {/* Tahap 1: Tiket Diterbitkan (Selalu Abu-abu/Masa Lalu) */}
            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white" />
              <h4 className="text-sm font-extrabold text-zinc-900">Tiket Diterbitkan</h4>
              <p className="text-xs text-slate-500 mt-1">Sistem menerima pendaftaran.</p>
            </div>

            {/* Tahap 2: Menunggu Giliran */}
            <div className="relative pl-8">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${
                  isWaiting
                    ? 'bg-emerald-500 ring-emerald-50 animate-pulse' // Sedang Terjadi (Hijau)
                    : isFinal || isExamining
                      ? 'bg-slate-300 ring-white' // Sudah Lewat (Abu-abu)
                      : 'bg-white border-2 border-slate-300 ring-white' // Belum Terjadi (Kosong)
                }`}
              />
              <h4 className={`text-sm font-extrabold transition-colors ${isWaiting ? 'text-emerald-700' : 'text-zinc-900'}`}>
                Menunggu Giliran
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isWaiting ? 'Antrean sedang berlangsung...' : 'Tahap selesai dilewati.'}
              </p>
            </div>

            {/* Tahap 3: Pemeriksaan Dokter */}
            <div className="relative pl-8">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${
                  isExamining
                    ? 'bg-amber-500 ring-amber-50 animate-pulse' // Sedang Terjadi (Kuning)
                    : isDone
                      ? 'bg-slate-300 ring-white' // Sudah Lewat (Abu-abu)
                      : 'bg-white border-2 border-slate-200 ring-white' // Belum Terjadi (Kosong)
                }`}
              />
              <h4 className={`text-sm font-extrabold transition-colors ${isExamining ? 'text-amber-700' : isDone ? 'text-zinc-900' : 'text-slate-400'}`}>
                Pemeriksaan Dokter
              </h4>
              <p className="text-xs text-slate-500 mt-1">
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
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${
                  isFinal
                    ? 'bg-slate-600 ring-slate-50' // Sedang Terjadi/Final (Abu Gelap)
                    : 'bg-white border-2 border-slate-200 ring-white' // Belum Terjadi (Kosong)
                }`}
              />
              <h4 className={`text-sm font-extrabold transition-colors ${
                isFinal ? 'text-zinc-900' : 'text-slate-400'
              }`}>
                Status Akhir
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isDone ? 'Selesai' : isSkipped ? 'Dilewati' : isCancelled ? 'Dibatalkan' : 'Belum final'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-extrabold rounded-xl hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm outline-none">
            Tutup Detail
          </button>
        </div>
      </div>
    </>
  );
}