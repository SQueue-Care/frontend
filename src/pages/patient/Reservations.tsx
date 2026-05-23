import { useOutletContext } from 'react-router-dom'
import { useQueueStore } from '../../store/queueStore'
import type { PatientPortalContext } from './Portal'

const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  BOOKED:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  CONFIRMED:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
  COMPLETED:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  CANCELLED:
    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
}

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  BOOKED: 'Menunggu Konfirmasi',
  CONFIRMED: 'Terkonfirmasi',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

export default function PatientReservations() {
  const { openAppointmentDetail } = useOutletContext<PatientPortalContext>()
  const { patientAppointments, isLoadingAppointments } = useQueueStore()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700 ease-out">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold tracking-tighter text-zinc-950 dark:text-white">
          Jadwal Reservasi
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Daftar pemesanan sesi konsultasi medis Anda yang telah terjadwal.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                <th className="p-6 pl-8">Layanan & Dokter</th>
                <th className="p-6">Waktu Kunjungan</th>
                <th className="p-6">Catatan Keluhan</th>
                <th className="p-6">Tgl. Daftar</th>
                <th className="p-6 pr-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
              {isLoadingAppointments ? (
                <tr>
                  <td
                    colSpan={5}
                    className="animate-pulse p-16 text-center text-xs font-bold tracking-widest text-teal-700 uppercase dark:text-teal-500"
                  >
                    Menyinkronkan reservasi...
                  </td>
                </tr>
              ) : patientAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500"
                  >
                    Tidak ada jadwal reservasi aktif saat ini.
                  </td>
                </tr>
              ) : (
                patientAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="group cursor-pointer transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                    onClick={() => openAppointmentDetail(apt)}
                  >
                    <td className="p-6 pl-8 align-top">
                      <div className="mb-1 text-base font-extrabold text-zinc-900 dark:text-white">
                        {apt?.department?.name ?? 'Poliklinik'}
                      </div>
                      <div className="text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                        {apt?.doctor?.user?.name ?? 'Dokter belum ditentukan'}
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <div className="mb-1 font-extrabold text-zinc-900 dark:text-white">
                        {new Date(apt.scheduledAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                        Sesi:{' '}
                        {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <div
                        className="line-clamp-3 max-w-[220px] text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400"
                        title={apt.notes ?? undefined}
                      >
                        {apt.notes ?? (
                          <span className="text-slate-400 italic dark:text-slate-500">
                            Tidak ada catatan.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 align-top">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {apt.createdAt ? new Date(apt.createdAt).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </td>
                    <td className="p-6 pr-8 text-right align-top">
                      <span
                        className={`inline-flex rounded-lg border px-3.5 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${APPOINTMENT_STATUS_STYLES[apt.status] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}
                      >
                        {APPOINTMENT_STATUS_LABELS[apt.status] ?? apt.status}
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
