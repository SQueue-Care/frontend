import type { PatientMedicalProfile, Queue } from '../../lib/types'
import { QueueStatus } from '../../lib/types'
import {
  formatAgeLabel,
  formatDateId,
  formatGender,
  getPatientInitials,
} from '../../lib/patientUtils'
import {
  getAllowedQueueTransitions,
  QUEUE_TRANSITION_CLASSES,
  QUEUE_TRANSITION_LABELS,
  QUEUE_TRANSITION_TITLES,
} from '../../lib/queueStateMachine'

interface DoctorActivePatientPanelProps {
  queue: Queue
  medicalProfile: PatientMedicalProfile | null
  isLoadingProfile: boolean
  hasBlockingPatient: boolean
  onUpdateStatus: (queueId: string, currentStatus: QueueStatus, nextStatus: QueueStatus) => void
  onOpenNotes: () => void
  onOpenCdss: () => void
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 transition-colors dark:border-zinc-800 bg-slate-50/80 transition-colors dark:bg-[#131314]/80 p-3">
      <p className="mb-0.5 text-[10px] tracking-wider text-slate-400 transition-colors dark:text-zinc-500 uppercase">
        {label}
      </p>
      <p className="text-sm text-zinc-900 transition-colors dark:text-zinc-100">{value}</p>
    </div>
  )
}

export default function DoctorActivePatientPanel({
  queue,
  medicalProfile,
  isLoadingProfile,
  hasBlockingPatient,
  onUpdateStatus,
  onOpenNotes,
  onOpenCdss,
}: DoctorActivePatientPanelProps) {
  const patient = medicalProfile?.patient ?? queue.patient
  const name = patient?.user?.name ?? 'Pasien'
  const allergies = patient?.allergies?.trim()
  const statusLabel =
    queue.status === QueueStatus.CALLED
      ? 'Sedang Dipanggil'
      : queue.status === QueueStatus.IN_PROGRESS
        ? 'Sedang Diperiksa'
        : 'Aktif'

  const allowedTransitions = getAllowedQueueTransitions(queue.status).filter(
    (s) => s !== QueueStatus.CANCELLED && s !== QueueStatus.WAITING
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 transition-colors dark:border-indigo-800/50 bg-white transition-colors dark:bg-[#1e1f20] shadow-sm">
      <div className="relative border-b border-indigo-100 transition-colors dark:border-indigo-800/50 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-5 text-white">
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/15 text-2xl backdrop-blur-sm">
              {getPatientInitials(name)}
            </div>
            <div>
              <span className="mb-1 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] tracking-wide uppercase">
                {statusLabel}
              </span>
              <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight">{name}</h2>
              <p className="mt-0.5 text-sm text-indigo-100">
                {formatAgeLabel(patient?.birthDate)} · {formatGender(patient?.gender)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
            <p className="text-[10px] tracking-wider text-indigo-200 uppercase">
              No. Antrean
            </p>
            <p className="font-mono text-3xl">
              {queue.department?.code}-{queue.queueNumber}
            </p>
          </div>
        </div>
      </div>

      {allergies && (
        <div className="flex items-start gap-3 border-b border-rose-100 transition-colors dark:border-rose-500/20 bg-rose-50 transition-colors dark:bg-rose-500/10 px-6 py-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 transition-colors dark:text-rose-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <div>
            <p className="text-xs tracking-wide text-rose-700 transition-colors dark:text-rose-400 uppercase">Alergi</p>
            <p className="text-sm font-medium text-rose-800">{allergies}</p>
          </div>
        </div>
      )}

      <div className="p-6">
        {isLoadingProfile ? (
          <div className="mb-6 flex justify-center py-6">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Telepon" value={patient?.phone || '-'} />
            <DetailItem label="Golongan Darah" value={patient?.bloodType || '-'} />
            <DetailItem label="NIK" value={patient?.nik || '-'} />
            <DetailItem label="No. BPJS" value={patient?.bpjsNumber || '-'} />
            <DetailItem label="Tanggal Lahir" value={formatDateId(patient?.birthDate)} />
            <DetailItem label="Poli" value={queue.department?.name || '-'} />
          </div>
        )}

        {queue.notes?.trim() && (
          <div className="mb-6 rounded-xl border border-amber-100 transition-colors dark:border-amber-500/20 bg-amber-50/70 p-4">
            <p className="mb-1 text-[10px] tracking-wider text-amber-700 transition-colors dark:text-amber-400 uppercase">
              Keluhan / Catatan Kunjungan
            </p>
            <p className="text-sm whitespace-pre-wrap text-amber-950">{queue.notes}</p>
          </div>
        )}

        {hasBlockingPatient && queue.status === QueueStatus.WAITING && (
          <div className="mb-4 rounded-xl border border-amber-200 transition-colors dark:border-amber-500/20 bg-amber-50 transition-colors dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
            Selesaikan pasien saat ini terlebih dahulu sebelum menerima pasien baru.
          </div>
        )}

        {allowedTransitions.includes(QueueStatus.DONE) && (
          <div className="mb-4 rounded-xl border border-emerald-200 transition-colors dark:border-emerald-500/20 bg-emerald-50 transition-colors dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900">
            Setelah menandai <strong>Selesai</strong>, pasien akan diarahkan ke loket administrasi/kasir
            {queue.department?.adminCounter ? ` (${queue.department.adminCounter})` : ''} untuk pembayaran.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenCdss}
            className="rounded-lg border border-violet-200 bg-violet-50 transition-colors dark:bg-violet-900/20 px-4 py-2 text-xs text-violet-700 transition-colors hover:bg-violet-100"
          >
            Analisis CDSS
          </button>
          <button
            type="button"
            onClick={onOpenNotes}
            className="rounded-lg border border-amber-200 transition-colors dark:border-amber-500/20 bg-amber-50 transition-colors dark:bg-amber-500/10 px-4 py-2 text-xs text-amber-800 transition-colors hover:bg-amber-100"
          >
            Catatan Dokter
          </button>
          {allowedTransitions.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              onClick={() => onUpdateStatus(queue.id, queue.status, nextStatus)}
              className={QUEUE_TRANSITION_CLASSES[nextStatus]}
              title={QUEUE_TRANSITION_TITLES[nextStatus]}
            >
              {QUEUE_TRANSITION_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
