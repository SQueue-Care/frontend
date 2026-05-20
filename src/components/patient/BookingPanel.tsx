// src/components/patient/BookingPanel.tsx
import { useState, useEffect, useMemo } from 'react';
import { useBookingStore } from '../../store/bookingStore';

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  selectedDept: { id: string; name: string } | null;
  patientProfile: {
    name: string;
    nik: string;
    birthDate: string;
  } | null;
  onNext: () => void;
  onPrev: () => void;
  onBookingSuccess?: (id: string, isAppointment: boolean) => void;
  hasActiveQueue?: boolean;
}

const generateNextDays = (daysCount: number) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export default function BookingPanel({ 
  isOpen, onClose, step, selectedDept, patientProfile, onNext, onPrev, onBookingSuccess, hasActiveQueue 
}: BookingPanelProps) {  
  const { 
    departmentDoctors, doctorSchedules, isLoadingDoctors, isLoadingSchedules, isSubmitting,
    fetchDoctorsByDepartment, fetchSchedulesByDoctor, submitBooking, resetBookingState 
  } = useBookingStore();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(""); 
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(""); 
  const [queueResult, setQueueResult] = useState<any>(null);

  const availableDates = useMemo(() => generateNextDays(14), []);

  useEffect(() => {
    if (isOpen && selectedDept) {
      fetchDoctorsByDepartment(selectedDept.id);
    }
  }, [isOpen, selectedDept, fetchDoctorsByDepartment]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const localDateObj = new Date(year, month - 1, day);
      
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      fetchSchedulesByDoctor(selectedDoctorId, days[localDateObj.getDay()]);
      setSelectedScheduleId(null);
    }
  }, [selectedDoctorId, selectedDate, fetchSchedulesByDoctor]);

  const handleClose = () => {
    setSelectedDoctorId(null);
    setSelectedDate("");
    setSelectedScheduleId(null);
    setNotes("");
    setQueueResult(null);
    resetBookingState();
    onClose();
  };

  const getSelectedDoctorName = () => {
    const doc = departmentDoctors.find(d => d.id === selectedDoctorId);
    return doc ? doc.user.name.toUpperCase() : '-';
  };

  const getSelectedScheduleDetail = () => {
    const sched = doctorSchedules.find(s => s.id === selectedScheduleId);
    if (!sched || !selectedDate) return '-';
    const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${formattedDate} | ${sched.startTime} - ${sched.endTime}`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedDept || !selectedDoctorId || !selectedScheduleId || !selectedDate) return;
    try {
      const result = await submitBooking({
        departmentId: selectedDept.id,
        doctorId: selectedDoctorId,
        scheduleId: selectedScheduleId,
        date: `${selectedDate}T12:00:00.000Z`,
        notes: notes
      });
      setQueueResult(result);
      onNext();

      if (onBookingSuccess && result.id) {
         onBookingSuccess(result.id, result.isAppointment);
      }
    } catch (err: any) {
      alert(`Pendaftaran Ditolak Sistem:\n\n${err.message || 'Silakan cek console browser (F12) untuk detail error.'}`);
    }
  };

  return (
    <>
      {/* 1. SINKRONISASI TEMA: Overlay Putih Transparan ber-Blur */}
      <div 
        className={`fixed inset-0 bg-white/40 backdrop-blur-sm z-[80] transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={step === 3 ? handleClose : undefined} 
      />

      {/* 2. SINKRONISASI TEMA: Kontainer Slide-Over Kanan */}
      <div className={`fixed inset-y-0 right-0 z-[90] w-full sm:max-w-md md:w-[500px] bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-in-out border-l border-slate-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Panel Tersendat (Sticky) bergaya Premium */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tight">Reservasi Antrean</h2>
            <p className="text-sm text-teal-600 font-bold mt-0.5">{selectedDept?.name || 'Poliklinik'}</p>
          </div>
          {step !== 3 && (
            <button onClick={handleClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white border border-slate-200 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 3 && (
          <div className="px-8 py-4 bg-white border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <span className={step >= 1 ? 'text-zinc-900' : 'text-slate-400'}>Jadwal</span>
            </div>
            <div className="h-px bg-slate-200 flex-1 mx-4" />
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <span className={step >= 2 ? 'text-zinc-900' : 'text-slate-400'}>Konfirmasi</span>
            </div>
          </div>
        )}

        {/* Konten Dinamis */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* STEP 1: PILIH DOKTER, TANGGAL, & JADWAL */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* BAGIAN A: PILIH DOKTER */}
              <section>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Dokter Spesialis</label>
                {isLoadingDoctors ? (
                  <div className="p-4 text-center text-slate-400 text-sm font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-pulse">Memuat daftar dokter...</div>
                ) : departmentDoctors.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm font-medium border border-slate-100 rounded-2xl bg-slate-50">Belum ada dokter di poliklinik ini.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {departmentDoctors.map(doc => {
                      const isSelected = selectedDoctorId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 overflow-hidden group outline-none ${isSelected ? 'border-teal-500 bg-teal-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-teal-200'}`}
                        >
                          {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 animate-in slide-in-from-left-1" />}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'}`}>
                            {doc.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-extrabold text-sm uppercase ${isSelected ? 'text-teal-800' : 'text-zinc-900'}`}>{doc.user.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 font-medium">{doc.specialization}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* BAGIAN B: PILIH TANGGAL */}
              {selectedDoctorId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Tanggal Kunjungan</label>
                  <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {availableDates.map(date => {
                      const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      const isSelected = selectedDate === dateString;
                      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                      const dateNum = date.getDate();
                      const monthName = date.toLocaleDateString('id-ID', { month: 'short' });

                      return (
                        <button
                          key={dateString}
                          onClick={() => setSelectedDate(dateString)}
                          className={`snap-center shrink-0 w-20 py-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 outline-none ${isSelected ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105' : 'border-slate-100 bg-white text-zinc-600 hover:border-teal-200 hover:bg-teal-50'}`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{dayName}</span>
                          <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-zinc-900'}`}>{dateNum}</span>
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{monthName}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* BAGIAN C: PILIH JADWAL */}
              {selectedDoctorId && selectedDate && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Sesi Waktu</label>
                  {isLoadingSchedules ? (
                     <div className="p-4 text-center text-slate-400 text-sm font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-pulse">Sinkronisasi jadwal...</div>
                  ) : doctorSchedules.length === 0 ? (
                     <div className="p-6 text-center text-slate-500 text-sm font-medium border border-slate-100 rounded-2xl bg-slate-50">Tidak ada sesi praktik pada tanggal yang dipilih.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {doctorSchedules.map((sched) => {
                        const dayNames: Record<string, string> = {
                          'MONDAY': 'Senin', 'TUESDAY': 'Selasa', 'WEDNESDAY': 'Rabu',
                          'THURSDAY': 'Kamis', 'FRIDAY': 'Jumat', 'SATURDAY': 'Sabtu', 'SUNDAY': 'Minggu'
                        };
                        const dayNameIndo = dayNames[sched.dayOfWeek] || sched.dayOfWeek;
                        const isSelected = selectedScheduleId === sched.id;
                        
                        return (
                          <button 
                            key={sched.id}
                            onClick={() => setSelectedScheduleId(sched.id)}
                            className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 outline-none ${isSelected ? 'border-teal-500 bg-teal-50/50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>{dayNameIndo}</span>
                            <span className={`text-base font-black ${isSelected ? 'text-zinc-900' : 'text-slate-700'}`}>{sched.startTime} - {sched.endTime}</span>
                            <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isSelected ? 'bg-teal-100 border-teal-200 text-teal-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                              Kapasitas: {sched.capacity}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* BAGIAN D: KELUHAN / NOTES */}
              {selectedScheduleId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                    Keluhan atau Catatan Medis
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan gejala yang dialami..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-medium text-zinc-900 shadow-sm hover:border-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none placeholder:text-slate-400"
                  />
                </section>
              )}
            </div>
          )}

          {/* STEP 2: KONFIRMASI (Disinkronkan dengan desain ReservationDetailPanel) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-6">
                
                {/* Informasi Pasien */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Informasi Pasien</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Nama</span>
                      <span className="font-extrabold text-zinc-950 uppercase">{patientProfile?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">NIK</span>
                      <span className="font-extrabold text-zinc-950">{patientProfile?.nik || 'Belum diatur'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Tgl Lahir</span>
                      <span className="font-extrabold text-zinc-950">
                        {patientProfile?.birthDate ? new Date(patientProfile.birthDate).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detail Kunjungan */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Detail Kunjungan</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Layanan</span>
                      <span className="font-extrabold text-teal-700">{selectedDept?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Dokter</span>
                      <span className="font-extrabold text-zinc-950 uppercase">{getSelectedDoctorName()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Jadwal</span>
                      <span className="font-extrabold text-zinc-950 text-right">{getSelectedScheduleDetail()}</span>
                    </div>
                  </div>
                </div>

                {/* Keluhan */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Catatan Keluhan Awal</h4>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <p className="text-sm text-zinc-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {notes.trim() || <span className="italic text-slate-400">Tidak ada catatan keluhan tambahan.</span>}
                    </p>
                  </div>
                </div>

              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic text-center uppercase tracking-wide">
                *Data di atas akan masuk ke dalam rekam medis sistem.
              </p>
            </div>
          )}

          {/* STEP 3: TIKET BERHASIL */}
          {step === 3 && queueResult && (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] tracking-tight">Reservasi Berhasil!</h3>
              <p className="text-slate-500 text-sm font-medium mt-2 mb-8">
                {queueResult.isAppointment ? 'Jadwal kunjungan Anda telah dikonfirmasi.' : 'Nomor antrean Anda telah diterbitkan secara digital.'}
              </p>
              
              <div className="w-full p-8 border-2 border-slate-200 bg-slate-50 rounded-3xl mb-6 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Urut Pendaftaran</span>
                <div className="text-6xl font-black text-teal-600 my-2 font-mono tracking-tighter">{queueResult.queueNumber}</div>
              </div>

              {/* Tampilkan Estimasi Waktu Tunggu jika ada */}
              {!queueResult.isAppointment && queueResult.estimatedWaitTime > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Estimasi Tunggu</span>
                  </div>
                  <span className="text-lg font-extrabold text-zinc-900">{queueResult.estimatedWaitTime} Menit</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {step === 1 && (
            <button 
              onClick={onNext} 
              disabled={!selectedDoctorId || !selectedDate || !selectedScheduleId}
              className="w-full py-4 bg-teal-600 text-white font-extrabold rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none outline-none"
            >
              Lanjutkan Konfirmasi
            </button>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-3 w-full">
              {/* Spanduk Peringatan Khusus jika Pasien Sedang Mengantre */}
              {hasActiveQueue && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center animate-in fade-in slide-in-from-bottom-2">
                  Peringatan: Anda tidak dapat melanjutkan karena saat ini Anda sudah dalam antrean.
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={onPrev} 
                  disabled={isSubmitting} 
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-extrabold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 outline-none shadow-sm"
                >
                  Kembali
                </button>
                
                <button 
                  onClick={handleConfirmBooking} 
                  disabled={isSubmitting || hasActiveQueue} 
                  className={`flex-[2] py-4 font-extrabold rounded-xl transition-all outline-none flex items-center justify-center gap-2 ${
                    hasActiveQueue 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none' 
                      : 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-95 disabled:opacity-50'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Memproses...
                    </>
                  ) : hasActiveQueue ? (
                    'Anda Sudah Dalam Antrean' 
                  ) : (
                    'Konfirmasi Registrasi'
                  )}
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <button onClick={handleClose} className="w-full py-4 bg-white border-2 border-teal-600 text-teal-700 font-extrabold rounded-xl hover:bg-teal-50 transition-colors shadow-sm outline-none">
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </>
  );
}