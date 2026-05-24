import type { DoctorNotes } from './types'

export function hasDoctorNotes(notes?: DoctorNotes | null): boolean {
  if (!notes) return false
  return Boolean(
    notes.diagnosis?.trim() ||
      notes.medicationInstructions?.trim() ||
      notes.advice?.trim()
  )
}
