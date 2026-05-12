// src/components/BookingPanel.tsx
import { useState, useEffect } from 'react';
import { useBookingStore } from '../store/bookingStore';
import apiClient from '../lib/apiClient';

interface BookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  selectedDept: { id: string; name: string } | null;
  onNext: () => void;
  onPrev: () => void;
}

export default function BookingPanel({
  isOpen,
  onClose,
  step,
  selectedDept,
  onNext,
  onPrev
}: BookingPanelProps) {
  
  // 1. Integrasi dengan Store
  const { 
    departmentDoctors, 
    doctorSchedules, 
    isLoadingDoctors, 
    isLoadingSchedules, 
    fetchDoctorsByDepartment, 
    fetchSchedulesByDoctor,
    resetBookingState
  } = useBookingStore();

  // 2. State Lokal untuk Pilihan User
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  
  // State untuk menangani proses Submit & Hasil Antrean
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueResult, setQueueResult] = useState<{ queueNumber: string, estimatedWaitTime: number } | null>(null);

  // 3. Efek Samping (Memicu pengambilan data saat panel terbuka)
  useEffect(() => {
    if (isOpen && selectedDept && step === 1) {
      // Saat panel dibuka, ambil daftar dokter untuk poli ini
      fetchDoctorsByDepartment(selectedDept.id);
    }
  }, [isOpen, selectedDept, step, fetchDoctorsByDepartment]);

  // Efek Samping (Memicu pengambilan jadwal saat dokter dipilih)
  useEffect(() => {
    if (selectedDoctorId) {
      fetchSchedulesByDoctor(selectedDoctorId);
      // Reset jadwal yang dipilih jika dokter berubah
      setSelectedScheduleId(null);
    }
  }, [selectedDoctorId, fetchSchedulesByDoctor]);

  // 4. Handler Penutupan Panel
  const handleClose = () => {
    resetBookingState();
    setSelectedDoctorId(null);
    setSelectedScheduleId(null);
    setQueueResult(null);
    onClose();
  };

  // 5. Eksekusi Pembuatan Antrean (POST /queues)
  const handleConfirmBooking = async () => {
    if (!selectedDept || !selectedDoctorId || !selectedScheduleId) return;

    setIsSubmitting(true);
    try {
      // Payload sesuai ekspektasi umum API (Sesuaikan jika backend meminta format tanggal tertentu)
      const payload = {
        departmentId: selectedDept.id,
        doctorId: selectedDoctorId,
        scheduleId: selectedScheduleId,
        date: new Date().toISOString() // Asumsi booking untuk hari ini/jadwal terdekat
      };

      const response = await apiClient.post('/queues', payload);
      
      // Simpan hasil untuk ditampilkan di Step 3
      setQueueResult({
        queueNumber: response.data.data.queueNumber,
        estimatedWaitTime: response.data.data.estimatedWaitTime
      });
      
      onNext(); // Pindah ke Step 3 (Berhasil)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat reservasi antrean.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper untuk mendapatkan nama dokter dan hari dari ID
  const getSelectedDoctorName = () => {
    const doc = departmentDoctors.find(d => d.id === selectedDoctorId);
    return doc ? doc.user.name : '-';
  };

  const getSelectedScheduleDetail = () => {
    const sched = doctorSchedules.find(s => s.id === selectedScheduleId);
    if (!sched) return '-';
    // Helper sederhana mengubah angka hari menjadi teks (0=Minggu, 1=Senin, dst)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${days[sched.dayOfWeek]} (${sched.startTime} - ${sched.endTime})`;
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

        {/* Progress Indicator (Sembunyikan saat sukses) */}
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
          
          {/* STEP 1: PILIH DOKTER & JADWAL */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <section>
                <label className="block text-sm font-bold text-zinc-900 mb-4 uppercase tracking-widest">Dokter Tersedia</label>
                {isLoadingDoctors ? (
                  <div className="p-4 text-center text-slate-500 text-sm font-semibold border border-slate-200 rounded-2xl animate-pulse">Memuat daftar dokter...</div>
                ) : departmentDoctors.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm font-semibold border border-slate-200 rounded-2xl bg-slate-50">Tidak ada dokter yang bertugas di poli ini.</div>
                ) : (
                  <div className="space-y-3">
                    {departmentDoctors.map((doc) => (
                      <div 
                        key={doc.id} 
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${selectedDoctorId === doc.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold">
                          {doc.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-extrabold text-zinc-950">{doc.user.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{doc.specialization}</p>
                        </div>
                        {selectedDoctorId === doc.id && (
                           <div className="text-teal-600">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Tampilkan Jadwal Hanya Jika Dokter Sudah Dipilih */}
              {selectedDoctorId && (
                <section className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Pilih Jadwal</label>
                  </div>
                  
                  {isLoadingSchedules ? (
                     <div className="p-4 text-center text-slate-500 text-sm font-semibold border border-slate-200 rounded-2xl animate-pulse">Memuat jadwal...</div>
                  ) : doctorSchedules.length === 0 ? (
                     <div className="p-4 text-center text-slate-500 text-sm font-semibold border border-slate-200 rounded-2xl bg-slate-50">Dokter ini belum memiliki jadwal praktik.</div>
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
                            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm' : 'border-slate-200 bg-white text-zinc-900 hover:border-teal-300'}`}
                          >
                            <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>{dayName}</span>
                            <span className="text-sm font-extrabold">{sched.startTime} - {sched.endTime}</span>
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-teal-600' : 'text-slate-500'}`}>Sisa Kuota: {sched.quota}</span>
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
              <p className="text-slate-500 text-sm mt-2 mb-8">Nomor antrean Anda telah diterbitkan secara digital.</p>
              
              <div className="w-full p-8 border-2 border-dashed border-teal-200 bg-teal-50/30 rounded-3xl mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nomor Antrean</span>
                <div className="text-7xl font-black text-teal-600 my-2 tracking-tighter">{queueResult.queueNumber}</div>
              </div>

              {/* Tampilkan Estimasi Waktu Tunggu dari API */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-sm font-semibold text-slate-600">Estimasi Tunggu</span>
                </div>
                <span className="text-sm font-extrabold text-zinc-900">{queueResult.estimatedWaitTime} Menit</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          {step === 1 && (
            <button 
              onClick={onNext} 
              disabled={!selectedDoctorId || !selectedScheduleId}
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