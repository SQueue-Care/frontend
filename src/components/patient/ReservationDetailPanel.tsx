import React, { useState, useEffect } from 'react';

interface ReservationDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any | null;
  patientProfile: {
    name: string;
    nik: string;
    address: string;
  } | null;
  onCheckIn?: (appointmentId: string) => Promise<void>; 
}

const getAppointmentStatusStyle = (status: string) => {
  switch (status) {
    case 'BOOKED': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    case 'CONFIRMED': return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50';
    case 'COMPLETED':
    case 'CANCELLED': return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
    default: return 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
  }
};

const getAppointmentStatusText = (status: string) => {
  switch (status) {
    case 'BOOKED': return 'Menunggu Konfirmasi';
    case 'CONFIRMED': return 'Terkonfirmasi';
    case 'COMPLETED': return 'Selesai';
    case 'CANCELLED': return 'Dibatalkan';
    default: return status;
  }
};

export default function ReservationDetailPanel({ isOpen, onClose, appointment, patientProfile, onCheckIn }: ReservationDetailPanelProps) {
  const [isCheckInTime, setIsCheckInTime] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (!appointment || appointment.status !== 'CONFIRMED') {
      setIsCheckInTime(false);
      return;
    }

    const validateTime = () => {
      const now = new Date();
      const scheduledTime = new Date(appointment.scheduledAt);
      const checkInWindowStart = new Date(scheduledTime.getTime() - 30 * 60000);
      setIsCheckInTime(now >= checkInWindowStart);
    };

    validateTime();
    const interval = setInterval(validateTime, 60000);
    return () => clearInterval(interval);
  }, [appointment, isOpen]);

  // ANIMATION FIX: Do not return null to allow the panel to stay in the DOM and transition properly.
  // if (!appointment) return null; 

  const isCancelledOrCompleted = appointment?.status === 'CANCELLED' || appointment?.status === 'COMPLETED';

  const handleCheckInClick = async () => {
    if (!onCheckIn || !appointment) return;
    setIsCheckingIn(true);
    try {
      await onCheckIn(appointment.id);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/40 dark:bg-[#131314]/80 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[110] w-full sm:max-w-md bg-white dark:bg-[#1e1f20] shadow-2xl flex flex-col transition-transform duration-500 ease-in-out border-l border-slate-200 dark:border-zinc-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {appointment ? (
          <>
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#131314]/50 shrink-0 sticky top-0 z-10 transition-colors">
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 font-['Manrope'] tracking-tight transition-colors">Detail Reservasi</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium font-mono uppercase tracking-widest transition-colors">ID: {appointment.id?.substring(0, 8) || 'XXX'}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-zinc-700 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 shadow-sm outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-[#131314] p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1 transition-colors">Status Reservasi</p>
                  <span className={`inline-flex px-3.5 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest transition-colors ${getAppointmentStatusStyle(appointment.status)}`}>
                    {getAppointmentStatusText(appointment.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 transition-colors">Tanggal Dibuat</p>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 transition-colors">
                    {new Date(appointment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#131314] p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 space-y-6 transition-colors">
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

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Unit Layanan Medis</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Layanan</span>
                      <span className="font-extrabold text-teal-700 dark:text-teal-400 transition-colors">{appointment?.department?.name || 'Poliklinik'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Dokter Praktik</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 uppercase transition-colors">{appointment?.doctor?.user?.name || 'Belum ditentukan'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Jadwal Kunjungan</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Tanggal Kunjungan</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">
                        {new Date(appointment.scheduledAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Jam Sesi</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">
                        {new Date(appointment.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Catatan Keluhan Utuh</h4>
                  <div className="bg-white dark:bg-[#1e1f20] rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap transition-colors">
                      {appointment.notes || <span className="italic text-slate-400 dark:text-zinc-600">Tidak ada catatan keluhan yang disertakan oleh pasien saat pendaftaran.</span>}
                    </p>
                  </div>
                </div>
              </div>

              {!isCancelledOrCompleted && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in duration-500 transition-colors">
                  <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1 transition-colors">Pengingat Kehadiran</h5>
                    <p className="text-xs text-amber-700 dark:text-amber-400/80 font-medium leading-relaxed transition-colors">
                      Mohon hadir tepat waktu sesuai jadwal sesi Anda. Jika Anda datang terlambat atau tidak datang, maka jadwal pemeriksaan akan dianggap batal secara otomatis.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shrink-0 transition-colors">
              {isCheckInTime ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <button 
                    onClick={handleCheckInClick} 
                    disabled={isCheckingIn}
                    className="w-full py-4 bg-teal-600 dark:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 dark:hover:bg-teal-600 focus:ring-4 focus:ring-teal-500/30 dark:focus:ring-teal-700/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none uppercase tracking-wide text-sm"
                  >
                    {isCheckingIn ? (
                       <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memverifikasi Kehadiran...</>
                    ) : (
                      'SAYA SUDAH DI KLINIK & AMBIL ANTREAN'
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-500 dark:text-zinc-500 font-bold mt-3 uppercase tracking-widest transition-colors">Waktu check-in Anda telah tiba</p>
                </div>
              ) : (
                <button onClick={onClose} className="w-full py-4 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-extrabold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 focus:ring-4 focus:ring-slate-100 dark:focus:ring-zinc-800 transition-all shadow-sm outline-none">
                  Tutup Detail Reservasi
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </>
  );
}