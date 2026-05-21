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
      <div 
        className={`fixed inset-0 bg-white/40 dark:bg-[#131314]/80 backdrop-blur-sm z-[80] transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={step === 3 ? handleClose : undefined} 
      />

      <div className={`fixed inset-y-0 right-0 z-[90] w-full sm:max-w-md md:w-[500px] bg-white dark:bg-[#1e1f20] shadow-2xl flex flex-col transition-transform duration-500 ease-in-out border-l border-slate-200 dark:border-zinc-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Panel */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#131314]/50 shrink-0 sticky top-0 z-10 transition-colors">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 font-['Manrope'] tracking-tight transition-colors">Reservasi Antrean</h2>
            <p className="text-sm text-teal-600 dark:text-teal-400 font-bold mt-0.5 transition-colors">{selectedDept?.name || 'Poliklinik'}</p>
          </div>
          {step !== 3 && (
            <button onClick={handleClose} className="p-2 rounded-xl text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-zinc-700 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 3 && (
          <div className="px-8 py-4 bg-white dark:bg-[#1e1f20] border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest shrink-0 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-[#131314] text-slate-400 dark:text-zinc-600'}`}>1</div>
              <span className={`transition-colors ${step >= 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'}`}>Jadwal</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1 mx-4 transition-colors" />
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-[#131314] text-slate-400 dark:text-zinc-600'}`}>2</div>
              <span className={`transition-colors ${step >= 2 ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'}`}>Konfirmasi</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* STEP 1: PILIH DOKTER, TANGGAL, & JADWAL */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <section>
                <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 mb-3 uppercase tracking-widest transition-colors">Pilih Dokter Spesialis</label>
                {isLoadingDoctors ? (
                  <div className="p-4 text-center text-slate-400 dark:text-zinc-500 text-sm font-semibold border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl animate-pulse transition-colors">Memuat daftar dokter...</div>
                ) : departmentDoctors.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-zinc-400 text-sm font-medium border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-[#131314] transition-colors">Belum ada dokter di poliklinik ini.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {departmentDoctors.map(doc => {
                      const isSelected = selectedDoctorId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 overflow-hidden group outline-none ${isSelected ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-sm' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#131314] hover:border-teal-200 dark:hover:border-teal-900/50'}`}
                        >
                          {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 animate-in slide-in-from-left-1" />}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-[#1e1f20] text-slate-500 dark:text-zinc-500 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-600 dark:group-hover:text-teal-400'}`}>
                            {doc.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-extrabold text-sm uppercase transition-colors ${isSelected ? 'text-teal-800 dark:text-teal-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{doc.user.name}</div>
                            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium transition-colors">{doc.specialization}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {selectedDoctorId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 mb-3 uppercase tracking-widest transition-colors">Pilih Tanggal Kunjungan</label>
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
                          className={`snap-center shrink-0 w-20 py-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 outline-none ${isSelected ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#131314] text-zinc-600 dark:text-zinc-400 hover:border-teal-200 dark:hover:border-teal-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/20'}`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-zinc-500'}`}>{dayName}</span>
                          <span className={`text-2xl font-black transition-colors ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>{dateNum}</span>
                          <span className={`text-[10px] font-bold uppercase transition-colors ${isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-zinc-500'}`}>{monthName}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {selectedDoctorId && selectedDate && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 mb-3 uppercase tracking-widest transition-colors">Pilih Sesi Waktu</label>
                  {isLoadingSchedules ? (
                     <div className="p-4 text-center text-slate-400 dark:text-zinc-500 text-sm font-semibold border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl animate-pulse transition-colors">Sinkronisasi jadwal...</div>
                  ) : doctorSchedules.length === 0 ? (
                     <div className="p-6 text-center text-slate-500 dark:text-zinc-400 text-sm font-medium border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-[#131314] transition-colors">Tidak ada sesi praktik pada tanggal yang dipilih.</div>
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
                            className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 outline-none ${isSelected ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-sm scale-[1.02]' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#131314] hover:border-teal-200 dark:hover:border-teal-900/50 hover:bg-slate-50 dark:hover:bg-zinc-800/80'}`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500'}`}>{dayNameIndo}</span>
                            <span className={`text-base font-black transition-colors ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-slate-700 dark:text-zinc-300'}`}>{sched.startTime} - {sched.endTime}</span>
                            <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${isSelected ? 'bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-800/50 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-[#1e1f20] border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400'}`}>
                              Kapasitas: {sched.capacity}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {selectedScheduleId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-zinc-500 mb-3 uppercase tracking-widest transition-colors">
                    Keluhan atau Catatan Medis
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan gejala yang dialami..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-[#131314] border-2 border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-zinc-100 shadow-sm hover:border-teal-200 dark:hover:border-teal-900/50 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                  />
                </section>
              )}
            </div>
          )}

          {/* STEP 2: KONFIRMASI */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="bg-slate-50 dark:bg-[#131314] p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 space-y-6 transition-colors">
                
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Informasi Pasien</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Nama</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 uppercase transition-colors">{patientProfile?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">NIK</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">{patientProfile?.nik || 'Belum diatur'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Tgl Lahir</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 transition-colors">
                        {patientProfile?.birthDate ? new Date(patientProfile.birthDate).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Detail Kunjungan</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Layanan</span>
                      <span className="font-extrabold text-teal-700 dark:text-teal-400 transition-colors">{selectedDept?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Dokter</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 uppercase transition-colors">{getSelectedDoctorName()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium transition-colors">Jadwal</span>
                      <span className="font-extrabold text-zinc-950 dark:text-zinc-100 text-right transition-colors">{getSelectedScheduleDetail()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 transition-colors">Catatan Keluhan Awal</h4>
                  <div className="bg-white dark:bg-[#1e1f20] rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap transition-colors">
                      {notes.trim() || <span className="italic text-slate-400 dark:text-zinc-600">Tidak ada catatan keluhan tambahan.</span>}
                    </p>
                  </div>
                </div>

              </div>

              <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-relaxed font-bold italic text-center uppercase tracking-wide transition-colors">
                *Data di atas akan masuk ke dalam rekam medis sistem.
              </p>
            </div>
          )}

          {/* STEP 3: TIKET BERHASIL */}
          {step === 3 && queueResult && (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm transition-colors">
                <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-100 font-['Manrope'] tracking-tight transition-colors">Reservasi Berhasil!</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mt-2 mb-8 transition-colors">
                {queueResult.isAppointment ? 'Jadwal kunjungan Anda telah dikonfirmasi.' : 'Nomor antrean Anda telah diterbitkan secara digital.'}
              </p>
              
              <div className="w-full p-8 border-2 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] rounded-3xl mb-6 shadow-sm transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest transition-colors">Nomor Urut Pendaftaran</span>
                <div className="text-6xl font-black text-teal-600 dark:text-teal-400 my-2 font-mono tracking-tighter transition-colors">{queueResult.queueNumber}</div>
              </div>

              {!queueResult.isAppointment && queueResult.estimatedWaitTime > 0 && (
                <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 w-full flex items-center justify-between shadow-sm transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <span className="text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest transition-colors">Estimasi Tunggu</span>
                  </div>
                  <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 transition-colors">{queueResult.estimatedWaitTime} Menit</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#131314]/50 shrink-0 transition-colors">
          {step === 1 && (
            <button 
              onClick={onNext} 
              disabled={!selectedDoctorId || !selectedDate || !selectedScheduleId}
              className="w-full py-4 bg-teal-600 dark:bg-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 dark:hover:bg-teal-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none outline-none"
            >
              Lanjutkan Konfirmasi
            </button>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-3 w-full">
              {hasActiveQueue && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-bold text-center animate-in fade-in slide-in-from-bottom-2 transition-colors">
                  Peringatan: Anda tidak dapat melanjutkan karena saat ini Anda sedang dalam antrean.
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={onPrev} 
                  disabled={isSubmitting} 
                  className="flex-1 py-4 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-extrabold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 outline-none shadow-sm"
                >
                  Kembali
                </button>
                
                <button 
                  onClick={handleConfirmBooking} 
                  disabled={isSubmitting || hasActiveQueue} 
                  className={`flex-[2] py-4 font-extrabold rounded-xl transition-all outline-none flex items-center justify-center gap-2 ${
                    hasActiveQueue 
                      ? 'bg-slate-100 dark:bg-[#131314] text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800 cursor-not-allowed shadow-none' 
                      : 'bg-teal-600 dark:bg-teal-700 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 dark:hover:bg-teal-600 active:scale-95 disabled:opacity-50'
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
            <button onClick={handleClose} className="w-full py-4 bg-white dark:bg-[#1e1f20] border-2 border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors shadow-sm outline-none">
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </>
  );
}