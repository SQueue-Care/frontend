import {
  formatWaitSource,
  getKategoriBadgeClass,
  type QueueWaitDisplay,
} from '../../lib/waitTimeEstimate'

interface WaitTimeEstimateCardProps {
  estimate: QueueWaitDisplay
  variant?: 'compact' | 'prominent'
  className?: string
}

export default function WaitTimeEstimateCard({
  estimate,
  variant = 'compact',
  className = '',
}: WaitTimeEstimateCardProps) {
  const isProminent = variant === 'prominent'

  return (
    <div
      className={`rounded-2xl border border-teal-200/80 bg-white/80 p-4 shadow-sm dark:border-teal-900/40 dark:bg-[#131314]/70 ${isProminent ? 'w-full' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30">
            <svg
              className="h-5 w-5 text-teal-600 dark:text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-widest text-teal-700 uppercase dark:text-teal-400">
              Estimasi Waktu Tunggu
            </p>
            <p
              className={`mt-1 font-['Manrope'] tracking-tight text-zinc-900 dark:text-zinc-100 ${ isProminent ? 'text-3xl' : 'text-2xl' }`}
            >
              {estimate.minutes}
              <span className="ml-1 text-sm text-slate-500 dark:text-zinc-400">menit</span>
            </p>
            {estimate.source && (
              <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                {formatWaitSource(estimate.source)}
              </p>
            )}
          </div>
        </div>

        {estimate.kategori && (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase ${getKategoriBadgeClass(estimate.kategori)}`}
          >
            {estimate.kategori}
          </span>
        )}
      </div>

      {estimate.waitingAhead != null && estimate.waitingAhead >= 0 && (
        <p className="mt-3 border-t border-teal-100 pt-3 text-xs text-slate-600 dark:border-teal-900/30 dark:text-zinc-400">
          {estimate.waitingAhead === 0
            ? 'Anda berikutnya dalam antrean.'
            : `${estimate.waitingAhead} pasien di depan Anda.`}
        </p>
      )}
    </div>
  )
}
