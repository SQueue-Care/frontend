// src/components/patient/ReservationDetailPanel.tsx
import React, { useState, useEffect } from 'react'; // Injeksi Hook State & Effect

interface ReservationDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any | null;
  patientProfile: {
    name: string;
    nik: string;
    address: string;
  } | null;
  // TAMBAHAN: Properti fungsi aksi untuk memicu check-in ke backend
  onCheckIn?: (appointmentId: string) => Promise<void>; 
}

const getAppointmentStatusStyle = (status: string) => {
  switch (status) {
    case 'BOOKED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CONFIRMED': return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'COMPLETED':
    case 'CANCELLED': return 'bg-slate-50 text-slate-600 border-slate-200';
    default: return 'bg-slate-50 text-slate-500 border-slate-200';
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
  // STATE BARU: Pendeteksi Waktu Check-In & Status Loading
  const [isCheckInTime, setIsCheckInTime] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // EFEK SAMPING: Pendeteksi Waktu Real-Time (Berjalan setiap detik saat panel dibuka)
  useEffect(() => {
    if (!appointment || appointment.status !== 'CONFIRMED') {
      setIsCheckInTime(false);
      return;
    }

    const validateTime = () => {
      const now = new Date();
      const scheduledTime = new Date(appointment.scheduledAt);
      // Jendela Check-in terbuka 30 menit sebelum jadwal
      const checkInWindowStart = new Date(scheduledTime.getTime() - 30 * 60000);
      
      setIsCheckInTime(now >= checkInWindowStart);
    };

    // Validasi langsung saat dibuka
    validateTime();

    // Validasi berulang setiap 1 menit agar UI update otomatis tanpa di-refresh
    const interval = setInterval(validateTime, 60000);
    return () => clearInterval(interval);
  }, [appointment, isOpen]);

  if (!appointment) return null; 

  const isCancelledOrCompleted = appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED';

  // Handler eksekusi tombol
  const handleCheckInClick = async () => {
    if (!onCheckIn) return;
    setIsCheckingIn(true);
    try {
      await onCheckIn(appointment.id);
    } finally {
      setIsCheckingIn(false); // Kembalikan state meskipun berhasil/gagal agar tidak nyangkut
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/40 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[110] w-full sm:max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-in-out border-l border-slate-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0 sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tight">Detail Reservasi</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium font-mono uppercase tracking-widest">ID: {appointment.id?.substring(0, 8) || 'XXX'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white border border-slate-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Reservasi</p>
              <span className={`inline-flex px-3.5 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getAppointmentStatusStyle(appointment.status)}`}>
                {getAppointmentStatusText(appointment.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Dibuat</p>
              <span className="text-sm font-extrabold text-zinc-900">
                {new Date(appointment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-6">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Identitas Pasien</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Nama Lengkap</span>
                  <span className="font-extrabold text-zinc-950 uppercase">{patientProfile?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">NIK</span>
                  <span className="font-extrabold text-zinc-950">{patientProfile?.nik || 'Belum diatur'}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm mt-2">
                  <span className="text-slate-500 font-medium">Alamat Domisili</span>
                  <span className="font-bold text-zinc-950 text-right leading-relaxed">
                    {patientProfile?.address || 'Belum ada alamat terdaftar.'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Unit Layanan Medis</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Layanan</span>
                  <span className="font-extrabold text-teal-700">{appointment?.department?.name || 'Poliklinik'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Dokter Praktik</span>
                  <span className="font-extrabold text-zinc-950 uppercase">{appointment?.doctor?.user?.name || 'Belum ditentukan'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Jadwal Kunjungan</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Tanggal Kunjungan</span>
                  <span className="font-extrabold text-zinc-950">
                    {new Date(appointment.scheduledAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Jam Sesi</span>
                  <span className="font-extrabold text-zinc-950">
                    {new Date(appointment.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Catatan Keluhan Utuh</h4>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <p className="text-sm text-zinc-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {appointment.notes || <span className="italic text-slate-400">Tidak ada catatan keluhan yang disertakan oleh pasien saat pendaftaran.</span>}
                </p>
              </div>
            </div>
          </div>

          {!isCancelledOrCompleted && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in duration-500">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <h5 className="text-xs font-bold text-amber-800 mb-1">Pengingat Kehadiran</h5>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Mohon hadir tepat waktu sesuai jadwal sesi Anda. Jika Anda datang terlambat atau tidak datang, maka jadwal pemeriksaan akan dianggap batal secara otomatis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Aksi Dinamis (Perubahan Utama) */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          {isCheckInTime ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <button 
                onClick={handleCheckInClick} 
                disabled={isCheckingIn}
                className="w-full py-4 bg-teal-600 text-white font-black rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none uppercase tracking-wide text-sm"
              >
                {isCheckingIn ? (
                   <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memverifikasi Kehadiran...</>
                ) : (
                  'SAYA SUDAH DI KLINIK & AMBIL ANTREAN'
                )}
              </button>
              <p className="text-[10px] text-center text-slate-500 font-bold mt-3 uppercase tracking-widest">Waktu check-in Anda telah tiba</p>
            </div>
          ) : (
            <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-extrabold rounded-xl hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm outline-none">
              Tutup Detail Reservasi
            </button>
          )}
        </div>
      </div>
    </>
  );
}