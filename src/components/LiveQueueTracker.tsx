// src/components/LiveQueueTracker.tsx
import { useState, useEffect } from 'react';
import QueueDetailsModal from './QueueDetailModal';
import { useQueueStore } from '../store/queueStore';

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
    if (!queueId) return;

    fetchActiveQueue(queueId);

    // Polling setiap 10 detik
    const timer = setInterval(() => {
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
      alert('Gagal membatalkan antrean. Server mungkin sedang sibuk.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!activeQueueDetail) {
    return <div className="p-8 text-center text-teal-100 font-bold animate-pulse">Menghubungkan ke satelit pelacak...</div>;
  }

  const isWaiting = activeQueueDetail.status === 'WAITING';
  const isInService = activeQueueDetail.status === 'IN_PROGRESS' || activeQueueDetail.status === 'CALLED';
  const mappedModalStatus = isWaiting ? 'waiting' : (isInService ? 'in-service' : 'completed');

  return (
    <>
      <div className={`mb-12 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform transition-all duration-500 hover:scale-[1.01] ${isInService ? 'bg-gradient-to-r from-emerald-600 to-teal-800 shadow-emerald-900/20' : 'bg-gradient-to-r from-teal-900 to-slate-900 shadow-teal-900/10'}`}>
        
        {/* Efek Cahaya Blur */}
        <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${isInService ? 'bg-emerald-400/30' : 'bg-teal-500/20'}`} />
        <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${isInService ? 'bg-teal-400/30' : 'bg-blue-500/20'}`} />

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
              <span className={`flex items-center gap-1.5 border text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${isInService ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isInService ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                {isInService ? 'Giliran Anda' : 'Live'}
              </span>
              <h4 className="text-xl font-bold font-['Manrope'] text-white">{activeQueueDetail.department?.name || '-'}</h4>
            </div>
            <p className="text-slate-200 text-sm font-medium mb-3">
              {activeQueueDetail.doctor?.user?.name || 'Dokter belum ditentukan'}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-black/20 w-max px-3 py-1.5 rounded-lg border border-white/5">
              {isWaiting ? (
                <span className="text-amber-300 animate-pulse">Menunggu panggilan sistem...</span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-300 animate-pulse">
                  Silakan masuk ke ruangan dokter
                </span>
              )}
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
            className={`px-6 py-4 text-sm font-extrabold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${isInService ? 'bg-emerald-50 text-emerald-900 hover:bg-white' : 'bg-white text-teal-900 hover:bg-slate-50'}`}
          >
            {isInService ? 'Lihat Detail Pemeriksaan' : 'Buka Pelacak'}
          </button>
        </div>
      </div> {/* <-- DIV PENUTUP INI YANG SEBELUMNYA HILANG */}

      <QueueDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        status={mappedModalStatus} 
      />
    </>
  );
}