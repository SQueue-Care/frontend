// src/components/AdminAppointmentManagement.tsx
import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';
import { useDepartmentStore } from '../../store/departmentStore';

export default function AdminAppointmentManagement() {
  const { departments } = useDepartmentStore();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  
  // State untuk Filter & Search
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  
  // State untuk Modal Detail
  const [isAptDetailModalOpen, setIsAptDetailModalOpen] = useState(false);
  const [selectedAptDetail, setSelectedAptDetail] = useState<any>(null);

  // Ambil Data Reservasi
  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const response = await apiClient.get('/appointments');
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
  }, []);

  // Fungsi Pembaruan Status & Catatan Pembatalan
  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const payload: any = { status: newStatus };
      
      if (newStatus === 'CANCELLED') {
        const reason = prompt('Masukkan alasan pembatalan reservasi pasien:');
        if (reason === null) return; 
        if (reason.trim() === '') {
          alert('Pembatalan dibatalkan. Alasan pembatalan wajib diisi secara jelas.');
          return;
        }
        payload.cancellationReason = reason;
      }

      await apiClient.patch(`/appointments/${appointmentId}`, payload);
      fetchAppointments();
      alert(`Status reservasi berhasil diperbarui menjadi ${newStatus}.`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status appointment.');
    }
  };

  // Logika Penyaringan Data
  const filteredAppointments = appointments.filter((apt: any) => {
    const matchDept = !selectedDepartmentFilter || apt.department?.id === selectedDepartmentFilter;
    const matchStatus = !selectedStatusFilter || apt.status === selectedStatusFilter;
    const matchSearch = !appointmentSearchQuery || 
      apt.patient?.user?.name?.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
      apt.patient?.nik?.includes(appointmentSearchQuery);
    return matchDept && matchStatus && matchSearch;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">
          Daftar Reservasi Pasien
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Kelola dan perbarui status reservasi pasien di seluruh sistem RS Ethereal.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        
        {/* AREA FILTER & SEARCH */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="w-full md:w-72 relative">
            <input 
              type="text" 
              placeholder="Cari nama pasien atau NIK..."
              value={appointmentSearchQuery}
              onChange={(e) => setAppointmentSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-zinc-800"
            />
            <div className="absolute right-3 top-3.5 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative min-w-[200px]">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest z-10">
                Filter Departemen
              </label>
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-200 text-zinc-700 text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer relative z-0"
              >
                <option value="">Semua Departemen</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="relative min-w-[200px]">
              <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest z-10">
                Status Reservasi
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-200 text-zinc-700 text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer relative z-0"
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
        </div>

        {/* TABEL DATA */}
        {isLoadingAppointments ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic text-sm">
            {appointmentSearchQuery ? `Tidak ada reservasi yang cocok dengan pencarian "${appointmentSearchQuery}"` : "Belum ada data reservasi yang sesuai dengan kriteria filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-5 pl-8">Nama Pasien</th>
                  <th className="p-5">Dokter</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Waktu</th>
                  <th className="p-5">No. Identitas</th>
                  <th className="p-5">Departemen</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right pr-8">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-zinc-900">
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
                    <tr 
                      key={apt.id} 
                      onClick={() => {
                        setSelectedAptDetail(apt);
                        setIsAptDetailModalOpen(true);
                      }}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="p-5 pl-8">
                        <div className="font-extrabold text-zinc-950 uppercase group-hover:text-teal-600 transition-colors">
                          {apt.patient?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">{apt.doctor?.user?.name || '-'}</div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">
                          {new Date(apt.scheduledAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-black font-mono rounded-md tracking-widest">
                          {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="font-mono text-xs font-bold text-slate-400">{apt.patient?.nik || '-'}</div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">{apt.department?.name || '-'}</div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${statusClasses[apt.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {statusLabel[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
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
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'CANCELLED')}
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

      {/* CARD DETAIL RESERVASI MODAL */}
      {isAptDetailModalOpen && selectedAptDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Detail Reservasi</h3>
                <p className="text-teal-600 font-mono text-xs font-bold mt-0.5">ID: {selectedAptDetail.id?.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => {
                  setIsAptDetailModalOpen(false);
                  setSelectedAptDetail(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Informasi Pasien */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Pasien</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-extrabold text-zinc-950 text-base uppercase">{selectedAptDetail.patient?.user?.name || '-'}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">NIK: <span className="font-mono font-bold text-slate-700">{selectedAptDetail.patient?.nik || '-'}</span></div>
                  <div className="text-xs text-slate-500 font-medium">BPJS: <span className="font-mono font-bold text-slate-700">{selectedAptDetail.patient?.bpjsNumber || 'Tidak Ada (Mandiri)'}</span></div>
                </div>
              </div>

              {/* Detail Sesi Medis */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alokasi Medis</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Dokter Spesialis</span>
                    <span className="text-xs font-bold text-zinc-900">{selectedAptDetail.doctor?.user?.name || '-'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Poliklinik</span>
                    <span className="text-xs font-bold text-zinc-900">{selectedAptDetail.department?.name || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Waktu Kunjungan */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Kunjungan</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Tanggal</span>
                    <span className="text-xs font-bold text-zinc-950">
                      {new Date(selectedAptDetail.scheduledAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Jam Sesi</span>
                    <span className="text-xs font-bold text-teal-600 font-mono tracking-wider">
                      {new Date(selectedAptDetail.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Otorisasi Konfirmasi & Pembatalan */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Otorisasi Konfirmasi</p>
                {['CONFIRMED', 'COMPLETED'].includes(selectedAptDetail.status) ? (
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
                    <span className="block text-[9px] font-black text-teal-600/70 uppercase tracking-wider mb-1">Dikonfirmasi Oleh</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-950 uppercase">
                        {selectedAptDetail.confirmedBy?.name || selectedAptDetail.doctor?.user?.name || 'Administrator'}
                      </span>
                      <span className={`px-2 py-0.5 text-white font-mono font-black text-[9px] rounded uppercase tracking-widest ${
                        (selectedAptDetail.confirmedBy?.role || 'DOCTOR') === 'DOCTOR' ? 'bg-purple-600' : 'bg-teal-600'
                      }`}>
                        {selectedAptDetail.confirmedBy?.role || 'DOCTOR'}
                      </span>
                    </div>
                  </div>
                ) : selectedAptDetail.status === 'CANCELLED' ? (
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-600 uppercase tracking-tight">Reservasi Dibatalkan</span>
                      <span className="px-2 py-0.5 bg-rose-600 text-white font-mono font-black text-[9px] rounded uppercase tracking-widest">
                        {selectedAptDetail.cancelledBy?.role || 'SYSTEM/ADMIN'}
                      </span>
                    </div>
                    {selectedAptDetail.cancellationReason ? (
                      <div className="pt-2 border-t border-rose-200/40 text-xs text-rose-700 font-medium bg-white/50 p-2 rounded-lg">
                        <span className="font-black block text-[9px] uppercase text-rose-500/80 mb-1 tracking-wider">Alasan Pembatalan:</span>
                        "{selectedAptDetail.cancellationReason}"
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-rose-200/40 text-xs text-rose-400 italic">
                        Tidak ada catatan alasan tertulis dari operator.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <span className="text-xs font-bold text-amber-600">Menunggu tindakan konfirmasi berkas oleh Admin atau Dokter terkait.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => {
                  setIsAptDetailModalOpen(false);
                  setSelectedAptDetail(null);
                }}
                className="px-5 py-2.5 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}