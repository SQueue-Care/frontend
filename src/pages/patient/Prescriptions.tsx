import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorNotesDisplay from '../../components/shared/DoctorNotesDisplay'
import { hasDoctorNotes } from '../../lib/doctorNotes'
import { useQueueStore } from '../../store/queueStore'

export default function PatientPrescriptions() {
  const navigate = useNavigate()
  const { patientHistory, isLoadingTable } = useQueueStore()

  const visitsWithNotes = useMemo(
    () =>
      patientHistory.filter(
        (q) => q.status === 'DONE' && hasDoctorNotes(q.doctorNotes)
      ),
    [patientHistory]
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
        Ringkasan diagnosis, instruksi obat, dan saran dokter dari kunjungan yang telah selesai.
      </p>

      {isLoadingTable ? (
        <div className="py-16 text-center text-xs font-bold tracking-widest text-teal-700 uppercase dark:text-teal-500">
          Memuat data resep...
        </div>
      ) : visitsWithNotes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Belum ada catatan dokter atau instruksi obat dari kunjungan selesai.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visitsWithNotes.map((visit) => (
            <li
              key={visit.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
                    {visit.department?.name ?? 'Poliklinik'}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {visit.doctor?.user?.name ?? 'Dokter'} ·{' '}
                    {new Date(visit.queueDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/portal/queues/${visit.id}`)}
                  className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
                >
                  Detail Kunjungan
                </button>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
                <DoctorNotesDisplay doctorNotes={visit.doctorNotes} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
