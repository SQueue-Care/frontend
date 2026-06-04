import type { BookingSchedule, DepartmentAvailability } from './types'

const DAY_CODES = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const

export function toDateKey(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]!
}

export function getDayOfWeekFromDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const local = new Date(year!, month! - 1, day!)
  return DAY_CODES[local.getDay()] ?? 'MONDAY'
}

export function isScheduleAvailable(
  schedule: BookingSchedule,
  availability: DepartmentAvailability | null,
): boolean {
  if (schedule.isFull) return false
  if (schedule.remaining != null && schedule.remaining <= 0) return false
  if (availability?.quota.isFull) return false
  return true
}

export function pickFirstAvailableSchedule(
  schedules: BookingSchedule[],
  availability: DepartmentAvailability | null,
): BookingSchedule | null {
  const sorted = [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime))
  return sorted.find((schedule) => isScheduleAvailable(schedule, availability)) ?? null
}

export function formatBookingDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year!, month! - 1, day!).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatScheduleTimeRange(schedule: Pick<BookingSchedule, 'startTime' | 'endTime'>): string {
  return `${schedule.startTime} – ${schedule.endTime} WIB`
}
