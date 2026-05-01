// src/components/BookingPanel.tsx

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  selectedPoli: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function BookingPanel({
  isOpen,
  onClose,
  step,
  selectedPoli,
  onNext,
  onPrev
}: BookingPanelProps) {
  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[90] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Panel */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-950 font-['Manrope']">Reservasi Antrean</h2>
            <p className="text-sm text-teal-600 font-semibold">{selectedPoli}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-500'}`}>1</div>
            <span className={step >= 1 ? 'text-zinc-900' : 'text-slate-400'}>Jadwal</span>
          </div>
          <div className="h-px bg-slate-300 flex-1 mx-4" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-500'}`}>2</div>
            <span className={step >= 2 ? 'text-zinc-900' : 'text-slate-400'}>Konfirmasi</span>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          
          {/* STEP 1: PILIH JADWAL (UI Lengkap) */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <label className="block text-sm font-bold text-zinc-900 mb-4 uppercase tracking-widest">Tanggal Kunjungan</label>
                <div className="grid grid-cols-4 gap-3">
                  <button className="flex flex-col items-center p-3 rounded-2xl border-2 border-teal-600 bg-teal-50 text-teal-700 shadow-sm transition-all">
                    <span className="text-[10px] font-bold uppercase opacity-70">Mei</span>
                    <span className="text-lg font-extrabold">02</span>
                    <span className="text-[10px] font-bold">Besok</span>
                  </button>
                  <button className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 text-zinc-900 hover:border-teal-300 transition-all">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Mei</span>
                    <span className="text-lg font-extrabold">03</span>
                    <span className="text-[10px] font-bold text-slate-500">Min</span>
                  </button>
                  <button className="flex flex-col items-center p-3 rounded-2xl border border-slate-200 text-zinc-900 hover:border-teal-300 transition-all">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Mei</span>
                    <span className="text-lg font-extrabold">04</span>
                    <span className="text-[10px] font-bold text-slate-500">Sen</span>
                  </button>
                  <button className="p-3 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </section>

              <section>
                <label className="block text-sm font-bold text-zinc-900 mb-4 uppercase tracking-widest">Dokter Tersedia</label>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border-2 border-teal-600 bg-white flex items-center gap-4 cursor-pointer relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src="https://placehold.co/100x100/e2e8f0/64748b?text=D1" alt="Dokter" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-zinc-950">dr. Sarah Jenkins, Sp.U</p>
                      <p className="text-[11px] text-slate-500 font-medium">Spesialis Urologi</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-teal-600 uppercase tracking-wider">Tersedia</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-4 cursor-pointer hover:border-slate-300 transition-all">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src="https://placehold.co/100x100/e2e8f0/64748b?text=D2" alt="Dokter" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-zinc-950">dr. Michael Chen</p>
                      <p className="text-[11px] text-slate-500 font-medium">Spesialis Bedah Umum</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Sesi Waktu</label>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">Penuh di sesi pagi</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button disabled className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-xs font-bold cursor-not-allowed">08:00</button>
                  <button disabled className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-xs font-bold cursor-not-allowed">09:30</button>
                  <button className="p-3 rounded-xl border-2 border-teal-600 bg-teal-50 text-teal-700 text-xs font-bold shadow-sm">11:00</button>
                  <button className="p-3 rounded-xl border border-slate-200 text-zinc-900 text-xs font-bold hover:bg-slate-50">13:30</button>
                  <button className="p-3 rounded-xl border border-slate-200 text-zinc-900 text-xs font-bold hover:bg-slate-50">15:00</button>
                  <button className="p-3 rounded-xl border border-slate-200 text-zinc-900 text-xs font-bold hover:bg-slate-50">16:30</button>
                </div>
              </section>
            </div>
          )}

          {/* STEP 2: KONFIRMASI */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-zinc-900 border-b border-slate-200 pb-3">Ringkasan Reservasi</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Layanan</span>
                  <span className="font-bold text-teal-700">{selectedPoli}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dokter</span>
                  <span className="font-bold text-zinc-950">dr. Sarah Jenkins, Sp.U</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Jadwal</span>
                  <span className="font-bold text-zinc-950">Besok, 02 Mei (11:00 WIB)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic text-center">
                *Dengan menekan konfirmasi, Anda menyetujui jadwal yang dipilih. Mohon hadir 15 menit lebih awal.
              </p>
            </div>
          )}

          {/* STEP 3: TIKET BERHASIL */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900">Reservasi Berhasil!</h3>
              <p className="text-slate-500 text-sm mt-2 mb-8">Nomor antrean Anda telah diterbitkan secara digital.</p>
              <div className="w-full p-8 border-2 border-dashed border-teal-200 bg-teal-50/30 rounded-3xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nomor Antrean Anda</span>
                <div className="text-7xl font-black text-teal-600 my-2 tracking-tighter">A-15</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          {step === 1 && (
            <button onClick={onNext} className="w-full py-4 bg-teal-600 text-white font-extrabold rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">
              Lanjutkan Konfirmasi
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button onClick={onPrev} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Kembali</button>
              <button onClick={onNext} className="flex-[2] py-4 bg-teal-600 text-white font-extrabold rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95">Konfirmasi</button>
            </div>
          )}
          {step === 3 && (
            <button onClick={onClose} className="w-full py-4 border-2 border-teal-600 text-teal-600 font-extrabold rounded-2xl hover:bg-teal-50 transition-colors">
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </>
  );
}