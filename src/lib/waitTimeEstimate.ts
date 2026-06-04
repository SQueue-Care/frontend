import type { Queue, QueueStatus, WaitTimeEstimate } from './types'

export interface QueueWaitDisplay {
  minutes: number
  kategori?: string | null
  source?: string
  waitingAhead?: number
}

export interface WaitTimeContext extends QueueWaitDisplay {
  startedAt: Date
  targetAt: Date
  startedLabel: string
  targetLabel: string
  sessionStartTime?: string | null
}

export interface WaitCountdownSnapshot {
  isOverdue: boolean
  remainingMs: number
  overdueMs: number
  formattedTime: string
  targetAt: Date
  targetLabel: string
}

const ACTIVE_WAIT_STATUSES: QueueStatus[] = ['WAITING', 'CALLED']
const WIB_TIMEZONE = 'Asia/Jakarta'

type WaitQueueInput = Pick<
  Queue,
  | 'status'
  | 'checkInAt'
  | 'createdAt'
  | 'estimatedWaitMinutes'
  | 'estimatedCallAt'
  | 'sessionStartAt'
  | 'sessionStartTime'
  | 'prediction'
  | 'doctorId'
  | 'scheduleId'
> & {
  queueDate?: string
  department?: { id: string } | null
  schedule?: { id: string; startTime: string; endTime?: string } | null
  patient?: Queue['patient']
}

export type { WaitQueueInput }

/** Parse HH:mm WIB + tanggal antrean → Date UTC anchor. */
export function resolveSessionStartAtClient(queueDate: string, startTime: string): Date {
  const dateKey = queueDate.split('T')[0] ?? queueDate
  const [hourStr, minuteStr] = startTime.split(':')
  const hour = parseInt(hourStr ?? '0', 10)
  const minute = parseInt(minuteStr ?? '0', 10)
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, 0))
}

export function getQueueWaitMinutes(
  queue: Pick<Queue, 'estimatedWaitMinutes' | 'prediction'>,
  liveEstimate?: WaitTimeEstimate | null,
): number | null {
  const minutes =
    queue.estimatedWaitMinutes ??
    queue.prediction?.estimatedMin ??
    liveEstimate?.estimatedMinutes ??
    null

  if (minutes == null || minutes < 0) return null
  return minutes
}

export function getQueueWaitingAhead(
  queue: Pick<Queue, 'status' | 'waitingAhead' | 'prediction'>,
  liveEstimate?: WaitTimeEstimate | null,
): number | null {
  if (queue.status !== 'WAITING') return null

  if (queue.waitingAhead != null) return queue.waitingAhead

  if (liveEstimate?.waitingAhead != null) return liveEstimate.waitingAhead

  const stored = queue.prediction?.features?.waitingAhead
  if (typeof stored === 'number') return stored

  return null
}

export function formatWaitingAheadLabel(count: number | null): string | null {
  if (count == null) return null
  if (count === 0) return 'Anda berikutnya'
  if (count === 1) return '1 pasien lagi sebelum giliran Anda'
  return `${count} pasien lagi sebelum giliran Anda`
}

export function getWaitStartedAt(
  queue: WaitQueueInput,
  liveEstimate?: WaitTimeEstimate | null,
): Date | null {
  const sessionStartAt =
    queue.sessionStartAt ??
    queue.prediction?.features?.sessionStartAt ??
    liveEstimate?.sessionStartAt

  if (sessionStartAt) {
    const parsed = new Date(sessionStartAt)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const startTime = queue.sessionStartTime ?? queue.schedule?.startTime ?? liveEstimate?.sessionStartTime
  if (startTime && queue.queueDate) {
    return resolveSessionStartAtClient(queue.queueDate, startTime)
  }

  // Antrian tanpa jadwal sesi — fallback ke waktu daftar/check-in
  const startValue = queue.checkInAt ?? queue.createdAt
  if (!startValue) return null
  const parsed = new Date(startValue)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getWaitTargetAt(
  queue: WaitQueueInput,
  liveEstimate?: WaitTimeEstimate | null,
): Date | null {
  const estimatedCallAt =
    queue.estimatedCallAt ??
    queue.prediction?.features?.estimatedCallAt ??
    liveEstimate?.estimatedCallAt

  if (estimatedCallAt) {
    const parsed = new Date(estimatedCallAt)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const minutes = getQueueWaitMinutes(queue, liveEstimate)
  if (minutes == null) return null

  const startedAt = getWaitStartedAt(queue, liveEstimate)
  if (!startedAt) return null

  return new Date(startedAt.getTime() + minutes * 60_000)
}

export function buildWaitTimeContext(
  queue: WaitQueueInput,
  liveEstimate?: WaitTimeEstimate | null,
): WaitTimeContext | null {
  if (!ACTIVE_WAIT_STATUSES.includes(queue.status)) return null

  const minutes = getQueueWaitMinutes(queue, liveEstimate)
  if (minutes == null) return null

  const startedAt = getWaitStartedAt(queue, liveEstimate)
  const targetAt = getWaitTargetAt(queue, liveEstimate)
  if (!startedAt || !targetAt) return null

  const sessionStartTime =
    queue.sessionStartTime ?? queue.schedule?.startTime ?? liveEstimate?.sessionStartTime ?? null

  return {
    minutes,
    kategori: queue.prediction?.kategori ?? liveEstimate?.kategori,
    source: queue.prediction?.source ?? liveEstimate?.source,
    waitingAhead:
      getQueueWaitingAhead(queue, liveEstimate) ??
      undefined,
    startedAt,
    targetAt,
    startedLabel: formatClockLabel(startedAt),
    targetLabel: formatClockLabel(targetAt),
    sessionStartTime,
  }
}

export function getQueueWaitDisplay(
  queue: Pick<Queue, 'status' | 'estimatedWaitMinutes' | 'prediction'>,
  liveEstimate?: WaitTimeEstimate | null,
): QueueWaitDisplay | null {
  const context = buildWaitTimeContext(queue as WaitQueueInput, liveEstimate)
  if (!context) return null

  return {
    minutes: context.minutes,
    kategori: context.kategori,
    source: context.source,
    waitingAhead: context.waitingAhead,
  }
}

function formatDurationParts(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSec / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatClockLabel(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: WIB_TIMEZONE,
  })
}

export function computeWaitCountdown(
  targetAt: Date,
  now = Date.now(),
): WaitCountdownSnapshot {
  const remainingMs = targetAt.getTime() - now

  if (remainingMs > 0) {
    return {
      isOverdue: false,
      remainingMs,
      overdueMs: 0,
      formattedTime: formatDurationParts(remainingMs),
      targetAt,
      targetLabel: formatClockLabel(targetAt),
    }
  }

  return {
    isOverdue: true,
    remainingMs: 0,
    overdueMs: Math.abs(remainingMs),
    formattedTime: formatDurationParts(Math.abs(remainingMs)),
    targetAt,
    targetLabel: formatClockLabel(targetAt),
  }
}

export function canShowWaitCountdown(
  queue: WaitQueueInput,
  liveEstimate?: WaitTimeEstimate | null,
): boolean {
  return buildWaitTimeContext(queue, liveEstimate) != null
}

export function getKategoriBadgeClass(kategori?: string | null): string {
  const normalized = kategori?.toLowerCase() ?? ''
  if (normalized.includes('cepat')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
  }
  if (normalized.includes('sangat')) {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
  }
  if (normalized.includes('lama')) {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
  }
  return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400'
}

export function formatWaitSource(source?: string): string {
  return source === 'ml' ? 'Prediksi AI' : 'Estimasi sistem'
}

export function toQueueWaitDisplay(estimate: WaitTimeEstimate): QueueWaitDisplay {
  return {
    minutes: estimate.estimatedMinutes,
    kategori: estimate.kategori,
    source: estimate.source,
    waitingAhead: estimate.waitingAhead,
  }
}

export function buildLiveEstimateParams(queue: WaitQueueInput) {
  const departmentId = queue.department?.id
  if (!departmentId) return null

  return {
    departmentId,
    doctorId: queue.doctorId ?? undefined,
    patientId: queue.patient?.id,
    scheduleId: queue.schedule?.id ?? queue.scheduleId ?? undefined,
    queueDate: queue.queueDate?.split('T')[0],
  }
}

export function formatSessionTimeLabel(queue: Pick<Queue, 'sessionStartTime' | 'schedule'>): string {
  const time = queue.sessionStartTime ?? queue.schedule?.startTime
  return time ? `${time} WIB` : '-'
}
