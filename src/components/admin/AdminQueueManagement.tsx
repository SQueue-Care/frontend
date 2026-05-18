// src/components/AdminQueueManagement.tsx
import { useState, useEffect } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useDepartmentStore } from '../store/departmentStore'; 
import { QueueStatus } from '../lib/types';
import apiClient from '../lib/apiClient';
import {
  getAllowedQueueTransitions,
  isValidQueueTransition,
  QUEUE_TRANSITION_CLASSES,
  QUEUE_TRANSITION_LABELS,
  QUEUE_TRANSITION_TITLES,
} from '../lib/queueStateMachine';

export default function AdminQueueManagement() {
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore();
  const { departments } = useDepartmentStore();

  // STATE BARU: Untuk Search Bar & Filter Antrean (Sama persis dengan Reservasi)
  const [queueSearchQuery, setQueueSearchQuery] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  useEffect(() => {
    fetchQueues(); 
  }, [fetchQueues]);

  const handleUpdateStatus = async (id: string, currentStatus: QueueStatus, newStatus: QueueStatus) => {
    if (!isValidQueueTransition(currentStatus, newStatus)) {
      alert('Transisi status tidak valid.');
      return;
    }

    try {
      await apiClient.patch(`/queues/${id}/status`, { status: newStatus });
      fetchQueues(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status antrean.');
    }
  };

  // LOGIKA PENYARINGAN DATA (Departemen, Status, & Teks Pencarian)
  const filteredQueues = queues.filter((item: any) => {
    const matchDept = !selectedDepartmentFilter || item.department?.id === selectedDepartmentFilter;
    const matchStatus = !selectedStatusFilter || item.status === selectedStatusFilter;
    const matchSearch = !queueSearchQuery || 
      item.patient?.user?.name?.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      `${item.department?.code}-${item.queueNumber}`.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      item.patient?.nik?.includes(queueSearchQuery);
      
    return matchDept && matchStatus && matchSearch;
  });

  // LOGIKA PENGURUTAN (Aktif di atas, Selesai/Batal di bawah)
  const activeStatuses = [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_PROGRESS];
  const sortedQueues = [...filteredQueues].sort((a, b) => {
    const aActive = activeStatuses.includes(a.status) ? 0 : 1;
    const bActive = activeStatuses.includes(b.status) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime();
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">
          Daftar Antrean Aktif
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Kelola dan perbarui status antrean aktif pasien secara real-time.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        
        {/* AREA FILTER & SEARCH (Identik dengan Reservasi) */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="w-full md:w-72 relative">
            <input 
              type="text" 
              placeholder="Cari nama, NIK, atau no antrean..."
              value={queueSearchQuery}
              onChange={(e) => setQueueSearchQuery(e.target.value)}
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
                Status Antrean
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-200 text-zinc-700 text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer relative z-0"
              >
                <option value="">Semua Status</option>
                <option value="WAITING">Menunggu</option>
                <option value="CALLED">Dipanggil</option>
                <option value="IN_PROGRESS">Diperiksa</option>
                <option value="DONE">Selesai</option>
                <option value="SKIPPED">Dilewati</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL DATA ANTREAN */}
        {isLoadingTable ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : errorTable ? (
          <div className="py-12 text-center text-rose-600 font-bold italic text-sm">{errorTable}</div>
        ) : sortedQueues.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic text-sm">
            {queueSearchQuery ? `Tidak ada antrean yang cocok dengan pencarian "${queueSearchQuery}"` : "Belum ada data antrean yang sesuai dengan kriteria filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-5 pl-8">No. Antrean</th>
                  <th className="p-5">Nama Pasien</th>
                  <th className="p-5">Dokter</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Waktu Tiba</th>
                  <th className="p-5">Departemen</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right pr-8">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-zinc-900">
                {sortedQueues.map((item: any) => {
                  const statusClasses: Record<string, string> = {
                    'WAITING': 'bg-slate-50 text-slate-600 border-slate-200',
                    'CALLED': 'bg-blue-50 text-blue-600 border-blue-200',
                    'IN_PROGRESS': 'bg-amber-50 text-amber-600 border-amber-200',
                    'DONE': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    'SKIPPED': 'bg-gray-50 text-gray-600 border-gray-200',
                    'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
                  };
                  const statusLabel: Record<string, string> = {
                    'WAITING': 'Menunggu',
                    'CALLED': 'Dipanggil',
                    'IN_PROGRESS': 'Diperiksa',
                    'DONE': 'Selesai',
                    'SKIPPED': 'Dilewati',
                    'CANCELLED': 'Dibatalkan',
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 pl-8">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-extrabold rounded-lg font-mono tracking-widest border border-slate-200">
                          {item.department?.code}-{item.queueNumber}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="font-extrabold text-zinc-950 uppercase group-hover:text-teal-600 transition-colors">
                          {item.patient?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">{item.doctor?.user?.name || '-'}</div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">
                          {new Date(item.queueDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-black font-mono rounded-md tracking-widest">
                          {new Date(item.checkInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">{item.department?.name || '-'}</div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border tracking-widest ${statusClasses[item.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {getAllowedQueueTransitions(item.status).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() => handleUpdateStatus(item.id, item.status, nextStatus)}
                              className={QUEUE_TRANSITION_CLASSES[nextStatus]}
                              title={QUEUE_TRANSITION_TITLES[nextStatus]}
                            >
                              {QUEUE_TRANSITION_LABELS[nextStatus]}
                            </button>
                          ))}
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
    </div>
  );
}