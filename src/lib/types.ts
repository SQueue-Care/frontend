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
  address?: string
  appointmentIds?: string[]
  user: {
    id: string
    email: string
    name: string
    role: string
  }
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

export interface Queue {
  id: string
  queueNumber: number
  status: QueueStatus
  queueDate: string
  checkInAt?: string
  createdAt?: string
  notes?: string | null
  doctorNotes?: string | null
  currentServingNumber?: number | null
  actualWaitMinutes?: number | null
  estimatedWaitMinutes?: number | null
  prediction?: {
    source: string
    estimatedMin?: number
  } | null
  patient: PatientProfile
  department: {
    id: string
    name: string
    code: string
  }
  doctor: {
    user: {
      name: string
    }
  } | null
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
  waitingAhead: number
  avgServiceMinutes: number
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface ChartTooltipContext {
  parsed: { y: number }
  label: string
}
