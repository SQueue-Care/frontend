import { useWaitTimeCountdown } from '../../hooks/useWaitTimeCountdown'
import {
  formatWaitSource,
  getKategoriBadgeClass,
} from '../../lib/waitTimeEstimate'
import type { Queue, WaitTimeEstimate } from '../../lib/types'

type WaitQueueInput = Pick<
  Queue,
  'status' | 'checkInAt' | 'createdAt' | 'estimatedWaitMinutes' | 'prediction' | 'doctorId' | 'patient'
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

  const shellClass = isOverdue
    ? 'border-amber-200/90 bg-amber-50/90 dark:border-amber-500/30 dark:bg-amber-500/10'
    : 'border-teal-200/90 bg-teal-50/70 dark:border-teal-500/30 dark:bg-teal-500/10'

  const accentClass = isOverdue
    ? 'text-amber-700 dark:text-amber-400'
    : 'text-teal-700 dark:text-teal-400'

  return (
    <div
      className={`rounded-2xl border p-4 ${shellClass} ${isCompact ? 'p-3' : ''} ${className}`}
    >
      <div className={`flex ${isCompact ? 'flex-col gap-3' : 'items-start justify-between gap-4'}`}>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className={`text-[10px] tracking-widest uppercase ${accentClass}`}>
              {isOverdue ? 'Estimasi Terlewati' : 'Prediksi Waktu Tunggu'}
            </p>
            {context.kategori && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] tracking-wider uppercase ${getKategoriBadgeClass(context.kategori)}`}
              >
                {context.kategori}
              </span>
            )}
          </div>

          <p
            className={`font-mono tracking-tight text-zinc-900 dark:text-zinc-50 ${ isCompact ? 'text-2xl' : 'text-5xl' }`}
          >
            {context.targetLabel}
            <span className="ml-2 text-sm font-sans text-slate-500 dark:text-zinc-400">WIB</span>
          </p>

          <p className={`mt-1 text-xs ${isOverdue ? 'text-amber-800/90 dark:text-amber-200/90' : 'text-slate-600 dark:text-zinc-400'}`}>
            {isOverdue
              ? `Seharusnya dipanggil pukul ${context.targetLabel} WIB`
              : `Perkiraan giliran Anda · sesi ${context.startedLabel} + ${context.minutes} menit`}
          </p>

          {!isCompact && context.source && (
            <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
              {formatWaitSource(context.source)}
              {context.waitingAhead != null &&
                ` · ${context.waitingAhead === 0 ? 'Anda berikutnya' : `${context.waitingAhead} pasien di depan`}`}
            </p>
          )}
        </div>

        {!isCompact && (
          <div className="shrink-0 text-right">
            <p className={`text-[10px] tracking-widest uppercase ${accentClass}`}>
              {isOverdue ? 'Lewat' : 'Sisa Waktu'}
            </p>
            <p
              className={`mt-1 font-mono text-2xl tracking-tight ${ isOverdue ? 'text-amber-900 dark:text-amber-100' : 'text-teal-900 dark:text-teal-100' }`}
            >
              {isOverdue ? `+${countdown.formattedTime}` : countdown.formattedTime}
            </p>
          </div>
        )}
      </div>

      {isCompact && (
        <div className="flex items-center justify-between gap-3 border-t border-teal-100/80 pt-2 dark:border-teal-900/30">
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">
            Estimasi {context.minutes} menit
          </p>
          <p
            className={`font-mono text-sm ${isOverdue ? 'text-amber-800 dark:text-amber-300' : 'text-teal-800 dark:text-teal-300'}`}
          >
            {isOverdue ? `+${countdown.formattedTime}` : countdown.formattedTime}
          </p>
        </div>
      )}

      {isOverdue && !isCompact && (
        <p className="mt-3 border-t border-amber-200/80 pt-3 text-xs leading-relaxed text-amber-900/80 dark:border-amber-500/20 dark:text-amber-200/80">
          Antrean sedang lebih sibuk dari perkiraan. Tetap di area tunggu — giliran Anda akan segera
          dipanggil oleh petugas.
        </p>
      )}
    </div>
  )
}
