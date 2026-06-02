import { QueueStatus } from './types'

/** Shared surface & typography tokens for admin & doctor panels */
export const panel = {
  card: 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]',
  cardLg: 'rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]',
  heading: "font-['Manrope'] text-2xl font-extrabold text-zinc-950 dark:text-zinc-100",
  headingLg: "font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100",
  subtext: 'text-sm font-medium text-slate-500 dark:text-zinc-400',
  tableHead:
    'border-b border-slate-100 bg-slate-50/80 text-xs tracking-wider text-slate-500 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400',
  tableBody:
    'divide-y divide-slate-100 text-sm font-medium text-zinc-900 dark:divide-zinc-800 dark:text-zinc-100',
  tableRowHover: 'transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/40',
  tableRowActive:
    'bg-indigo-50/80 ring-1 ring-inset ring-indigo-100 dark:bg-indigo-500/10 dark:ring-indigo-500/30',
} as const

export const QUEUE_STATUS_BADGE: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#131314] dark:text-zinc-300 dark:border-zinc-700',
  [QueueStatus.CALLED]:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  [QueueStatus.IN_PROGRESS]:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  [QueueStatus.DONE]:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  [QueueStatus.SKIPPED]:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700',
  [QueueStatus.CANCELLED]:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
}

/** Doctor dashboard tokens */
export const doctor = {
  activePatientCard:
    'rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 shadow-sm dark:border-indigo-800/50 dark:bg-indigo-950/40',
  statWaiting:
    'rounded-2xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10',
  statInProgress:
    'rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-800/50 dark:bg-indigo-900/20',
  statDone:
    'rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10',
  navLink:
    'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-indigo-500/40',
  notesTextarea:
    'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-slate-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-200 dark:placeholder-zinc-500 dark:disabled:bg-zinc-800/50',
} as const

/** Shared CDSS modal & form tokens */
export const cdss = {
  backdrop: 'fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]',
  modal:
    'flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(90dvh,880px)] sm:rounded-2xl dark:bg-[#1e1f20]',
  modalHeader: 'shrink-0 border-b border-slate-200 px-5 py-4 dark:border-zinc-800',
  modalFooter:
    'shrink-0 border-t border-slate-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-[#1e1f20]',
  section: 'rounded-xl border border-slate-200 dark:border-zinc-800',
  accentSection:
    'rounded-xl border border-violet-200/80 bg-violet-50/30 dark:border-violet-500/20 dark:bg-violet-500/5',
  primaryButton:
    'flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500',
  secondaryButton:
    'rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
  closeButton:
    'shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300',
  textarea:
    'max-h-40 min-h-[7rem] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-zinc-800 placeholder-slate-400 transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-200 dark:placeholder-zinc-500 dark:disabled:bg-zinc-800/50',
  historyItem:
    'cursor-pointer rounded-xl border border-slate-200 p-4 transition-colors hover:border-violet-200 hover:bg-slate-50/80 dark:border-zinc-800 dark:hover:border-violet-500/30 dark:hover:bg-zinc-800/40',
} as const

export function getChartTheme(isDark: boolean) {
  return {
    text: isDark ? '#a1a1aa' : '#64748b',
    grid: isDark ? '#27272a' : '#e2e8f0',
    title: isDark ? '#d4d4d8' : '#475569',
    tooltipBg: isDark ? '#131314' : 'rgba(0, 0, 0, 0.8)',
    tooltipTitle: isDark ? '#f4f4f5' : '#ffffff',
    tooltipBody: isDark ? '#d4d4d8' : '#ffffff',
    tooltipBorder: isDark ? '#27272a' : 'transparent',
  }
}
