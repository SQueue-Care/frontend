import { QueueStatus } from './types'

export const QUEUE_STATUS_TRANSITIONS: Record<QueueStatus, QueueStatus[]> = {
  [QueueStatus.WAITING]: [QueueStatus.CALLED, QueueStatus.SKIPPED, QueueStatus.CANCELLED],
  [QueueStatus.CALLED]: [
    QueueStatus.IN_PROGRESS,
    QueueStatus.WAITING,
    QueueStatus.SKIPPED,
    QueueStatus.CANCELLED,
  ],
  [QueueStatus.IN_PROGRESS]: [QueueStatus.DONE, QueueStatus.SKIPPED],
  [QueueStatus.SKIPPED]: [QueueStatus.WAITING],
  [QueueStatus.DONE]: [],
  [QueueStatus.CANCELLED]: [],
}

export const QUEUE_TRANSITION_LABELS: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]: 'Kembali',
  [QueueStatus.CALLED]: 'Panggil',
  [QueueStatus.IN_PROGRESS]: 'Periksa',
  [QueueStatus.DONE]: 'Selesai',
  [QueueStatus.SKIPPED]: 'Lewati',
  [QueueStatus.CANCELLED]: 'Batalkan',
}

export const QUEUE_TRANSITION_TITLES: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]: 'Kembalikan antrean ke status Menunggu',
  [QueueStatus.CALLED]: 'Panggil antrean berikutnya',
  [QueueStatus.IN_PROGRESS]: 'Ubah antrean menjadi Sedang Diperiksa',
  [QueueStatus.DONE]: 'Tandai antrean sebagai Selesai',
  [QueueStatus.SKIPPED]: 'Lewati antrean ini',
  [QueueStatus.CANCELLED]: 'Batalkan antrean',
}

export const QUEUE_TRANSITION_CLASSES: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]:
    'rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:border-slate-600 hover:bg-slate-600 hover:text-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-600 dark:hover:text-white',
  [QueueStatus.CALLED]:
    'rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-600',
  [QueueStatus.IN_PROGRESS]:
    'rounded-lg border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 transition-colors hover:border-amber-600 hover:bg-amber-600 hover:text-white dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:border-amber-500 dark:hover:bg-amber-600',
  [QueueStatus.DONE]:
    'rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-600',
  [QueueStatus.SKIPPED]:
    'rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-slate-500 hover:bg-slate-500 hover:text-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-600',
  [QueueStatus.CANCELLED]:
    'rounded-lg border border-transparent p-1.5 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
}

export function getAllowedQueueTransitions(status: QueueStatus): QueueStatus[] {
  return QUEUE_STATUS_TRANSITIONS[status] ?? []
}

export function isValidQueueTransition(from: QueueStatus, to: QueueStatus): boolean {
  return QUEUE_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}
