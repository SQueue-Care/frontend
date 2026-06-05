import { useWaitTimeCountdown } from '../../hooks/useWaitTimeCountdown'
import {
  formatPeopleAheadSentence,
  formatServingLabel,
  formatWaitMinutesSentence,
  getPatientQueueStatus,
} from '../../lib/patientQueueUi'
import { getQueueWaitingAhead } from '../../lib/waitTimeEstimate'
import type { Queue, WaitTimeEstimate } from '../../lib/types'

interface PatientQueueSummaryProps {
  queue: Queue
  liveEstimate?: WaitTimeEstimate | null
  className?: string
}

function StatCard({
  label,
  value,
  description,
  highlight = false,
}: {
  label: string
  value: string
  description?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        highlight
          ? 'border-teal-300 bg-white shadow-sm dark:border-teal-700 dark:bg-[#131314]'
          : 'border-slate-200/80 bg-white/90 dark:border-zinc-700 dark:bg-[#131314]/80'
      }`}
    >
      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 font-['Manrope'] text-3xl font-bold tabular-nums tracking-tight sm:text-4xl ${
          highlight ? 'text-teal-700 dark:text-teal-400' : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </p>
      {description && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">{description}</p>
      )}
    </div>
  )
}

export default function PatientQueueSummary({
  queue,
  liveEstimate,
  className = '',
}: PatientQueueSummaryProps) {
  const statusInfo = getPatientQueueStatus(queue.status)
  const isWaiting = queue.status === 'WAITING'
  const isActive = queue.status === 'CALLED' || queue.status === 'IN_PROGRESS'
  const { context, countdown } = useWaitTimeCountdown(queue, liveEstimate)
  const peopleAhead = getQueueWaitingAhead(queue, liveEstimate)

  const toneShell =
    statusInfo.tone === 'active'
      ? 'border-amber-200 bg-amber-50/90 dark:border-amber-900/50 dark:bg-[#1e1f20]'
      : statusInfo.tone === 'waiting'
        ? 'border-teal-200 bg-teal-50/90 dark:border-teal-900/40 dark:bg-[#1e1f20]'
        : 'border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#1e1f20]'

  const doctorName = queue.doctor?.user?.name ?? 'Belum ditentukan'
  const departmentName = queue.department?.name ?? 'Poliklinik'

  return (
    <section className={`overflow-hidden rounded-3xl border-2 p-5 sm:p-6 ${toneShell} ${className}`}>
      <div className="flex flex-wrap items-start gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            statusInfo.tone === 'active'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
              : statusInfo.tone === 'waiting'
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200'
                : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
          }`}
        >
          {isWaiting && (
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          )}
          {statusInfo.label}
        </span>
        <span className="text-sm text-slate-500 dark:text-zinc-400">
          {new Date(queue.queueDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      <div className="mt-4">
        <h2 className="font-['Manrope'] text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">
          {departmentName}
        </h2>
        <p className="mt-1 text-base text-slate-600 dark:text-zinc-400">Dokter: {doctorName}</p>
      </div>

      {statusInfo.hint && (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-base leading-relaxed ${
            isActive
              ? 'bg-amber-100/80 text-amber-950 dark:bg-amber-500/15 dark:text-amber-100'
              : 'bg-white/70 text-slate-700 dark:bg-[#131314]/60 dark:text-zinc-300'
          }`}
        >
          {statusInfo.hint}
        </p>
      )}

      <div className="mt-6 rounded-2xl border-2 border-teal-300 bg-white px-4 py-6 text-center shadow-sm dark:border-teal-800 dark:bg-[#131314]">
        <p className="text-base font-medium text-slate-600 dark:text-zinc-400">Nomor antrean Anda</p>
        <p
          className="mt-2 font-['Manrope'] text-6xl font-bold tabular-nums tracking-tight text-teal-700 sm:text-7xl dark:text-teal-400"
          aria-label={`Nomor antrean ${queue.queueNumber}`}
        >
          {queue.queueNumber}
        </p>
      </div>

      {isWaiting && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Sedang dilayani"
              value={formatServingLabel(queue.currentServingNumber)}
              description={
                queue.currentServingNumber != null
                  ? 'Nomor yang dipanggil sekarang'
                  : 'Belum ada pasien dipanggil'
              }
            />
            <StatCard
              label="Orang di depan Anda"
              value={peopleAhead != null ? String(peopleAhead) : '—'}
              description={formatPeopleAheadSentence(peopleAhead)}
              highlight
            />
            <StatCard
              label="Perkiraan dipanggil"
              value={context?.targetLabel ?? '—'}
              description={
                context
                  ? countdown?.isOverdue
                    ? 'Lebih lama dari perkiraan — mohon tetap menunggu'
                    : `${formatWaitMinutesSentence(context.minutes)} · pukul ${context.targetLabel} WIB`
                  : 'Menghitung perkiraan waktu...'
              }
            />
          </div>

          {context && (
            <div className="mt-4 rounded-2xl border border-teal-200 bg-white/80 px-4 py-4 dark:border-teal-900/40 dark:bg-[#131314]/60">
              <p className="text-base leading-relaxed text-slate-700 dark:text-zinc-300">
                {formatPeopleAheadSentence(peopleAhead)}{' '}
                {countdown?.isOverdue ? (
                  <>
                    Perkiraan waktu sudah lewat — antrean sedang ramai. Tetap di ruang tunggu, petugas
                    akan memanggil nomor Anda.
                  </>
                ) : (
                  <>
                    Perkiraan dipanggil pukul{' '}
                    <strong className="text-teal-800 dark:text-teal-300">{context.targetLabel} WIB</strong>
                    {' '}({formatWaitMinutesSentence(context.minutes)}).
                  </>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {isActive && queue.currentServingNumber != null && (
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-zinc-400">
          Antrean yang sedang dilayani: nomor{' '}
          <strong className="font-['Manrope'] tabular-nums font-bold text-base tracking-tight">{queue.currentServingNumber}</strong>
        </p>
      )}
    </section>
  )
}
