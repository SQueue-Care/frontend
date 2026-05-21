import React from 'react';

interface QueueDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: any | null;
  patientProfile: {
    name: string;
    nik: string;
    address: string;
  } | null;
}

const getQueueStatusStyle = (status: string) => {
  switch (status) {
    case 'WAITING': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    case 'CALLED':
    case 'IN_PROGRESS': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    case 'DONE':
    case 'SKIPPED':
    case 'CANCELLED': return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
    default: return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
  }
};

const getQueueStatusText = (status: string) => {
  switch (status) {
    case 'WAITING': return 'Menunggu';
    case 'CALLED': return 'Giliran Anda';
    case 'IN_PROGRESS': return 'Diperiksa';
    case 'DONE': return 'Selesai';
    case 'SKIPPED': return 'Dilewati';
    case 'CANCELLED': return 'Dibatalkan';
    default: return status;
  }
};

export default function QueueDetailPanel({ isOpen, onClose, queue, patientProfile }: QueueDetailPanelProps) {
  // ANIMATION FIX: Do not return null to allow the panel to stay in the DOM and transition properly.
  // if (!queue) return null;

  const isDone = queue?.status === 'DONE';

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/40 dark:bg-[#131314]/80 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
         className={`fixed inset-y-0 right-0 z-[110] w-full sm:max-w-md bg-white dark:bg-[#1e1f20] shadow-2xl flex flex-col transition-transform duration-500 ease-in-out border-l border-slate-200 dark:border-zinc-800  ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {queue ? (
          <>
            {/* Header Panel */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#131314]/50 shrink-0 sticky top-0 z-10 transition-colors">
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 font-['Manrope'] tracking-tight transition-colors">Detail Kunjungan</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium font-mono uppercase tracking-widest transition-colors">ID: {queue.id?.substring(0, 8) || 'XXX'}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-zinc-700 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 shadow-sm outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Konten Utama */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
              
              {/* Box Nomor Antrean & Status */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-[#131314] p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1 transition-colors">Nomor Urut</p>
                  <span className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-black rounded-xl font-mono text-xl shadow-sm transition-colors">
                    {queue.queueNumber}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 transition-colors">Status Antrean</p>
                  <span className={`inline-flex px-3.5 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest transition-colors ${getQueueStatusStyle(queue.status)}`}>
                    {getQueueStatusText(queue.status)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#131314] p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 space-y-6 transition-colors">
                {/* Blok Informasi Pasien */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Identitas Pasien</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Nama Lengkap</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 uppercase transition-colors">{patientProfile?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">NIK</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">{patientProfile?.nik || 'Belum diatur'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm mt-2">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Alamat Domisili</span>
                      <span className="font-bold text-zinc-950 dark:text-zinc-100 text-right leading-relaxed transition-colors">
                        {patientProfile?.address || 'Belum ada alamat terdaftar.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blok Poliklinik & Dokter */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Unit Layanan Medis</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Layanan</span>
                      <span className="font-extrabold text-teal-700 dark:text-teal-400 transition-colors">{queue?.department?.name || 'Poliklinik'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Dokter Praktik</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 uppercase transition-colors">{queue?.doctor?.user?.name || 'Belum ditentukan'}</span>
                    </div>
                  </div>
                </div>

                {/* Blok Jadwal & Waktu */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Waktu Kunjungan</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Tanggal Kunjungan</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">
                        {new Date(queue.queueDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Jam Sesi</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">
                        {new Date(queue.queueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Tgl. Didaftarkan</span>
                      <span className="font-bold text-zinc-600 dark:text-zinc-400 italic transition-colors">
                        {new Date(queue.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blok Dinamis: Keluhan vs Catatan Dokter */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">
                    Catatan Keluhan Awal Pasien
                  </h4>
                  <div className="bg-white dark:bg-[#1e1f20] rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap transition-colors">
                      {queue.notes || (
                        <span className="italic text-slate-400 dark:text-zinc-600 transition-colors">
                          Tidak ada catatan keluhan tertulis saat pendaftaran.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 2. BLOK CATATAN & PENGINGAT DOKTER (Muncul saat Antrean Selesai/DONE) */}
                {queue.status === 'DONE' && (
                  <div className="animate-in fade-in duration-500">
                    <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 border-b border-amber-200 dark:border-amber-900/50 pb-2 transition-colors">
                      Catatan Dokter & Pengingat Penyakit
                    </h4>
                    <div className="bg-amber-50/60 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-colors">
                      <p className="text-sm text-zinc-800 dark:text-amber-100 font-semibold leading-relaxed whitespace-pre-wrap transition-colors">
                        {/* Asumsi field dari backend/store menggunakan nama doctorNotes */}
                        {queue.doctorNotes || (
                          <span className="italic text-slate-400 dark:text-zinc-500 font-normal transition-colors">
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
            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shrink-0 transition-colors">
              <button onClick={onClose} className="w-full py-4 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-extrabold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 focus:ring-4 focus:ring-slate-100 dark:focus:ring-zinc-800 transition-all shadow-sm outline-none">
                Tutup Detail Kunjungan
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </>
  );
}