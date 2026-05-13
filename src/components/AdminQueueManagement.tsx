import { useState, useEffect } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore'; // Tambahan: Import store filter
import { QueueStatus } from '../lib/types';
import apiClient from '../lib/apiClient';

const statusStyles: Record<QueueStatus, { text: string; bg: string; border: string }> = {
  [QueueStatus.WAITING]: { text: 'Menunggu', bg: 'bg-slate-50', border: 'border-slate-200' },
  [QueueStatus.CALLED]: { text: 'Dipanggil', bg: 'bg-blue-50', border: 'border-blue-200' },
  [QueueStatus.IN_PROGRESS]: { text: 'Diperiksa', bg: 'bg-amber-50', border: 'border-amber-200' },
  [QueueStatus.DONE]: { text: 'Selesai', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  [QueueStatus.SKIPPED]: { text: 'Dilewati', bg: 'bg-gray-50', border: 'border-gray-200' },
  [QueueStatus.CANCELLED]: { text: 'Dibatalkan', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const StatusBadge = ({ status }: { status: QueueStatus }) => {
  const style = statusStyles[status] || statusStyles[QueueStatus.WAITING];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${style.bg} ${style.border} text-zinc-800`}>
      {style.text}
    </span>
  );
};

export default function AdminQueueManagement() {
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore();
  
  // SOLUSI: Tarik searchQuery dari state global
  const { searchQuery } = useDashboardFilterStore();

  useEffect(() => {
    fetchQueues({ date: new Date() });
  }, [fetchQueues]);

  const handleUpdateStatus = async (id: string, newStatus: QueueStatus) => {
    try {
      await apiClient.patch(`/queues/${id}/status`, { status: newStatus });
      fetchQueues({ date: new Date() }); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status antrean.');
    }
  };

  const filteredQueues = queues.filter((item) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    
    // Validasi opsional untuk mencegah error jika objek data tidak lengkap dari backend
    const patientName = item.patient?.user?.name || "";
    const departmentCode = item.department?.code || "";
    const queueNum = item.queueNumber || "";

    return (
      patientName.toLowerCase().includes(lowerQuery) ||
      `${departmentCode}-${queueNum}`.toLowerCase().includes(lowerQuery)
    );
  });

  const renderTableBody = () => {
    if (isLoadingTable) {
      return <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">Memuat data antrean...</td></tr>;
    }
    if (errorTable) {
      return <tr><td colSpan={6} className="p-8 text-center text-red-500 italic">{errorTable}</td></tr>;
    }
    if (filteredQueues.length === 0) {
      return <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">{queues.length === 0 ? "Tidak ada antrean hari ini." : "Antrean tidak ditemukan."}</td></tr>;
    }

    return filteredQueues.map((item) => (
      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
        <td className="p-4 pl-6">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-extrabold rounded-lg font-mono">
            {item.department?.code}-{item.queueNumber}
          </span>
        </td>
        <td className="p-4">
          <div className="font-bold text-zinc-900">{item.patient?.user?.name || '-'}</div>
        </td>
        <td className="p-4 text-slate-500">{item.department?.name || '-'}</td>
        <td className="p-4 text-slate-500">{item.doctor?.user?.name || '-'}</td>
        <td className="p-4"><StatusBadge status={item.status} /></td>
        <td className="p-4 pr-6 text-right">
          <div className="flex justify-end gap-2">
            {[QueueStatus.WAITING, QueueStatus.SKIPPED].includes(item.status) && (
              <button 
                onClick={() => handleUpdateStatus(item.id, QueueStatus.CALLED)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-blue-100 hover:border-blue-600"
              >
                Panggil
              </button>
            )}
            {item.status === QueueStatus.CALLED && (
              <button 
                onClick={() => handleUpdateStatus(item.id, QueueStatus.IN_PROGRESS)}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-amber-100 hover:border-amber-600"
              >
                Periksa
              </button>
            )}
             {item.status === QueueStatus.IN_PROGRESS && (
              <button 
                onClick={() => handleUpdateStatus(item.id, QueueStatus.DONE)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-emerald-100 hover:border-emerald-600"
              >
                Selesai
              </button>
            )}
            {[QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SKIPPED].includes(item.status) && (
              <button 
                onClick={() => handleUpdateStatus(item.id, QueueStatus.CANCELLED)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" 
                title="Batalkan Antrean"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
            {item.status === QueueStatus.CALLED && (
              <button 
                onClick={() => handleUpdateStatus(item.id, QueueStatus.SKIPPED)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-500 hover:text-white text-xs font-bold rounded-lg transition-colors" 
                title="Lewati Antrean"
              >
                Lewati
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">Manajemen Antrean</h1>
          <p className="text-slate-500 text-sm font-medium">Kelola dan perbarui status antrean pasien secara manual.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">No. Antrean</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Pasien</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Poliklinik</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dokter</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-zinc-900 bg-white">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}