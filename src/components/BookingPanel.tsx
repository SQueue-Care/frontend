// src/components/BookingPanel.tsx
import { useState, useEffect } from 'react';
import { useBookingStore } from '../store/bookingStore';

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  selectedDept: { id: string; name: string } | null;
  onNext: () => void;
  onPrev: () => void;
}

export default function BookingPanel({ isOpen, onClose, step, selectedDept, onNext, onPrev }: BookingPanelProps) {
  
  // 1. Integrasi dengan Store
  const { 
    departmentDoctors, 
    doctorSchedules, 
    isLoadingDoctors, 
    isLoadingSchedules, 
    isSubmitting,
    fetchDoctorsByDepartment, 
    fetchSchedulesByDoctor, 
    submitBooking, 
    resetBookingState 
  } = useBookingStore();

  // 2. State Lokal
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(""); 
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [queueResult, setQueueResult] = useState<any>(null);

  // 3. Efek 1: Ambil daftar dokter saat panel dibuka
  useEffect(() => {
    if (isOpen && selectedDept) {
      fetchDoctorsByDepartment(selectedDept.id);
    }
  }, [isOpen, selectedDept, fetchDoctorsByDepartment]);

  // 4. Efek 2: Ambil jadwal saat dokter ATAU tanggal berubah
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      const day = new Date(selectedDate).getDay(); // Mendapatkan 0-6 (Minggu-Sabtu)
      fetchSchedulesByDoctor(selectedDoctorId, day);
      setSelectedScheduleId(null); // Reset pilihan jadwal saat tanggal diubah
    }
  }, [selectedDoctorId, selectedDate, fetchSchedulesByDoctor]);

  // 5. Fungsi Bantuan (Helpers)
  const handleClose = () => {
    setSelectedDoctorId(null);
    setSelectedDate("");
    setSelectedScheduleId(null);
    setQueueResult(null);
    resetBookingState();
    onClose();
  };

  const getSelectedDoctorName = () => {
    const doc = departmentDoctors.find(d => d.id === selectedDoctorId);
    return doc ? doc.user.name : '-';
  };

  const getSelectedScheduleDetail = () => {
    const sched = doctorSchedules.find(s => s.id === selectedScheduleId);
    if (!sched || !selectedDate) return '-';
    // Format: YYYY-MM-DD | 08:00 - 12:00
    return `${selectedDate} | ${sched.startTime} - ${sched.endTime}`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedDept || !selectedDoctorId || !selectedScheduleId || !selectedDate) return;
    try {
      const result = await submitBooking({
        departmentId: selectedDept.id,
        doctorId: selectedDoctorId,
        scheduleId: selectedScheduleId,
        date: new Date(selectedDate).toISOString()
      });
      setQueueResult(result);
      onNext();
    } catch (err) {
      alert("Gagal melakukan reservasi. Silakan coba lagi.");
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={step === 3 ? handleClose : undefined} />

      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[90] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Panel */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-950 font-['Manrope']">Reservasi Antrean</h2>
            <p className="text-sm text-teal-600 font-semibold">{selectedDept?.name || 'Poliklinik'}</p>
          </div>
          {step !== 3 && (
            <button onClick={handleClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 3 && (
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
        )}

        {/* Konten Dinamis */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          
          {/* STEP 1: PILIH DOKTER, TANGGAL, & JADWAL */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* BAGIAN A: PILIH DOKTER (Radio Cards Premium) */}
              <section>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Dokter Spesialis</label>
                {isLoadingDoctors ? (
                  <div className="p-4 text-center text-slate-400 text-sm font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-pulse">Memuat daftar dokter...</div>
                ) : departmentDoctors.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm font-semibold border border-slate-100 rounded-3xl bg-slate-50">Belum ada dokter di poliklinik ini.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {departmentDoctors.map(doc => {
                      const isSelected = selectedDoctorId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 overflow-hidden group ${isSelected ? 'border-teal-500 bg-teal-50/30 shadow-md shadow-teal-500/10' : 'border-slate-100 bg-white hover:border-teal-200 hover:shadow-sm'}`}
                        >
                          {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 animate-in slide-in-from-left-1" />}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'}`}>
                            {doc.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-extrabold text-sm ${isSelected ? 'text-teal-800' : 'text-zinc-900'}`}>{doc.user.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 font-medium">{doc.specialization}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* BAGIAN B: PILIH TANGGAL (Custom Date Picker) */}
              {selectedDoctorId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Tanggal Kunjungan</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <svg className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    {/* HACK CSS: Menyembunyikan ikon kalender bawaan browser namun tetap fungsional */}
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]} 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-extrabold text-zinc-800 shadow-sm hover:border-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all cursor-pointer relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </section>
              )}

              {/* BAGIAN C: PILIH JADWAL (Premium Time Slots) */}
              {selectedDoctorId && selectedDate && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Sesi Waktu</label>
                  
                  {isLoadingSchedules ? (
                     <div className="p-4 text-center text-slate-400 text-sm font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-pulse">Sinkronisasi jadwal...</div>
                  ) : doctorSchedules.length === 0 ? (
                     <div className="p-6 text-center text-slate-500 text-sm font-semibold border border-slate-100 rounded-3xl bg-slate-50">Tidak ada sesi praktik pada tanggal yang dipilih.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {doctorSchedules.map((sched) => {
                        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                        const dayName = days[sched.dayOfWeek];
                        const isSelected = selectedScheduleId === sched.id;
                        
                        return (
                          <button 
                            key={sched.id}
                            onClick={() => setSelectedScheduleId(sched.id)}
                            className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${isSelected ? 'border-teal-500 bg-gradient-to-b from-teal-50/50 to-white shadow-md shadow-teal-500/10 scale-[1.02]' : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50/50'}`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>{dayName}</span>
                            <span className={`text-base font-black ${isSelected ? 'text-zinc-900' : 'text-slate-700'}`}>{sched.startTime} - {sched.endTime}</span>
                            <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isSelected ? 'bg-teal-100 border-teal-200 text-teal-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                              Sisa Kuota: {sched.quota}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* STEP 2: KONFIRMASI */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-zinc-900 border-b border-slate-200 pb-3">Ringkasan Reservasi</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Layanan</span>
                  <span className="font-bold text-teal-700">{selectedDept?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dokter</span>
                  <span className="font-bold text-zinc-950">{getSelectedDoctorName()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Jadwal</span>
                  <span className="font-bold text-zinc-950">{getSelectedScheduleDetail()}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic text-center">
                *Dengan menekan konfirmasi, Anda menyetujui jadwal yang dipilih.
              </p>
            </div>
          )}

          {/* STEP 3: TIKET BERHASIL */}
          {step === 3 && queueResult && (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900">Reservasi Berhasil!</h3>
              <p className="text-slate-500 text-sm mt-2 mb-8">
                {queueResult.isAppointment ? 'Jadwal kunjungan Anda telah dikonfirmasi.' : 'Nomor antrean Anda telah diterbitkan secara digital.'}
              </p>
              
              <div className="w-full p-8 border-2 border-dashed border-teal-200 bg-teal-50/30 rounded-3xl mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nomor Antrean / Booking</span>
                <div className="text-7xl font-black text-teal-600 my-2 tracking-tighter">{queueResult.queueNumber}</div>
              </div>

              {/* Tampilkan Estimasi Waktu Tunggu jika pendaftaran hari ini */}
              {!queueResult.isAppointment && queueResult.estimatedWaitTime > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-sm font-semibold text-slate-600">Estimasi Tunggu</span>
                  </div>
                  <span className="text-sm font-extrabold text-zinc-900">{queueResult.estimatedWaitTime} Menit</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          {step === 1 && (
            <button 
              onClick={onNext} 
              disabled={!selectedDoctorId || !selectedDate || !selectedScheduleId}
              className="w-full py-4 bg-teal-600 text-white font-extrabold rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Lanjutkan Konfirmasi
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button onClick={onPrev} disabled={isSubmitting} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50">Kembali</button>
              <button onClick={handleConfirmBooking} disabled={isSubmitting} className="flex-[2] py-4 bg-teal-600 text-white font-extrabold rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses...
                  </>
                ) : 'Konfirmasi'}
              </button>
            </div>
          )}
          {step === 3 && (
            <button onClick={handleClose} className="w-full py-4 border-2 border-teal-600 text-teal-600 font-extrabold rounded-2xl hover:bg-teal-50 transition-colors">
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </>
  );
}