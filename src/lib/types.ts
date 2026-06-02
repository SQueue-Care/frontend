// src/lib/types.ts
// Single source of truth for all shared domain types.
// Store files and components should import types from here, not define their own.

// ─── Enums ───────────────────────────────────────────────────────────────────

export const QueueStatus = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED',
} as const
export type QueueStatus = (typeof QueueStatus)[keyof typeof QueueStatus]

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

export type ReservationStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type PaymentType = 'BPJS' | 'UMUM' | 'ASURANSI_SWASTA'
export type BillStatus = 'PENDING' | 'PAID' | 'WAIVED' | 'BPJS_PENDING'

export type QueuePriority = 'DARURAT' | 'TINGGI' | 'URGENT' | 'SEDANG' | 'NORMAL' | 'RENDAH'
export type PatientType = 'RAWAT_JALAN' | 'RAWAT_INAP'

export type VisitStage =
  | 'REGISTRATION'
  | 'WAITING'
  | 'EXAMINATION'
  | 'ADMIN'
  | 'PHARMACY'
  | 'COMPLETE'
  | 'TERMINAL'

export type VisitFlowStepStatus = 'pending' | 'current' | 'completed' | 'skipped'

export type VisitDestinationIcon = 'waiting' | 'doctor' | 'cashier' | 'pharmacy' | 'exit' | 'info'

export interface VisitFlowStep {
  stage: VisitStage
  code: string
  label: string
  description: string
  status: VisitFlowStepStatus
  locationName?: string | null
  roomName?: string | null
  building?: string | null
}

export interface VisitNextDestination {
  stage: VisitStage
  label: string
  instruction: string
  locationName?: string | null
  roomName?: string | null
  building?: string | null
  icon: VisitDestinationIcon
}

export interface VisitFlow {
  currentStage: VisitStage
  steps: VisitFlowStep[]
  nextDestination: VisitNextDestination | null
  summary: string
  pharmacyRequired: boolean
  paymentStatus: BillStatus | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type Role = 'PATIENT' | 'ADMIN' | 'DOCTOR'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  patient?: { id: string }
  doctor?: { id: string }
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: string
  code: string
  name: string
  description: string | null
  building?: string | null
  waitingRoomName?: string | null
  examinationRoom?: string | null
  adminCounter?: string | null
  pharmacyLocation?: string | null
  activeQueueCount?: number
  doctors?: Array<{
    id: string
    specialization?: string
    user?: { name: string }
  }>
}

// ─── User Account (Admin) ─────────────────────────────────────────────────────

export interface UserAccount {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
  isActive: boolean
  createdAt: string
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface PatientProfile {
  id: string
  userId: string
  nik?: string
  bpjsNumber?: string
  phone?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  birthDate?: string
  bloodType?: string
  allergies?: string
  address?: string
  appointmentIds?: string[]
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface PatientMedicalProfile {
  patient: PatientProfile
  medicalHistory: Queue[]
}

// ─── Doctor ───────────────────────────────────────────────────────────────────

export interface DoctorProfile {
  id: string
  userId: string
  specialization: string
  licenseNumber: string | null
  departmentId: string | null
  avgServiceMin: number
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  department: {
    id: string
    name: string
    code: string
  } | null
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  departmentId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  capacity: number
  department: {
    name: string
  }
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface DepartmentDoctor {
  id: string
  userId: string
  specialization: string
  user: {
    name: string
  }
}

/** Lightweight schedule shape returned by the booking flow (/schedules endpoint) */
export interface BookingSchedule {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  capacity: number
  booked?: number
  remaining?: number
  isFull?: boolean
}

export interface DepartmentAvailability {
  date: string
  departmentId: string
  quota: {
    total: number
    booked: number
    remaining: number
    isFull: boolean
  }
  schedules: Array<
    BookingSchedule & {
      scheduleId: string
      doctorId: string
    }
  >
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export interface DepartmentStats {
  departmentId: string
  code: string
  name: string
  counts: Partial<Record<QueueStatus, number>>
  total: number
}

export interface OverviewStats {
  date: string
  departments: DepartmentStats[]
}

export interface DoctorNotes {
  diagnosis?: string | null
  medicationInstructions?: string | null
  advice?: string | null
}

export interface Queue {
  id: string
  queueNumber: number
  status: QueueStatus
  queueDate: string
  checkInAt?: string
  createdAt?: string
  notes?: string | null
  doctorNotes?: DoctorNotes | null
  currentServingNumber?: number | null
  actualWaitMinutes?: number | null
  estimatedWaitMinutes?: number | null
  sessionStartAt?: string | null
  estimatedCallAt?: string | null
  sessionStartTime?: string | null
  scheduleId?: string | null
  currentVisitStage?: VisitStage
  pharmacyRequired?: boolean
  visitFlow?: VisitFlow
  nextDestination?: VisitNextDestination | null
  bill?: {
    id: string
    status: BillStatus
    paymentType: PaymentType
    patientShare: number | null
  } | null
  priority?: QueuePriority
  patientType?: PatientType
  prediction?: {
    source: string
    estimatedMin?: number
    kategori?: string | null
    modelVersion?: string | null
    features?: {
      waitingAhead?: number
      avgServiceMinutes?: number
      sessionStartAt?: string
      estimatedCallAt?: string
    } | null
  } | null
  schedule?: {
    id: string
    startTime: string
    endTime: string
  } | null
  patient: PatientProfile
  department: {
    id: string
    name: string
    code: string
    building?: string | null
    waitingRoomName?: string | null
    examinationRoom?: string | null
    adminCounter?: string | null
    pharmacyLocation?: string | null
  }
  doctor: {
    id?: string
    user: {
      name: string
    }
  } | null
  doctorId?: string | null
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string
  patientId: string
  departmentId: string
  doctorId: string
  scheduleId: string
  appointmentDate: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export interface UserRef {
  id?: string
  name: string
  role?: string
}

export interface PatientRef {
  id?: string
  nik?: string
  bpjsNumber?: string | null
  user?: UserRef
}

export interface DoctorRef {
  id?: string
  user?: UserRef
}

export interface DepartmentRef {
  id: string
  name: string
  code?: string
}

export interface AppointmentDetail {
  id: string
  scheduledAt: string
  status: ReservationStatus
  notes?: string | null
  createdAt?: string
  cancellationReason?: string | null
  patient?: PatientRef
  doctor?: DoctorRef
  department?: DepartmentRef
  confirmedBy?: UserRef | null
  cancelledBy?: UserRef | null
}

export interface AppointmentStatusPayload {
  status: string
  cancellationReason?: string
}

// ─── Prediction ───────────────────────────────────────────────────────────────

export interface WaitTimeEstimate {
  estimatedMinutes: number
  source: 'ml' | 'heuristic'
  modelVersion?: string
  kategori?: string
  waitingAhead: number
  avgServiceMinutes: number
  sessionStartAt?: string
  estimatedCallAt?: string
  sessionStartTime?: string
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface ChartTooltipContext {
  parsed: { y: number }
  label: string
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface BillLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Bill {
  id: string
  patientId: string
  queueId: string | null
  paymentType: PaymentType
  status: BillStatus
  totalAmount: number
  patientShare: number | null
  sepNumber: string | null
  bpjsNumber: string | null
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  lineItems: BillLineItem[]
  patient?: {
    id: string
    bpjsNumber: string | null
    user: { id: string; name: string; email: string }
  } | null
  queue?: {
    id: string
    queueNumber: number
    queueDate: string
    department: DepartmentRef
    doctor: { user: { name: string } } | null
  } | null
}

// ─── CDSS (SmartQueue AI — selaras Postman collection) ─────────────────────────

export interface CdssKandidatDiagnosis {
  nama_penyakit: string
  tingkat_urgensi: string
  confidence: number
  departemen: string
  penjelasan: string
  pemeriksaan_lanjutan: string[]
}

export interface CdssRecommendResponse {
  id: string
  gejala?: string
  gejala_teridentifikasi: string[]
  kandidat_diagnosis: CdssKandidatDiagnosis[]
  catatan_medis: string
  disclaimer: string
  status: string
  notes?: string | null
  createdAt?: string
  patient?: {
    id: string
    user: { name: string }
  }
}

export interface CdssHealthResponse {
  status: string
  gemini_api_configured: boolean
  message: string
  available?: boolean
}

export interface CdssHistoryItem extends CdssRecommendResponse {}
