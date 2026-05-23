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
    'px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-slate-200 hover:border-slate-600',
  [QueueStatus.CALLED]:
    'px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-blue-100 hover:border-blue-600',
  [QueueStatus.IN_PROGRESS]:
    'px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-amber-100 hover:border-amber-600',
  [QueueStatus.DONE]:
    'px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-emerald-100 hover:border-emerald-600',
  [QueueStatus.SKIPPED]:
    'px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-500 hover:text-white text-xs font-bold rounded-lg transition-colors border border-slate-200 hover:border-slate-500',
  [QueueStatus.CANCELLED]:
    'p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200',
}

export function getAllowedQueueTransitions(status: QueueStatus): QueueStatus[] {
  return QUEUE_STATUS_TRANSITIONS[status] ?? []
}

export function isValidQueueTransition(from: QueueStatus, to: QueueStatus): boolean {
  return QUEUE_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}
