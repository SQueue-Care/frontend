import { useEffect } from 'react';
import { useQueueStore, type Queue } from '../store/queueStore';
import { QueueStatus } from '../lib/types';

// Helper untuk styling status
const statusStyles: Record<QueueStatus, { text: string; bg: string; border: string; icon?: React.ReactNode }> = {
  [QueueStatus.WAITING]: { text: 'Menunggu', bg: 'bg-slate-50', border: 'border-slate-200' },
  [QueueStatus.CALLED]: { text: 'Dipanggil', bg: 'bg-blue-50', border: 'border-blue-200' },
  [QueueStatus.IN_PROGRESS]: { text: 'Diperiksa', bg: 'bg-amber-50', border: 'border-amber-200' },
  [QueueStatus.DONE]: { text: 'Selesai', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  [QueueStatus.SKIPPED]: { text: 'Dilewati', bg: 'bg-gray-50', border: 'border-gray-200' },
  [QueueStatus.CANCELLED]: { text: 'Dibatalkan', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const StatusBadge = ({ status }: { status: QueueStatus }) => {
  const style = statusStyles[status] || statusStyles.WAITING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${style.bg} ${style.border} text-zinc-800`}>
      {style.text}
    </span>
  );
};

export default function QueueManagementTable() {
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore();

  useEffect(() => {
    // Ambil semua antrean untuk hari ini saat komponen dimuat
    fetchQueues({ date: new Date() });
  }, [fetchQueues]);

  const renderTableBody = () => {
    if (isLoadingTable) {
      return (
        <tr>
          <td colSpan={6} className="p-8 text-center text-slate-400 italic">
            Memuat data antrean...
          </td>
        </tr>
      );
    }

    if (errorTable) {
      return (
        <tr>
          <td colSpan={6} className="p-8 text-center text-red-500 italic">
            {errorTable}
          </td>
        </tr>
      );
    }

    if (queues.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="p-8 text-center text-slate-400 italic">
            Tidak ada antrean untuk hari ini.
          </td>
        </tr>
      );
    }

    return queues.map((item) => (
      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
        <td className="p-4 pl-6">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-extrabold rounded-lg font-mono">
            {item.department.code}-{item.queueNumber}
          </span>
        </td>
        <td className="p-4">{item.patient.user.name}</td>
        <td className="p-4 text-slate-500">{item.department.name}</td>
        <td className="p-4 text-slate-500">{item.doctor?.user.name || '-'}</td>
        <td className="p-4">
          <StatusBadge status={item.status} />
        </td>
        <td className="p-4 pr-6 text-right">
          <div className="flex justify-end gap-2">
            {[QueueStatus.WAITING, QueueStatus.SKIPPED].includes(item.status) && (
              <button className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-teal-100 hover:border-teal-600">
                Panggil
              </button>
            )}
            {item.status === QueueStatus.CALLED && (
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-blue-100 hover:border-blue-600">
                Layani
              </button>
            )}
             {item.status === QueueStatus.IN_PROGRESS && (
              <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-emerald-100 hover:border-emerald-600">
                Selesai
              </button>
            )}
            {[QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SKIPPED].includes(item.status) && (
              <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Lewati / Batalkan">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-950 font-['Manrope'] text-lg">Live Queue Control</h3>
          <p className="text-slate-500 text-sm font-medium">Manajemen antrean pasien hari ini.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">No. Antrean</th>
              <th className="p-4">Nama Pasien</th>
              <th className="p-4">Poliklinik</th>
              <th className="p-4">Dokter</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Aksi Manual</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-zinc-900 divide-y divide-slate-100">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  );
}