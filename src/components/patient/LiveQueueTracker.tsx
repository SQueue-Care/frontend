// src/components/patient/LiveQueueTracker.tsx
import React, { useState, useEffect } from 'react';
import QueueDetailsModal from './QueueDetailModal';
import { useQueueStore } from '../../store/queueStore';
import { QueueStatus } from '../../lib/types';
import ConfirmModal from '../ui/ConfirmModal';

interface LiveQueueTrackerProps {
  queueId: string | null;
  onCancelSuccess: () => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'WAITING': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    case 'CALLED':
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'DONE':
    case 'SKIPPED':
    case 'CANCELLED': return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700';
    default: return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'WAITING': return 'Menunggu Antrean';
    case 'CALLED': return 'Giliran Anda Dipanggil';
    case 'IN_PROGRESS': return 'Sedang Diperiksa';
    default: return status;
  }
};

export default function LiveQueueTracker({ queueId, onCancelSuccess }: LiveQueueTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const { activeQueueDetail, fetchActiveQueue, cancelQueue } = useQueueStore();

  useEffect(() => {
    if (!queueId) return;

    fetchActiveQueue(queueId);

    const timer = setInterval(() => {
      const currentStatus = useQueueStore.getState().activeQueueDetail?.status;
      if (currentStatus === 'DONE' || currentStatus === 'CANCELLED' || currentStatus === 'SKIPPED') {
        clearInterval(timer);
        return;
      }
      fetchActiveQueue(queueId);
    }, 10000); 

    return () => clearInterval(timer);
  }, [queueId, fetchActiveQueue]);

  const triggerCancel = () => {
    setIsConfirmCancelOpen(true);
  };

  const executeCancel = async () => {
    setIsCancelling(true);
    try {
      if (queueId) {
        await cancelQueue(queueId);
        onCancelSuccess();
      }
    } catch (error) {
      alert('Gagal membatalkan antrean. Server mungkin sedang sibuk.');
    } finally {
      setIsCancelling(false);
      setIsConfirmCancelOpen(false); 
    }
  };

  if (!queueId || !activeQueueDetail) {
    return (
      <div className="bg-teal-50 dark:bg-[#1e1f20] border border-teal-200 dark:border-zinc-800 shadow-inner rounded-3xl p-6 mb-8 flex flex-col items-center justify-center min-h-[160px] text-center w-full relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-100/50 dark:bg-teal-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/50 dark:bg-teal-900/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 bg-white dark:bg-[#131314] text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-3 shadow-sm border border-teal-100 dark:border-zinc-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-teal-950 dark:text-zinc-100 tracking-tight mb-1.5 font-['Manrope'] transition-colors">Belum Ada Antrean Aktif</h3>
          <p className="text-xs font-semibold text-teal-800/80 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed transition-colors">
            Silakan pilih layanan poliklinik di bawah untuk mengambil nomor antrean Anda hari ini.
          </p>
        </div>
      </div>
    );
  }

  const isWaiting = activeQueueDetail.status === 'WAITING';
  const isInProgress = activeQueueDetail.status === 'IN_PROGRESS' || activeQueueDetail.status === 'CALLED';
  const status = activeQueueDetail.status as QueueStatus;

  const themeParams = {
    bg: isInProgress ? 'bg-amber-50 dark:bg-[#1e1f20] border-amber-200 dark:border-amber-900/50' : 'bg-teal-50 dark:bg-[#1e1f20] border-teal-200 dark:border-zinc-800',
    blob: isInProgress ? 'bg-amber-200/40 dark:bg-amber-900/10' : 'bg-teal-100/50 dark:bg-teal-900/10',
    date: isInProgress ? 'text-amber-700/70 dark:text-amber-500/70' : 'text-teal-700/70 dark:text-teal-500/70',
    title: isInProgress ? 'text-amber-950 dark:text-zinc-100' : 'text-teal-950 dark:text-zinc-100',
    doctor: isInProgress ? 'text-amber-800 dark:text-zinc-400' : 'text-teal-800 dark:text-zinc-400',
    labelCurrent: isInProgress ? 'text-amber-600/70 dark:text-amber-500/70' : 'text-teal-600/70 dark:text-teal-500/70',
    numCurrent: isInProgress ? 'text-amber-900/40 dark:text-amber-700/50' : 'text-teal-900/40 dark:text-teal-700/50',
    divider: isInProgress ? 'bg-amber-200/50 dark:bg-zinc-800' : 'bg-teal-200/50 dark:bg-zinc-800',
    labelYours: isInProgress ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400',
    numYours: isInProgress ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400',
    borderTop: isInProgress ? 'border-amber-200/50 dark:border-zinc-800' : 'border-teal-200/50 dark:border-zinc-800'
  };

  return (
    <>
      <div className={`${themeParams.bg} shadow-inner rounded-3xl p-5 md:p-6 mb-8 flex flex-col justify-between min-h-[180px] w-full relative overflow-hidden transition-colors duration-700`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-700 ${themeParams.blob}`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 w-full h-full flex-1">
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors duration-500 ${getStatusStyle(activeQueueDetail.status)}`}>
                {getStatusText(activeQueueDetail.status)}
              </span>
              <span className={`text-[10px] font-black tracking-widest uppercase transition-colors duration-500 ${themeParams.date}`}>
                {new Date(activeQueueDetail.queueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h2 className={`text-2xl md:text-3xl font-extrabold font-['Manrope'] mb-1.5 tracking-tight transition-colors duration-500 ${themeParams.title}`}>
              {activeQueueDetail?.department?.name || 'Poliklinik'}
            </h2>
            <p className={`text-xs font-bold uppercase tracking-wide transition-colors duration-500 ${themeParams.doctor}`}>
              {activeQueueDetail?.doctor?.user?.name || 'Dokter belum ditentukan'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-500 ${themeParams.labelCurrent}`}>Antrean Ke-</p>
              <div className={`text-4xl md:text-5xl font-black font-mono tracking-tighter transition-colors duration-500 ${themeParams.numCurrent}`}>
                {activeQueueDetail.currentServingNumber || '-'}
              </div>
            </div>
            <div className={`w-px h-14 transition-colors duration-500 ${themeParams.divider}`}></div>
            <div className="text-center">
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-500 ${themeParams.labelYours}`}>Nomor Anda</p>
              <div className={`text-4xl md:text-5xl font-black font-mono tracking-tighter transition-colors duration-500 ${themeParams.numYours}`}>
                {activeQueueDetail.queueNumber}
              </div>
            </div>
          </div>
        </div>

        <div className={`relative z-10 flex flex-row justify-end items-center gap-2.5 mt-5 pt-4 border-t transition-colors duration-700 ${themeParams.borderTop}`}>
          {isWaiting && (
            <button 
              onClick={triggerCancel}
              disabled={isCancelling}
              className="flex-1 md:flex-none px-3 md:px-5 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-all duration-300 disabled:opacity-50 shadow-sm outline-none whitespace-nowrap text-center"
            >
              {isCancelling ? 'Memproses...' : 'Batalkan Antrean'}
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`flex-1 md:flex-none px-3 md:px-6 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all duration-300 outline-none whitespace-nowrap text-center ${
              isInProgress ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20 dark:bg-amber-600 dark:hover:bg-amber-500' : 
              'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20 dark:bg-teal-700 dark:hover:bg-teal-600'
            }`}
          >
            {isInProgress ? 'Instruksi Pemanggilan' : 'Detail Kunjungan'}
          </button>
        </div>
      </div>

      <QueueDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={status}
      />
      
      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        title="Batalkan Antrean?"
        message="Tindakan ini mutlak dan tidak dapat dibatalkan. Nomor antrean Anda akan ditarik oleh sistem dan diberikan ke pasien lain."
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        type="danger"
        isLoading={isCancelling}
        onConfirm={executeCancel}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />
    </>
  );
}