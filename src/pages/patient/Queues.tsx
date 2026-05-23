import { useOutletContext } from 'react-router-dom'
import { useQueueStore } from '../../store/queueStore'
import type { PatientPortalContext } from './Portal'

const QUEUE_STATUS_STYLES: Record<string, string> = {
  WAITING:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  CALLED:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  IN_PROGRESS:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  DONE: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  SKIPPED:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  CANCELLED:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
}

const QUEUE_STATUS_LABELS: Record<string, string> = {
  WAITING: 'Menunggu',
  CALLED: 'Giliran Anda',
  IN_PROGRESS: 'Diperiksa',
  DONE: 'Selesai',
  SKIPPED: 'Dilewati',
  CANCELLED: 'Dibatalkan',
}

export default function PatientQueues() {
  const { openQueueDetail } = useOutletContext<PatientPortalContext>()
  const { patientHistory, isLoadingTable } = useQueueStore()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700 ease-out">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold tracking-tighter text-zinc-950 dark:text-white">
          Riwayat Kunjungan
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Arsip rekam jejak pengambilan nomor antrean klinik Anda.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                <th className="p-6 pl-8">Layanan Medis</th>
                <th className="p-6">Tgl. Kunjungan</th>
                <th className="p-6">Jam Kunjungan</th>
                <th className="p-6">Catatan Keluhan</th>
                <th className="p-6 pr-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
              {isLoadingTable ? (
                <tr>
                  <td
                    colSpan={5}
                    className="animate-pulse p-16 text-center text-xs font-bold tracking-widest text-teal-700 uppercase dark:text-teal-500"
                  >
                    Menyinkronkan riwayat...
                  </td>
                </tr>
              ) : patientHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500"
                  >
                    Tidak ada riwayat kunjungan yang terekam.
                  </td>
                </tr>
              ) : (
                patientHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                    onClick={() => openQueueDetail(item)}
                  >
                    <td className="p-6 pl-8 align-top">
                      <div className="mb-1 text-base font-extrabold text-zinc-900 dark:text-white">
                        {item?.department?.name ?? 'Poliklinik'}
                      </div>
                      <div className="text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                        {item?.doctor?.user?.name ?? 'Dokter belum ditentukan'}
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <div className="font-extrabold text-zinc-900 dark:text-white">
                        {new Date(item.queueDate).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                        {new Date(item.queueDate).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <div
                        className="line-clamp-3 max-w-[200px] text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400"
                        title={item.notes ?? undefined}
                      >
                        {item.notes ?? (
                          <span className="text-slate-400 italic dark:text-slate-500">
                            Tidak ada catatan.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 pr-8 text-right align-top">
                      <span
                        className={`inline-flex min-w-[120px] items-center justify-center rounded-lg border px-3.5 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${QUEUE_STATUS_STYLES[item.status] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}
                      >
                        {QUEUE_STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
