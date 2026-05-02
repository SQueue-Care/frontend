// src/components/LiveQueueTracker.tsx
import { useState, useEffect } from 'react';
import QueueDetailsModal from './QueueDetailModal';

export default function LiveQueueTracker() {
  // 1. STATE UNTUK REAL-TIME DATA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(15); // Mulai dari 15 menit
  const [peopleAhead, setPeopleAhead] = useState(3);
  const [queueStatus, setQueueStatus] = useState<'waiting' | 'in-service' | 'completed'>('waiting');

  // 2. MESIN WAKTU (Simulasi Real-time Auto-Refresh)
  useEffect(() => {
    // Jika status sudah bukan waiting, hentikan mesin waktu
    if (queueStatus !== 'waiting') return;

    const timer = setInterval(() => {
      setEstimatedWaitTime((prevTime) => {
        const newTime = prevTime - 1;
        
        // Logika update status antrean berdasarkan sisa waktu
        if (newTime <= 0) {
          setQueueStatus('in-service');
          setPeopleAhead(0);
          return 0; // Berhenti di 0
        }
        
        // Simulasi orang di depan berkurang seiring waktu
        if (newTime === 10) setPeopleAhead(2);
        if (newTime === 5) setPeopleAhead(1);
        
        return newTime;
      });
    }, 3000); // Trigger setiap 3000ms (3 detik) untuk keperluan testing

    // Cleanup function wajib ada agar tidak terjadi memory leak saat pindah halaman
    return () => clearInterval(timer);
  }, [queueStatus]);

  // 3. KONDISI TAMPILAN BERDASARKAN STATUS
  const isWaiting = queueStatus === 'waiting';
  const isInService = queueStatus === 'in-service';

  return (
    <>
    <div className={`mb-12 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform transition-all duration-500 hover:scale-[1.01] ${isInService ? 'bg-gradient-to-r from-emerald-600 to-teal-800 shadow-emerald-900/20' : 'bg-gradient-to-r from-teal-900 to-slate-900 shadow-teal-900/10'}`}>
      
      {/* Efek Cahaya Blur */}
      <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${isInService ? 'bg-emerald-400/30' : 'bg-teal-500/20'}`} />
      <div className={`absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 ${isInService ? 'bg-teal-400/30' : 'bg-blue-500/20'}`} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full md:w-auto">
        
        {/* Nomor Antrean */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[110px] shadow-inner transition-all">
          <span className="block text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-1">Nomor Anda</span>
          <span className="block text-4xl font-extrabold font-['Manrope'] tracking-tight">A-14</span>
        </div>

        {/* Informasi Status Dinamis */}
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className={`flex items-center gap-1.5 border text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${isInService ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isInService ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              {isInService ? 'Giliran Anda' : 'Live'}
            </span>
            <h4 className="text-xl font-bold font-['Manrope'] text-white">Poli Umum</h4>
          </div>
          <p className="text-slate-200 text-sm font-medium mb-3">dr. Sarah Jenkins, Sp.U</p>
          
          {/* Tampilan Countdown / Status Berubah Sesuai State */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-black/20 w-max px-3 py-1.5 rounded-lg border border-white/5">
            {isWaiting ? (
              <>
                <span className="flex items-center gap-1.5 text-teal-100">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
                  Estimasi Waktu: <span className="font-mono text-sm">{estimatedWaitTime} mnt</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className={peopleAhead <= 1 ? 'text-rose-300 animate-pulse' : 'text-amber-300'}>
                  Sisa antrean: {peopleAhead}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-300 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Silakan masuk ke ruangan dokter
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className={`relative z-10 w-full md:w-auto px-6 py-4 text-sm font-extrabold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${isInService ? 'bg-emerald-50 text-emerald-900 hover:bg-white' : 'bg-white text-teal-900 hover:bg-slate-50'}`}
        >
          {isInService ? 'Lihat Detail Pemeriksaan' : 'Buka Pelacak Antrean'}
        </button>
    </div>
    <QueueDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        status={queueStatus} 
      />
    </>
  );
}