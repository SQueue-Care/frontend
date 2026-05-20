// src/components/patient/LiveQueueTracker.tsx
import React, { useState, useEffect } from 'react';
import QueueDetailsModal from './QueueDetailModal';
import { useQueueStore } from '../../store/queueStore';
import { QueueStatus } from '../../lib/types';

interface LiveQueueTrackerProps {
  queueId: string;
  onCancelSuccess: () => void;
}

export default function LiveQueueTracker({ queueId, onCancelSuccess }: LiveQueueTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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

  const handleCancel = async () => {
    if (!window.confirm('Tindakan ini tidak dapat dibatalkan. Anda yakin ingin membatalkan antrean?')) return;
    setIsCancelling(true);
    try {
      await cancelQueue(queueId);
      onCancelSuccess();
    } catch (error) {
      console.error(error);
      alert('Gagal membatalkan antrean. Server mungkin sedang sibuk.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!activeQueueDetail) {
    return (
      <div className="mb-12 p-8 text-center text-teal-700 font-bold animate-pulse bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in duration-500 ease-out">
        Menghubungkan ke sistem...
      </div>
    );
  }

  // 1. REVISI LOGIKA STATUS: CALLED dan IN_PROGRESS digabung menjadi satu indikator visual
  const status = activeQueueDetail.status as QueueStatus;
  const isWaiting = status === QueueStatus.WAITING;
  const isInProgress = status === QueueStatus.CALLED || status === QueueStatus.IN_PROGRESS;
  const isFinal = [QueueStatus.DONE, QueueStatus.SKIPPED, QueueStatus.CANCELLED].includes(status);
  
  // 2. REVISI TEKS LABEL: Menggabungkan instruksi pemanggilan dan pemeriksaan
  const statusLabel = isWaiting
    ? 'Menunggu panggilan sistem...'
    : isInProgress
      ? 'Silakan masuk, giliran Anda diperiksa'
      : status === QueueStatus.DONE
        ? 'Antrean selesai'
        : status === QueueStatus.SKIPPED
          ? 'Antrean dilewati'
          : 'Antrean dibatalkan';

  const statusBadgeText = isWaiting
    ? 'Live'
    : isInProgress
      ? 'Giliran Anda'
      : status === QueueStatus.DONE
        ? 'Selesai'
        : status === QueueStatus.SKIPPED
          ? 'Dilewati'
          : 'Dibatalkan';
  
  return (
    <>
      <div className="mb-12 rounded-3xl p-6 md:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform transition-all duration-500 ease-in-out hover:shadow-md hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">        
        
        <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1500 ease-in-out ${
          isWaiting ? 'bg-emerald-300/40' : isInProgress ? 'bg-amber-300/40' : 'bg-slate-200/50'
        }`} />
        
        <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1500 ease-in-out ${
          isWaiting ? 'bg-teal-300/30' : isInProgress ? 'bg-yellow-300/30' : 'bg-slate-200/50'
        }`} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full md:w-auto">
          
          <div className="flex items-stretch gap-3">
            {/* Nomor Antrean Pasien Asli (Hanya menampilkan angka saja) */}
            <div className={`backdrop-blur-md border rounded-2xl p-4 text-center min-w-[110px] shadow-sm transition-all duration-700 ease-in-out ${
              isWaiting ? 'bg-emerald-50/80 border-emerald-200' : isInProgress ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50/80 border-slate-200'
            }`}>
              
              <span className={`block text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors duration-700 ${
                isWaiting ? 'text-emerald-600' : isInProgress ? 'text-amber-600' : 'text-slate-500'
              }`}>Nomor Anda</span>
              
              <span className={`block text-4xl font-extrabold font-['Manrope'] tracking-tight transition-colors duration-700 ${
                isWaiting ? 'text-emerald-700' : isInProgress ? 'text-amber-700' : 'text-zinc-900'
              }`}>
                {activeQueueDetail.queueNumber}
              </span>
            </div>

            {/* Nomor Antrean Berjalan Saat Ini (Hanya menampilkan angka saja) */}
            {isWaiting && (
              <div className="bg-slate-50/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 text-center min-w-[110px] shadow-sm transition-all flex flex-col justify-center">
                <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Saat Ini</span>
                <span className="block text-3xl font-extrabold font-['Manrope'] text-zinc-900 tracking-tight">
                  {activeQueueDetail.currentServingNumber || '-'}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              {/* 3. REVISI GAYA BADGE: Penghapusan rujukan warna biru secara menyeluruh */}
              <span className={`flex items-center gap-1.5 border text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors duration-700 ease-in-out ${
                isWaiting ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                isInProgress ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  isWaiting ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
                {statusBadgeText}
              </span>
              <h4 className="text-xl font-bold font-['Manrope'] text-zinc-900">{activeQueueDetail.department?.name || '-'}</h4>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-3">
              {activeQueueDetail.doctor?.user?.name || 'Dokter belum ditentukan'}
            </p>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold bg-slate-50 w-max px-3 py-1.5 rounded-lg border border-slate-200">
                <span className={`transition-colors duration-700 ease-in-out ${
                  isWaiting ? 'text-emerald-600' : isInProgress ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  {statusLabel}
                </span>
              </div>

              {isWaiting && typeof activeQueueDetail.estimatedWaitMinutes === 'number' && (
                <div className="flex items-center gap-2.5 text-xs font-semibold bg-teal-50 w-max px-3 py-2 rounded-lg border border-teal-100 shadow-sm">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Estimasi Tunggu:</span>
                    <span className="text-teal-700 font-black text-sm">{activeQueueDetail.estimatedWaitMinutes} Menit</span>
                    
                    {activeQueueDetail.prediction?.source === 'ml' && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white text-teal-600 text-[9px] uppercase tracking-widest border border-teal-200 shadow-sm" title="Dihitung oleh Artificial Intelligence">
                        AI Predicted
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 relative z-10 w-full md:w-auto mt-6 md:mt-0">
          {isWaiting && (
            <button 
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-6 py-4 text-sm font-extrabold rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-all duration-300 disabled:opacity-50 shadow-sm"
            >
              {isCancelling ? 'Memproses...' : 'Batalkan Antrean'}
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`px-6 py-4 text-sm font-extrabold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${
              isInProgress ? 'bg-amber-500 text-white hover:bg-amber-600' : 
              isFinal ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 
              'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isInProgress ? 'Detail Pemeriksaan' : isFinal ? 'Riwayat Status' : 'Buka Pelacak'}
          </button>
        </div>
      </div>

      <QueueDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        status={status}
      />
    </>
  );
}