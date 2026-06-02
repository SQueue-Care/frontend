import type { CdssKandidatDiagnosis, CdssRecommendResponse, CdssHealthResponse } from './types'

export function getUrgencyBadgeClasses(urgency?: string): string {
  const key = urgency?.trim().toUpperCase()
  switch (key) {
    case 'HIGH':
      return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
    case 'MEDIUM':
      return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
    case 'LOW':
    default:
      return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
  }
}

export function isCdssAvailable(health: CdssHealthResponse | null | undefined): boolean {
  return health?.status === 'healthy' && health.gemini_api_configured === true
}

function normalizeKandidat(item: Record<string, unknown>): CdssKandidatDiagnosis {
  return {
    nama_penyakit: String(item.nama_penyakit ?? item.diagnosis ?? ''),
    tingkat_urgensi: String(item.tingkat_urgensi ?? item.urgency ?? 'LOW').toUpperCase(),
    confidence:
      typeof item.confidence === 'number' && item.confidence <= 1
        ? Math.round(item.confidence * 100)
        : Math.round(Number(item.confidence ?? item.confidencePercent ?? 0)),
    departemen: String(item.departemen ?? item.recommendedDepartment ?? ''),
    penjelasan: String(item.penjelasan ?? item.reasoning ?? ''),
    pemeriksaan_lanjutan: Array.isArray(item.pemeriksaan_lanjutan)
      ? (item.pemeriksaan_lanjutan as string[])
      : Array.isArray(item.pemeriksaanLanjutan)
        ? (item.pemeriksaanLanjutan as string[])
        : [],
  }
}

function normalizeKandidatList(items: unknown): CdssKandidatDiagnosis[] {
  if (!Array.isArray(items)) return []
  return items.map((item) =>
    normalizeKandidat(typeof item === 'object' && item != null ? (item as Record<string, unknown>) : {})
  )
}

/** Normalisasi record DB lama (format internal) ke struktur SmartQueue API */
export function normalizeCdssResult(raw: unknown): CdssRecommendResponse {
  const data = raw as Record<string, unknown>

  const gejala_teridentifikasi = Array.isArray(data.gejala_teridentifikasi)
    ? (data.gejala_teridentifikasi as string[])
    : Array.isArray(data.identifiedSymptoms)
      ? (data.identifiedSymptoms as string[])
      : Array.isArray(data.symptoms)
        ? (data.symptoms as string[])
        : []

  let kandidat_diagnosis: CdssKandidatDiagnosis[] = []

  if (Array.isArray(data.kandidat_diagnosis)) {
    kandidat_diagnosis = normalizeKandidatList(data.kandidat_diagnosis)
  } else {
    const storedCandidates = data.candidates
    if (
      storedCandidates &&
      typeof storedCandidates === 'object' &&
      !Array.isArray(storedCandidates)
    ) {
      const wrapped = storedCandidates as Record<string, unknown>
      kandidat_diagnosis = normalizeKandidatList(wrapped.kandidat_diagnosis)
    } else if (Array.isArray(storedCandidates)) {
      kandidat_diagnosis = normalizeKandidatList(storedCandidates)
    }
  }

  const storedCandidates = data.candidates
  const wrappedMeta =
    storedCandidates && typeof storedCandidates === 'object' && !Array.isArray(storedCandidates)
      ? (storedCandidates as Record<string, unknown>)
      : null

  return {
    id: String(data.id ?? ''),
    gejala: String(data.gejala ?? data.notes ?? ''),
    gejala_teridentifikasi,
    kandidat_diagnosis,
    catatan_medis: String(
      data.catatan_medis ?? data.catatanMedis ?? wrappedMeta?.catatan_medis ?? ''
    ),
    disclaimer: String(
      data.disclaimer ??
        wrappedMeta?.disclaimer ??
        'Hasil ini merupakan rekomendasi berbasis AI dan BUKAN diagnosis medis. Keputusan klinis tetap sepenuhnya berada di tangan dokter yang menangani.'
    ),
    status: String(data.status ?? 'success'),
    notes: (data.notes as string | null | undefined) ?? null,
    createdAt: data.createdAt as string | undefined,
    patient: data.patient as CdssRecommendResponse['patient'],
  }
}
