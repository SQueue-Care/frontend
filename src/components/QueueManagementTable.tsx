// src/components/QueueManagementTable.tsx

export default function QueueManagementTable() {
  // Data simulasi antrean pasien
  const queueData = [
    { id: 'A-14', patient: 'Bambang Sudibyo', poli: 'Poli Umum', waitTime: '45 Min', status: 'critical', statusText: 'Menunggu Lama' },
    { id: 'C-02', patient: 'Siti Aminah', poli: 'Poli Anak', waitTime: '15 Min', status: 'waiting', statusText: 'Menunggu' },
    { id: 'B-08', patient: 'Budi Santoso', poli: 'Poli Gigi', waitTime: '5 Min', status: 'in-service', statusText: 'Diperiksa' },
    { id: 'A-15', patient: 'Ratna Sari', poli: 'Poli Umum', waitTime: '2 Min', status: 'waiting', statusText: 'Menunggu' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header Tabel & Alert Panel */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-zinc-950 font-['Manrope'] text-lg">Live Queue Control</h3>
          <p className="text-slate-500 text-sm font-medium">Manajemen manual antrean pasien saat ini.</p>
        </div>
        
        {/* Alert Notification Panel (Aktivitas 7) */}
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="text-rose-700 text-xs font-bold">1 Pasien Menunggu: 30 Menit</span>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="p-4 pl-6">No. Antrean</th>
              <th className="p-4">Nama Pasien</th>
              <th className="p-4">Poliklinik</th>
              <th className="p-4">Waktu Tunggu</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Aksi Manual</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-zinc-900 divide-y divide-slate-100">
            {queueData.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-extrabold rounded-lg font-mono">
                    {item.id}
                  </span>
                </td>
                <td className="p-4">{item.patient}</td>
                <td className="p-4 text-slate-500">{item.poli}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.status === 'critical' ? 'text-rose-600' : 'text-slate-600'}`}>
                    {item.waitTime}
                  </span>
                </td>
                <td className="p-4">
                  {/* Indikator Status */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                    item.status === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    item.status === 'in-service' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {item.status === 'critical' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    {item.statusText}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  {/* Manual Queue Adjustment Interface (Aktivitas 8) */}
                  <div className="flex justify-end gap-2">
                    {item.status !== 'in-service' && (
                      <button className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-teal-100 hover:border-teal-600">
                        Panggil
                      </button>
                    )}
                    {item.status === 'in-service' && (
                      <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-emerald-100 hover:border-emerald-600">
                        Selesai
                      </button>
                    )}
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Lewati / Hapus">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}