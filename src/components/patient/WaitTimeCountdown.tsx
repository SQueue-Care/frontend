import { useWaitTimeCountdown } from '../../hooks/useWaitTimeCountdown'
import type { Queue } from '../../lib/types'

type CountdownQueue = Pick<
  Queue,
  'status' | 'checkInAt' | 'createdAt' | 'estimatedWaitMinutes' | 'prediction'
>

interface WaitTimeCountdownProps {
  queue: CountdownQueue
  variant?: 'compact' | 'prominent'
  className?: string
}

export default function WaitTimeCountdown({
  queue,
  variant = 'prominent',
  className = '',
}: WaitTimeCountdownProps) {
  const { isActive, countdown } = useWaitTimeCountdown(queue)

  if (!isActive || !countdown) return null

  const isCompact = variant === 'compact'
  const isOverdue = countdown.isOverdue

  const shellClass = isOverdue
    ? 'border-amber-200/90 bg-amber-50/90 dark:border-amber-500/30 dark:bg-amber-500/10'
    : 'border-teal-200/90 bg-teal-50/70 dark:border-teal-500/30 dark:bg-teal-500/10'

  const labelClass = isOverdue
    ? 'text-amber-700 dark:text-amber-400'
    : 'text-teal-700 dark:text-teal-400'

  const timeClass = isOverdue
    ? 'text-amber-900 dark:text-amber-100'
    : 'text-teal-950 dark:text-teal-50'

  return (
    <div
      className={`rounded-2xl border p-4 ${shellClass} ${isCompact ? 'p-3' : ''} ${className}`}
    >
      <div className={`flex ${isCompact ? 'flex-col gap-2' : 'items-start justify-between gap-4'}`}>
        <div>
          <p className={`text-[10px] tracking-widest uppercase ${labelClass}`}>
            {isOverdue ? 'Estimasi Terlewati' : 'Sisa Waktu Tunggu'}
          </p>
          <p
            className={`mt-1 font-mono tracking-tight ${timeClass} ${ isCompact ? 'text-xl' : 'text-4xl' }`}
          >
            {isOverdue ? `+${countdown.formattedTime}` : countdown.formattedTime}
          </p>
          {!isCompact && (
            <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
              {isOverdue
                ? `Melewati target pukul ${countdown.targetLabel} WIB`
                : `Perkiraan dipanggil pukul ${countdown.targetLabel} WIB`}
            </p>
          )}
        </div>

        {!isCompact && (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase ${
              isOverdue
                ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300'
                : 'border-teal-200 bg-white/80 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300'
            }`}
          >
            {isOverdue ? 'Menunggu Lebih Lama' : 'Hitung Mundur'}
          </span>
        )}
      </div>

      {isOverdue && !isCompact && (
        <p className="mt-3 border-t border-amber-200/80 pt-3 text-xs leading-relaxed text-amber-900/80 dark:border-amber-500/20 dark:text-amber-200/80">
          Antrean sedang lebih sibuk dari perkiraan. Tetap di area tunggu — giliran Anda akan segera
          dipanggil oleh petugas.
        </p>
      )}

      {isOverdue && isCompact && (
        <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
          Melewati estimasi · tunggu panggilan
        </p>
      )}
    </div>
  )
}
