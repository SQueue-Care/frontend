// src/components/LiveQueueTracker.tsx
import { useState, useEffect } from 'react';
import QueueDetailsModal from './QueueDetailModal';
import { useQueueStore } from '../store/queueStore';
import { QueueStatus } from '../lib/types';

// Saran: Terapkan antarmuka props yang ketat agar komponen ini tidak dapat dirender tanpa ID antrean
interface LiveQueueTrackerProps {
  queueId: string;
  onCancelSuccess: () => void;
}

export default function LiveQueueTracker({ queueId, onCancelSuccess }: LiveQueueTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { activeQueueDetail, fetchActiveQueue, cancelQueue } = useQueueStore();

  useEffect(() => {
    // Jika tidak ada ID, jangan lakukan apa-apa
    if (!queueId) return;

    // 1. Tembakan Pertama saat komponen pelacak muncul
    fetchActiveQueue(queueId);

    // 2. Mesin Polling (Detak Jantung API)
    const timer = setInterval(() => {
      // OPTIMASI: Hentikan penarikan data jika antrean sudah selesai atau dibatalkan
      // Menggunakan useQueueStore.getState() agar tidak memicu re-render loop
      const currentStatus = useQueueStore.getState().activeQueueDetail?.status;
      if (currentStatus === 'DONE' || currentStatus === 'CANCELLED' || currentStatus === 'SKIPPED') {
        clearInterval(timer);
        return;
      }
      
      // Jika masih WAITING, IN_PROGRESS, atau CALLED, tembak API
      fetchActiveQueue(queueId);
      
    }, 10000); // KOREKSI MUTLAK: Harus 10000 (10 detik), bukan 1000!

    // 3. Pembersihan Mutlak (Mencegah API terus berjalan saat komponen ditutup)
    return () => clearInterval(timer);
  }, [queueId, fetchActiveQueue]);

  const handleCancel = async () => {
    if (!window.confirm('Tindakan ini tidak dapat dibatalkan. Anda yakin ingin membatalkan antrean?')) return;
    setIsCancelling(true);
    try {
      await cancelQueue(queueId);
      onCancelSuccess();
    } catch (error) {
      alert('Gagal membatalkan antrean. Server mungkin sedang sibuk.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!activeQueueDetail) {
    return <div className="p-8 text-center text-teal-100 font-bold animate-pulse">Menghubungkan ke satelit pelacak...</div>;
  }

  const status = activeQueueDetail.status as QueueStatus;
  const isWaiting = status === QueueStatus.WAITING;
  const isCalled = status === QueueStatus.CALLED;
  const isInProgress = status === QueueStatus.IN_PROGRESS;
  const isFinal = [QueueStatus.DONE, QueueStatus.SKIPPED, QueueStatus.CANCELLED].includes(status);
  const statusLabel = isWaiting
    ? 'Menunggu panggilan sistem...'
    : isCalled
      ? 'Anda sudah dipanggil'
      : isInProgress
        ? 'Silakan masuk ke ruangan dokter'
        : status === QueueStatus.DONE
          ? 'Antrean selesai'
          : status === QueueStatus.SKIPPED
            ? 'Antrean dilewati'
            : 'Antrean dibatalkan';

  const statusBadgeText = isWaiting
    ? 'Live'
    : isCalled
      ? 'Dipanggil'
      : isInProgress
        ? 'Giliran Anda'
        : status === QueueStatus.DONE
          ? 'Selesai'
          : status === QueueStatus.SKIPPED
            ? 'Dilewati'
            : 'Dibatalkan';
  
  return (
    <>
      <div className={`mb-12 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform transition-all duration-500 hover:scale-[1.01] ${isInProgress ? 'bg-gradient-to-r from-emerald-600 to-teal-800 shadow-emerald-900/20' : 'bg-gradient-to-r from-teal-900 to-slate-900 shadow-teal-900/10'}`}>
        
        {/* Efek Cahaya Blur */}
        <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${isInProgress ? 'bg-emerald-400/30' : 'bg-teal-500/20'}`} />
        <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${isInProgress ? 'bg-teal-400/30' : 'bg-blue-500/20'}`} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full md:w-auto">
          
          {/* Nomor Antrean Asli */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[110px] shadow-inner transition-all">
            <span className="block text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-1">Nomor Anda</span>
            <span className="block text-4xl font-extrabold font-['Manrope'] tracking-tight">
              {activeQueueDetail.department?.code || 'XX'}-{activeQueueDetail.queueNumber}
            </span>
          </div>

          {/* Informasi Status Asli */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`flex items-center gap-1.5 border text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${isInProgress ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' : isFinal ? 'bg-slate-500/20 text-slate-200 border-slate-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isInProgress ? 'bg-emerald-400' : isFinal ? 'bg-slate-300' : 'bg-rose-500'}`} />
                {statusBadgeText}
              </span>
              <h4 className="text-xl font-bold font-['Manrope'] text-white">{activeQueueDetail.department?.name || '-'}</h4>
            </div>
            <p className="text-slate-200 text-sm font-medium mb-3">
              {activeQueueDetail.doctor?.user?.name || 'Dokter belum ditentukan'}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-black/20 w-max px-3 py-1.5 rounded-lg border border-white/5">
              <span className={`animate-pulse ${isWaiting ? 'text-amber-300' : isCalled ? 'text-cyan-200' : isInProgress ? 'text-emerald-300' : isFinal ? 'text-slate-300' : 'text-slate-200'}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Mutlak */}
        <div className="flex flex-col md:flex-row gap-3 relative z-10 w-full md:w-auto mt-6 md:mt-0">
          {isWaiting && (
            <button 
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-6 py-4 text-sm font-extrabold rounded-xl border border-rose-400/30 text-rose-200 hover:bg-rose-500/20 transition-all duration-300 disabled:opacity-50"
            >
              {isCancelling ? 'Memproses...' : 'Batalkan Antrean'}
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`px-6 py-4 text-sm font-extrabold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${isInProgress ? 'bg-emerald-50 text-emerald-900 hover:bg-white' : isFinal ? 'bg-slate-100 text-slate-800 hover:bg-slate-50' : 'bg-white text-teal-900 hover:bg-slate-50'}`}
          >
            {isInProgress ? 'Lihat Detail Pemeriksaan' : isFinal ? 'Lihat Riwayat Status' : 'Buka Pelacak'}
          </button>
        </div>
      </div> {/* <-- DIV PENUTUP INI YANG SEBELUMNYA HILANG */}

      <QueueDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        status={status}
      />
    </>
  );
}
