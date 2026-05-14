import { useEffect } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore'; 
import { QueueStatus } from '../lib/types';
import apiClient from '../lib/apiClient';
import {
  getAllowedQueueTransitions,
  isValidQueueTransition,
  QUEUE_TRANSITION_CLASSES,
  QUEUE_TRANSITION_LABELS,
  QUEUE_TRANSITION_TITLES,
} from '../lib/queueStateMachine';

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
  const { searchQuery } = useDashboardFilterStore();

  useEffect(() => {
    // FIX: Ambil semua antrean agar yang masih WAITING dari hari sebelumnya tetap terlihat
    fetchQueues(); 
  }, [fetchQueues]);

  const handleUpdateStatus = async (id: string, currentStatus: QueueStatus, newStatus: QueueStatus) => {
    if (!isValidQueueTransition(currentStatus, newStatus)) {
      alert('Transisi status tidak valid.');
      return;
    }

    try {
      await apiClient.patch(`/queues/${id}/status`, { status: newStatus });
      fetchQueues(); // Refresh data tanpa filter tanggal
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengubah status antrean.');
    }
  };

  const filteredQueues = queues.filter((item) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    
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
      return <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">{queues.length === 0 ? "Tidak ada antrean terdeteksi." : "Antrean tidak ditemukan."}</td></tr>;
    }

    // Urutkan: Aktif di atas, yang Selesai/Batal di bawah
    const activeStatuses = [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_PROGRESS];
    const sortedQueues = [...filteredQueues].sort((a, b) => {
      const aActive = activeStatuses.includes(a.status) ? 0 : 1;
      const bActive = activeStatuses.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime();
    });

    return sortedQueues.map((item) => (
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
    ));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">Manajemen Antrean</h1>
          <p className="text-slate-500 text-sm font-medium">Kelola dan perbarui status antrean aktif (Layanan Real-time).</p>
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
