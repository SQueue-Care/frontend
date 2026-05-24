import { hasDoctorNotes } from './doctorNotes'
import { QueueStatus, type DoctorNotes, type QueueStatus as QueueStatusType, type VisitFlow, type VisitFlowStep, type VisitNextDestination } from './types'

export type VisitFlowStepState = 'completed' | 'current' | 'upcoming' | 'skipped'

export interface LegacyVisitFlowStep {
  id: string
  title: string
  description: string
  state: VisitFlowStepState
  locationName?: string | null
  roomName?: string | null
  building?: string | null
}

function mapStepStatus(status: VisitFlowStep['status']): VisitFlowStepState {
  if (status === 'pending') return 'upcoming'
  return status
}

/** Prefer backend `visitFlow`; fall back to client-side guess for older API responses. */
export function resolveVisitFlow(
  status: QueueStatusType,
  doctorNotes?: DoctorNotes | null,
  visitFlow?: VisitFlow | null,
): {
  steps: LegacyVisitFlowStep[]
  summary: string
  nextDestination: VisitNextDestination | null
} {
  if (visitFlow) {
    return {
      steps: visitFlow.steps.map((step) => ({
        id: step.code,
        title: step.label,
        description: step.description,
        state: mapStepStatus(step.status),
        locationName: step.locationName,
        roomName: step.roomName,
        building: step.building,
      })),
      summary: visitFlow.summary,
      nextDestination: visitFlow.nextDestination,
    }
  }

  const legacySteps = buildQueueVisitFlowSteps(status, doctorNotes)
  return {
    steps: legacySteps,
    summary: getVisitFlowSummary(status, doctorNotes),
    nextDestination: null,
  }
}

function hasMedicationInstructions(notes?: DoctorNotes | null): boolean {
  return Boolean(notes?.medicationInstructions?.trim())
}

/**
 * Legacy client-side visit steps (fallback when API has no visitFlow).
 */
export function buildQueueVisitFlowSteps(
  status: QueueStatusType,
  doctorNotes?: DoctorNotes | null
): LegacyVisitFlowStep[] {
  const showPharmacy = hasMedicationInstructions(doctorNotes)
  const isSkipped = status === QueueStatus.SKIPPED
  const isCancelled = status === QueueStatus.CANCELLED
  const isTerminal = isSkipped || isCancelled
  const isDone = status === QueueStatus.DONE
  const isWaiting = status === QueueStatus.WAITING
  const isExamining =
    status === QueueStatus.CALLED || status === QueueStatus.IN_PROGRESS

  const steps: Omit<LegacyVisitFlowStep, 'state'>[] = [
    {
      id: 'registered',
      title: 'Pendaftaran',
      description: 'Tiket antrean telah diterbitkan.',
    },
    {
      id: 'waiting',
      title: 'Menunggu antrian',
      description: isWaiting
        ? 'Anda masih dalam antrean tunggu.'
        : 'Tahap antrean tunggu telah dilewati.',
    },
    {
      id: 'examination',
      title: 'Dipanggil / Diperiksa dokter',
      description: isExamining
        ? 'Silakan masuk ke ruang pemeriksaan.'
        : isDone || isTerminal
          ? 'Pemeriksaan dokter telah selesai.'
          : 'Menunggu panggilan ke ruang dokter.',
    },
    {
      id: 'exam_done',
      title: 'Selesai pemeriksaan',
      description: isDone
        ? 'Pemeriksaan di poliklinik telah selesai.'
        : isTerminal
          ? 'Kunjungan tidak dilanjutkan hingga selesai.'
          : 'Menunggu penyelesaian pemeriksaan.',
    },
  ]

  if (!isTerminal) {
    steps.push({
      id: 'payment',
      title: 'Pembayaran administrasi',
      description: isDone
        ? 'Silakan lakukan pembayaran di loket administrasi.'
        : 'Dilakukan setelah pemeriksaan selesai.',
    })
    if (showPharmacy) {
      steps.push({
        id: 'pharmacy',
        title: 'Pengambilan obat (farmasi)',
        description: isDone
          ? 'Ambil obat sesuai petunjuk dokter di apotek/farmasi.'
          : 'Dilakukan setelah pembayaran jika ada resep obat.',
      })
    }
  } else {
    steps.push({
      id: 'terminal',
      title: isSkipped ? 'Antrean dilewati' : 'Kunjungan dibatalkan',
      description: isSkipped
        ? 'Antrean tidak dilanjutkan. Hubungi petugas jika perlu daftar ulang.'
        : 'Pendaftaran antrean ini telah dibatalkan.',
    })
  }

  if (isTerminal) {
    return steps.map((step) => ({
      ...step,
      state:
        step.id === 'terminal'
          ? 'current'
          : step.id === 'registered'
            ? 'completed'
            : 'skipped',
    }))
  }

  let currentId: string
  if (isWaiting) currentId = 'waiting'
  else if (isExamining) currentId = 'examination'
  else if (isDone) currentId = 'payment'
  else currentId = 'waiting'

  const currentIndex = steps.findIndex((s) => s.id === currentId)

  return steps.map((step, index) => ({
    ...step,
    state:
      index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming',
  }))
}

export function getVisitFlowSummary(
  status: QueueStatusType,
  doctorNotes?: DoctorNotes | null
): string {
  if (status === QueueStatus.SKIPPED) return 'Kunjungan tidak dilanjutkan.'
  if (status === QueueStatus.CANCELLED) return 'Kunjungan dibatalkan.'
  if (status === QueueStatus.DONE && hasDoctorNotes(doctorNotes)) {
    return 'Pemeriksaan selesai. Ikuti tahap pembayaran dan pengambilan obat di bawah.'
  }
  if (status === QueueStatus.DONE) return 'Pemeriksaan selesai. Lanjutkan ke pembayaran administrasi.'
  return 'Lacak perjalanan kunjungan Anda dari antrean hingga selesai.'
}

export function destinationIconPath(icon: VisitNextDestination['icon']): string {
  switch (icon) {
    case 'doctor':
      return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    case 'cashier':
      return 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    case 'pharmacy':
      return 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
    case 'exit':
      return 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    case 'waiting':
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

export const VISIT_STAGE_LABELS: Record<string, string> = {
  REGISTRATION: 'Pendaftaran',
  WAITING: 'Menunggu',
  EXAMINATION: 'Pemeriksaan',
  ADMIN: 'Administrasi/Kasir',
  PHARMACY: 'Apotek',
  COMPLETE: 'Selesai',
  TERMINAL: 'Berakhir',
}
