import { useWaitTimeCountdown } from '../../hooks/useWaitTimeCountdown'
import {
  formatWaitMinutesSentence,
  formatPeopleAheadSentence,
} from '../../lib/patientQueueUi'
import {
  formatWaitingAheadLabel,
  getKategoriBadgeClass,
  getQueueWaitingAhead,
} from '../../lib/waitTimeEstimate'
import type { Queue, WaitTimeEstimate } from '../../lib/types'

type WaitQueueInput = Pick<
  Queue,
  'status' | 'checkInAt' | 'createdAt' | 'estimatedWaitMinutes' | 'prediction' | 'doctorId' | 'patient' | 'waitingAhead'
> & {
  department?: { id: string } | null
}

interface QueueWaitTimePanelProps {
  queue: WaitQueueInput
  liveEstimate?: WaitTimeEstimate | null
  variant?: 'compact' | 'prominent'
  className?: string
}

export default function QueueWaitTimePanel({
  queue,
  liveEstimate,
  variant = 'prominent',
  className = '',
}: QueueWaitTimePanelProps) {
  const { context, countdown } = useWaitTimeCountdown(queue, liveEstimate)

  if (!context || !countdown) return null

  const isCompact = variant === 'compact'
  const isOverdue = countdown.isOverdue
  const peopleAhead = getQueueWaitingAhead(queue, liveEstimate)

  const shellClass = isOverdue
    ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
    : 'border-teal-200 bg-teal-50/80 dark:border-teal-500/30 dark:bg-teal-500/10'

  const accentClass = isOverdue
    ? 'text-amber-800 dark:text-amber-300'
    : 'text-teal-800 dark:text-teal-300'

  return (
    <div
      className={`rounded-2xl border-2 p-5 ${shellClass} ${isCompact ? 'p-4' : ''} ${className}`}
    >
      <div className={`flex ${isCompact ? 'flex-col gap-4' : 'items-start justify-between gap-6'}`}>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className={`text-base font-semibold ${accentClass}`}>
              {isOverdue ? 'Lebih lama dari perkiraan' : 'Perkiraan waktu dipanggil'}
            </p>
            {context.kategori && (
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getKategoriBadgeClass(context.kategori)}`}
              >
                {context.kategori}
              </span>
            )}
          </div>

          <p
            className={`font-mono font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 ${
              isCompact ? 'text-3xl' : 'text-5xl sm:text-6xl'
            }`}
          >
            {context.targetLabel}
            <span className="ml-2 text-lg font-sans font-normal text-slate-500 dark:text-zinc-400">WIB</span>
          </p>

          <p className={`mt-3 text-base leading-relaxed ${isOverdue ? 'text-amber-900 dark:text-amber-100' : 'text-slate-700 dark:text-zinc-300'}`}>
            {isOverdue
              ? 'Antrean sedang ramai. Mohon tetap menunggu di ruang tunggu — nomor Anda akan segera dipanggil.'
              : `${formatWaitMinutesSentence(context.minutes)}. Perkiraan dipanggil pukul ${context.targetLabel} WIB.`}
          </p>

          {!isCompact && peopleAhead != null && (
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              {formatPeopleAheadSentence(peopleAhead)}
            </p>
          )}
        </div>

        {!isCompact && (
          <div className="shrink-0 rounded-2xl border border-teal-200 bg-white px-5 py-4 text-center dark:border-teal-900/40 dark:bg-[#131314]">
            <p className={`text-sm font-medium ${accentClass}`}>
              {isOverdue ? 'Sudah lewat' : 'Sisa waktu tunggu'}
            </p>
            <p
              className={`mt-1 font-mono text-3xl font-bold tabular-nums ${
                isOverdue ? 'text-amber-900 dark:text-amber-100' : 'text-teal-800 dark:text-teal-200'
              }`}
            >
              {isOverdue ? `+${countdown.formattedTime}` : countdown.formattedTime}
            </p>
          </div>
        )}
      </div>

      {isCompact && (
        <div className="flex items-center justify-between gap-3 border-t border-teal-200/80 pt-3 dark:border-teal-900/30">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {formatWaitingAheadLabel(peopleAhead) ?? formatWaitMinutesSentence(context.minutes)}
          </p>
          <p
            className={`font-mono text-base font-semibold tabular-nums ${
              isOverdue ? 'text-amber-800 dark:text-amber-300' : 'text-teal-800 dark:text-teal-300'
            }`}
          >
            {isOverdue ? `+${countdown.formattedTime}` : countdown.formattedTime}
          </p>
        </div>
      )}
    </div>
  )
}
