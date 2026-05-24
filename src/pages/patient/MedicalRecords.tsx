import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorNotesDisplay from '../../components/shared/DoctorNotesDisplay'
import { hasDoctorNotes } from '../../lib/doctorNotes'
import type { Queue } from '../../lib/types'
import { useQueueStore } from '../../store/queueStore'

function formatVisitDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function VisitSummary({
  visit,
  hasNotes,
  expanded,
}: {
  visit: Queue
  hasNotes: boolean
  expanded: boolean
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2 className="font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
          {visit.department?.name ?? 'Poliklinik'}
        </h2>
        {hasNotes && (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-teal-700 uppercase dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400">
            Ada Catatan
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {visit.doctor?.user?.name ?? 'Dokter'}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {formatVisitDate(visit.queueDate)}
      </p>
      {visit.doctorNotes?.diagnosis?.trim() && !expanded && (
        <p className="mt-2 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-600 dark:text-slate-300">Diagnosis: </span>
          {visit.doctorNotes.diagnosis}
        </p>
      )}
    </div>
  )
}

function MedicalRecordCard({ visit }: { visit: Queue }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const hasNotes = hasDoctorNotes(visit.doctorNotes)

  return (
    <li className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
        aria-expanded={expanded}
      >
        <VisitSummary visit={visit} hasNotes={hasNotes} expanded={expanded} />
        <span
          className={`mt-1 shrink-0 text-slate-400 transition-transform duration-200 dark:text-zinc-500 ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-6 pt-4 pb-6 dark:border-zinc-800">
          <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                Nomor Antrean
              </dt>
              <dd className="font-bold text-zinc-800 dark:text-zinc-200">#{visit.queueNumber}</dd>
            </div>
          </dl>

          {hasNotes ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
              <p className="mb-3 text-[10px] font-black tracking-widest text-amber-700 uppercase dark:text-amber-500">
                Rekam Medis Kunjungan
              </p>
              <DoctorNotesDisplay doctorNotes={visit.doctorNotes} />
            </div>
          ) : (
            <p className="mb-4 text-sm leading-relaxed text-slate-500 italic dark:text-slate-400">
              Kunjungan selesai. Belum ada catatan diagnosis atau resep dari dokter.
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate(`/portal/queues/${visit.id}`)}
            className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-black text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
          >
            Lihat Detail Kunjungan
          </button>
        </div>
      )}
    </li>
  )
}

export default function PatientMedicalRecords() {
  const { patientHistory, isLoadingTable } = useQueueStore()

  const completedVisits = useMemo(
    () =>
      patientHistory
        .filter((q) => q.status === 'DONE')
        .sort((a, b) => new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime()),
    [patientHistory]
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
        Riwayat rekam medis dari kunjungan yang telah selesai, termasuk diagnosis, instruksi
        obat, dan saran dokter bila tersedia.
      </p>

      {isLoadingTable ? (
        <div className="py-16 text-center text-xs font-bold tracking-widest text-teal-700 uppercase dark:text-teal-500">
          Memuat rekam medis...
        </div>
      ) : completedVisits.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {completedVisits.map((visit) => (
            <MedicalRecordCard key={visit.id} visit={visit} />
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <p className="font-medium text-slate-500 dark:text-slate-400">
        Belum ada rekam medis. Rekam medis akan muncul setelah kunjungan Anda selesai diperiksa
        dokter.
      </p>
    </div>
  )
}
