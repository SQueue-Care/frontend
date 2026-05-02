// src/components/QueueDetailsModal.tsx

interface QueueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'waiting' | 'in-service' | 'completed';
}

export default function QueueDetailsModal({ isOpen, onClose, status }: QueueDetailsModalProps) {
  // PENGHAPUSAN: if (!isOpen) return null; dihilangkan agar transisi CSS bisa bekerja.

  const isWaitingDone = status === 'in-service' || status === 'completed';
  const isInServiceDone = status === 'completed';

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`fixed top-[55%] left-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden flex flex-col max-h-[80vh] transition-all duration-500 ease-out origin-center ${
        isOpen 
          ? 'opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100 visible' 
          : 'opacity-0 -translate-x-1/2 -translate-y-[70%] scale-95 invisible pointer-events-none'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-950 font-['Manrope']">Detail Antrean</h3>
            <p className="text-sm text-teal-600 font-semibold">Nomor: A-14</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content: History Timeline */}
        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
            
            {/* Tahap 1: Tiket Dicetak */}
            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-teal-50" />
              <h4 className="text-sm font-extrabold text-zinc-950">Tiket Antrean Diterbitkan</h4>
              <p className="text-xs text-slate-500 mt-1">Hari ini, 09:30 WIB</p>
              <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                Reservasi dikonfirmasi melalui portal pasien.
              </div>
            </div>

            {/* Tahap 2: Menunggu Panggilan */}
            <div className="relative pl-8">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${isWaitingDone ? 'bg-teal-600 ring-teal-50' : 'bg-rose-500 ring-rose-50 animate-pulse'}`} />
              <h4 className={`text-sm font-extrabold transition-colors ${isWaitingDone ? 'text-zinc-950' : 'text-rose-600'}`}>Menunggu Giliran</h4>
              <p className="text-xs text-slate-500 mt-1">{isWaitingDone ? 'Selesai pada 10:45 WIB' : 'Sedang berlangsung...'}</p>
            </div>

            {/* Tahap 3: Pemeriksaan (In-Service) */}
            <div className="relative pl-8">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${status === 'in-service' ? 'bg-amber-500 ring-amber-50 animate-pulse' : isInServiceDone ? 'bg-teal-600 ring-teal-50' : 'bg-slate-200 ring-white'}`} />
              <h4 className={`text-sm font-extrabold transition-colors ${status === 'in-service' ? 'text-amber-600' : isInServiceDone ? 'text-zinc-950' : 'text-slate-400'}`}>Pemeriksaan Dokter</h4>
              <p className="text-xs text-slate-500 mt-1">{status === 'in-service' ? 'Silakan masuk ke Ruangan Poli Umum' : 'Belum dimulai'}</p>
              
              {status === 'in-service' && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-bold text-amber-800">Instruksi:</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc pl-4">
                    <li>Siapkan kartu identitas Anda.</li>
                    <li>Sebutkan keluhan utama kepada perawat di depan pintu sebelum masuk.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Tahap 4: Selesai */}
            <div className="relative pl-8">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 transition-colors duration-500 ${isInServiceDone ? 'bg-emerald-500 ring-emerald-50' : 'bg-slate-200 ring-white'}`} />
              <h4 className={`text-sm font-extrabold transition-colors ${isInServiceDone ? 'text-emerald-600' : 'text-slate-400'}`}>Selesai & Ambil Obat</h4>
              <p className="text-xs text-slate-500 mt-1">Belum dimulai</p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button onClick={onClose} className="w-full py-3.5 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition-colors">
            Tutup Detail
          </button>
        </div>
      </div>
    </>
  );
}