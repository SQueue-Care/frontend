// src/lib/types.ts

// Enum ini menduplikasi enum `QueueStatus` dari Prisma untuk digunakan secara aman di frontend.
// Ini mencegah frontend mengimpor dependensi dari backend.
export enum QueueStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Appointment {
  id: string;
  patientId: string;
  departmentId: string;
  doctorId: string;
  scheduleId: string;
  appointmentDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}