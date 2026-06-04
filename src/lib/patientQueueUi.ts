import type { QueueStatus } from './types'

export interface PatientQueueStatusInfo {
  label: string
  hint: string
  tone: 'waiting' | 'active' | 'neutral'
}

export const PATIENT_QUEUE_STATUS: Record<string, PatientQueueStatusInfo> = {
  WAITING: {
    label: 'Menunggu giliran',
    hint: 'Silakan duduk di ruang tunggu. Nomor Anda akan dipanggil di layar atau speaker.',
    tone: 'waiting',
  },
  CALLED: {
    label: 'Giliran Anda!',
    hint: 'Silakan segera menuju ruang pemeriksaan.',
    tone: 'active',
  },
  IN_PROGRESS: {
    label: 'Sedang diperiksa',
    hint: 'Dokter sedang melakukan pemeriksaan.',
    tone: 'active',
  },
  DONE: {
    label: 'Pemeriksaan selesai',
    hint: 'Ikuti petunjuk langkah berikutnya jika masih ada.',
    tone: 'neutral',
  },
  SKIPPED: {
    label: 'Antrean dilewati',
    hint: 'Hubungi petugas jika Anda masih ingin dilayani.',
    tone: 'neutral',
  },
  CANCELLED: {
    label: 'Antrean dibatalkan',
    hint: 'Anda dapat mengambil nomor antrean baru jika masih membutuhkan layanan.',
    tone: 'neutral',
  },
}

export function getPatientQueueStatus(status: QueueStatus | string): PatientQueueStatusInfo {
  return (
    PATIENT_QUEUE_STATUS[status] ?? {
      label: status,
      hint: '',
      tone: 'neutral',
    }
  )
}

/** Kalimat ramah untuk jumlah orang di depan. */
export function formatPeopleAheadSentence(count: number | null | undefined): string {
  if (count == null) return 'Menghitung posisi antrean...'
  if (count === 0) return 'Anda antrean berikutnya. Siap-siap, giliran Anda akan segera tiba.'
  if (count === 1) return 'Masih 1 orang sebelum giliran Anda.'
  return `Masih ${count} orang sebelum giliran Anda.`
}

export function formatServingLabel(currentServingNumber: number | null | undefined): string {
  if (currentServingNumber == null) return 'Belum mulai'
  return String(currentServingNumber)
}

export function formatWaitMinutesSentence(minutes: number): string {
  if (minutes < 1) return 'Hampir giliran Anda'
  if (minutes === 1) return 'Sekitar 1 menit lagi'
  if (minutes < 60) return `Sekitar ${minutes} menit lagi`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `Sekitar ${hours} jam lagi`
  return `Sekitar ${hours} jam ${mins} menit lagi`
}
