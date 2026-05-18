// src/components/DoctorAppointmentManagement.tsx
import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

export default function DoctorAppointmentManagement() {
  const user = useAuthStore((state) => state.user);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  
  // State Modal Pembatalan
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelAptId, setSelectedCancelAptId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const doctorId = (user as any)?.doctor?.id || (user?.role === 'DOCTOR' ? user.id : null);

  const fetchAppointments = async () => {
    if (!doctorId) return;
    setIsLoadingAppointments(true);
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/appointments`);
      setAppointments(response.data.data || []);
    } catch (error: any) {
      console.error('Gagal memuat appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const payload: any = { status: newStatus };
      await apiClient.patch(`/appointments/${appointmentId}`, payload);
      fetchAppointments();
      alert('Status reservasi berhasil diperbarui!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status appointment.');
    }
  };

  const handleDoctorCancelAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCancelAptId) return;
    if (cancellationReason.trim() === '') {
      alert('Alasan pembatalan wajib diisi secara spesifik.');
      return;
    }

    try {
      const payload = {
        status: 'CANCELLED',
        cancellationReason: cancellationReason
      };
      await apiClient.patch(`/appointments/${selectedCancelAptId}`, payload);
      
      // Cleanup State
      setIsCancelModalOpen(false);
      setSelectedCancelAptId(null);
      setCancellationReason('');
      
      fetchAppointments();
      alert('Reservasi berhasil dibatalkan dan catatan telah disimpan.');
    } catch (error: any) {
      console.error('Gagal membatalkan reservasi:', error);
      alert(error.response?.data?.message || 'Gagal memproses pembatalan.');
    }
  };

  const filteredAppointments = appointments.filter((apt: any) => {
    const matchStatus = !selectedStatusFilter || apt.status === selectedStatusFilter;
    const matchSearch = !searchQuery || 
      apt.patient?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient?.nik?.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Jadwal Reservasi Pasien</h1>
        <p className="text-slate-600">Kelola dan perbarui status reservasi pasien yang terjadwal dengan Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {/* AREA PANEL KONTROL */}
        <div className="mb-6 flex items-center gap-4 flex-wrap justify-between">
          <div className="w-full md:w-72 relative">
            <input 
              type="text" 
              placeholder="Cari nama atau NIK pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="relative min-w-[240px] w-full md:w-auto">
            <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest z-10">
              Status Sesi
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="appearance-none w-full md:min-w-[240px] bg-slate-50 border border-slate-200 text-zinc-700 text-sm font-semibold rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative z-0"
            >
              <option value="">Semua Status</option>
              <option value="BOOKED">Menunggu Konfirmasi</option>
              <option value="CONFIRMED">Terkonfirmasi</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 z-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* TABEL */}
        {isLoadingAppointments ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 italic text-sm">
            Tidak ada jadwal reservasi yang sesuai kriteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-5 pl-8">Nama Pasien</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Waktu</th>
                  <th className="p-5">No. Identitas</th>
                  <th className="p-5">Keluhan</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right pr-8">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-zinc-900 bg-white">
                {filteredAppointments.map((apt: any) => {
                  const statusClasses: Record<string, string> = {
                    'BOOKED': 'bg-amber-50 text-amber-600 border-amber-200',
                    'CONFIRMED': 'bg-blue-50 text-blue-600 border-blue-200',
                    'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
                    'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                  };
                  const statusLabel: Record<string, string> = {
                    'BOOKED': 'Menunggu Konfirmasi',
                    'CONFIRMED': 'Terkonfirmasi',
                    'CANCELLED': 'Dibatalkan',
                    'COMPLETED': 'Selesai',
                  };

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 pl-8 font-extrabold text-zinc-950 uppercase group-hover:text-indigo-600 transition-colors">
                        {apt.patient?.user?.name || '-'}
                      </td>
                      <td className="p-5 font-bold text-slate-700">
                        {new Date(apt.scheduledAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })}
                      </td>
                      <td className="p-5">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-black font-mono rounded-md tracking-widest">
                          {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-5 font-mono text-xs font-bold text-slate-400">{apt.patient?.nik || '-'}</td>
                      <td className="p-5 text-xs text-slate-600 max-w-xs truncate">{apt.notes || '-'}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${statusClasses[apt.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {statusLabel[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === 'BOOKED' && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'CONFIRMED')}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                title="Konfirmasi"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCancelAptId(apt.id);
                                  setIsCancelModalOpen(true);
                                }}
                                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                title="Batalkan"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL INPUT CATATAN PEMBATALAN */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-rose-50/30">
              <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Konfirmasi Pembatalan</h3>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Berikan alasan medis atau operasional terkait pembatalan ini.</p>
            </div>
            <form onSubmit={handleDoctorCancelAppointment}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Alasan Catatan Pembatalan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Contoh: Harus menghadiri operasi darurat / Pasien dirujuk ke faskes lain."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none font-medium text-zinc-800"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setSelectedCancelAptId(null);
                    setCancellationReason('');
                  }}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-xs uppercase tracking-widest"
                >
                  Kembali
                </button>
                <button type="submit" className="px-4 py-2.5 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 transition-colors text-xs uppercase tracking-widest shadow-lg shadow-rose-600/10">
                  Konfirmasi Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}