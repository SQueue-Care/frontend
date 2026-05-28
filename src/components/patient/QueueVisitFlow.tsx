import {
  destinationIconPath,
  resolveVisitFlow,
  type VisitFlowStepState,
} from '../../lib/queueVisitFlow'
import type { DoctorNotes, QueueStatus, VisitFlow, VisitNextDestination } from '../../lib/types'

interface QueueVisitFlowProps {
  status: QueueStatus
  doctorNotes?: DoctorNotes | null
  visitFlow?: VisitFlow | null
  nextDestination?: VisitNextDestination | null
  className?: string
  onPharmacyComplete?: () => void
  isPharmacyCompleting?: boolean
}

function stepDotClass(state: VisitFlowStepState): string {
  switch (state) {
    case 'completed':
      return 'bg-slate-300 ring-white dark:bg-zinc-600 dark:ring-[#1e1f20]'
    case 'current':
      return 'animate-pulse bg-teal-500 ring-teal-50 dark:ring-teal-900/30'
    case 'skipped':
      return 'bg-slate-200 ring-white dark:bg-zinc-700 dark:ring-[#1e1f20]'
    default:
      return 'border-2 border-slate-200 bg-white ring-white dark:border-zinc-700 dark:bg-[#1e1f20] dark:ring-[#1e1f20]'
  }
}

function stepTitleClass(state: VisitFlowStepState): string {
  switch (state) {
    case 'current':
      return 'text-teal-700 dark:text-teal-400'
    case 'upcoming':
    case 'skipped':
      return 'text-slate-400 dark:text-zinc-600'
    default:
      return 'text-zinc-900 dark:text-zinc-100'
  }
}

function NextDestinationBanner({
  nextDestination,
  onPharmacyComplete,
  isPharmacyCompleting,
}: {
  nextDestination: VisitNextDestination
  onPharmacyComplete?: () => void
  isPharmacyCompleting?: boolean
}) {
  const locationHint = nextDestination.roomName ?? nextDestination.locationName
  const showPharmacyAction =
    nextDestination.stage === 'PHARMACY' && onPharmacyComplete && nextDestination.icon === 'pharmacy'

  return (
    <div className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 shadow-sm dark:border-teal-900/40 dark:from-teal-950/40 dark:to-emerald-950/20">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md dark:bg-teal-700">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={destinationIconPath(nextDestination.icon)} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-widest text-teal-700 uppercase dark:text-teal-400">
            Langkah berikutnya
          </p>
          <p className="mt-0.5 font-['Manrope'] text-base text-teal-950 dark:text-teal-100">
            {nextDestination.instruction}
          </p>
          {locationHint && (
            <p className="mt-1 text-xs text-teal-800/80 dark:text-teal-300/80">
              📍 {locationHint}
              {nextDestination.building ? ` · ${nextDestination.building}` : ''}
            </p>
          )}
          {showPharmacyAction && (
            <button
              type="button"
              onClick={onPharmacyComplete}
              disabled={isPharmacyCompleting}
              className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-[10px] tracking-widest text-white uppercase transition hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-700 dark:hover:bg-teal-600"
            >
              {isPharmacyCompleting ? 'Menyimpan...' : 'Obat sudah diambil'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QueueVisitFlow({
  status,
  doctorNotes,
  visitFlow,
  nextDestination: nextDestinationProp,
  className = '',
  onPharmacyComplete,
  isPharmacyCompleting,
}: QueueVisitFlowProps) {
  const { steps, summary, nextDestination: resolvedNext } = resolveVisitFlow(
    status,
    doctorNotes,
    visitFlow,
  )
  const nextDestination = nextDestinationProp ?? resolvedNext
  const showBanner =
    nextDestination &&
    nextDestination.stage !== 'COMPLETE' &&
    nextDestination.stage !== 'TERMINAL'

  return (
    <section
      className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20] ${className}`}
      aria-labelledby="queue-visit-flow-heading"
    >
      <div className="mb-6">
        <h2
          id="queue-visit-flow-heading"
          className="font-['Manrope'] text-lg font-extrabold tracking-tight text-zinc-950 dark:text-zinc-100"
        >
          Perjalanan Kunjungan
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">{summary}</p>
      </div>

      {showBanner && (
        <NextDestinationBanner
          nextDestination={nextDestination}
          onPharmacyComplete={onPharmacyComplete}
          isPharmacyCompleting={isPharmacyCompleting}
        />
      )}

      <ol className="relative ml-3 space-y-8 border-l-2 border-slate-200 pb-2 dark:border-zinc-800" role="list">
        {steps.map((step) => (
          <li
            key={step.id}
            className="relative pl-8"
            role="listitem"
            aria-current={step.state === 'current' ? 'step' : undefined}
          >
            <div
              className={`absolute top-1 left-[-9px] h-4 w-4 rounded-full ring-4 transition-colors duration-500 ${stepDotClass(step.state)}`}
              aria-hidden
            />
            <h3 className={`text-sm transition-colors ${stepTitleClass(step.state)}`}>
              {step.title}
              {step.state === 'completed' && <span className="sr-only">, selesai</span>}
              {step.state === 'current' && <span className="sr-only">, tahap saat ini</span>}
              {step.state === 'upcoming' && <span className="sr-only">, belum</span>}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              {step.description}
            </p>
            {(step.locationName || step.roomName) && step.state === 'current' && (
              <p className="mt-1 text-[10px] text-teal-700 dark:text-teal-400">
                📍 {step.roomName ?? step.locationName}
                {step.building ? ` · ${step.building}` : ''}
              </p>
            )}
            {step.state === 'upcoming' && (
              <p className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-600">
                Belum
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
