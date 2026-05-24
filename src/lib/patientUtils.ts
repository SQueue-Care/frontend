const GENDER_LABELS: Record<string, string> = {
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan',
  OTHER: 'Lainnya',
}

export function formatGender(gender?: string | null): string {
  if (!gender) return '-'
  return GENDER_LABELS[gender] ?? gender
}

export function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

export function formatAgeLabel(birthDate?: string | null): string {
  const age = calculateAge(birthDate)
  if (age === null) return 'Usia tidak diketahui'
  return `${age} tahun`
}

export function formatDateId(date?: string | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getPatientInitials(name?: string | null): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}
