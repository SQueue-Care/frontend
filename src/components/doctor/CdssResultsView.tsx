import type { CdssKandidatDiagnosis, CdssRecommendResponse } from '../../lib/types'
import { getUrgencyBadgeClasses } from '../../lib/cdssUtils'

interface CdssResultsViewProps {
  result: CdssRecommendResponse
  compact?: boolean
}

function CandidateCard({
  candidate,
  index,
  compact,
}: {
  candidate: CdssKandidatDiagnosis
  index: number
  compact?: boolean
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 transition-colors dark:border-zinc-700 dark:bg-[#131314]/80">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug break-words text-zinc-900 dark:text-zinc-100">
          {index + 1}. {candidate.nama_penyakit}
        </p>
        {candidate.tingkat_urgensi && (
          <span
            className={`inline-flex w-fit shrink-0 rounded-md border px-2.5 py-1 text-[11px] ${getUrgencyBadgeClasses(candidate.tingkat_urgensi)}`}
          >
            {candidate.tingkat_urgensi === 'HIGH' && '🔴 '}
            {candidate.tingkat_urgensi === 'MEDIUM' && '🟡 '}
            {candidate.tingkat_urgensi === 'LOW' && '🟢 '}
            {candidate.tingkat_urgensi}
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-zinc-400">Confidence</span>
          <span className="font-medium text-slate-700 dark:text-zinc-300">
            {candidate.confidence}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-violet-500 transition-all dark:bg-violet-400"
            style={{ width: `${Math.min(100, Math.max(0, candidate.confidence))}%` }}
          />
        </div>
      </div>

      {candidate.penjelasan && (
        <p
          className={`mb-2 text-sm leading-relaxed break-words text-slate-600 dark:text-zinc-300 ${compact ? 'line-clamp-4' : ''}`}
        >
          {candidate.penjelasan}
        </p>
      )}

      {candidate.departemen && (
        <p className="mb-2 text-xs break-words text-slate-500 dark:text-zinc-400">
          <span className="font-medium text-slate-600 dark:text-zinc-300">Departemen:</span>{' '}
          {candidate.departemen}
        </p>
      )}

      {(candidate.pemeriksaan_lanjutan?.length ?? 0) > 0 && (
        <div className="mt-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/50">
          <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300">
            Pemeriksaan lanjutan
          </p>
          <ul className="space-y-1 text-xs leading-relaxed break-words text-slate-600 dark:text-zinc-400">
            {candidate.pemeriksaan_lanjutan?.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 text-slate-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export default function CdssResultsView({ result, compact = false }: CdssResultsViewProps) {
  const symptoms = result.gejala_teridentifikasi ?? []
  const candidates = result.kandidat_diagnosis ?? []

  return (
    <div className="space-y-4">
      {symptoms.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
            Gejala Teridentifikasi
          </p>
          <div
            className={`flex flex-wrap gap-1.5 ${symptoms.length > 8 ? 'max-h-28 overflow-y-auto overscroll-contain pr-1' : ''}`}
          >
            {symptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-block max-w-full truncate rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                title={symptom}
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.catatan_medis && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10">
          <p className="border-b border-sky-200/60 px-3 py-2 text-xs font-medium tracking-wide text-sky-700 uppercase dark:border-sky-500/20 dark:text-sky-400">
            Catatan Medis AI
          </p>
          <p
            className={`px-3 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-sky-950 dark:text-sky-100 ${compact ? 'max-h-36 overflow-y-auto overscroll-contain' : 'max-h-48 overflow-y-auto overscroll-contain'}`}
          >
            {result.catatan_medis}
          </p>
        </div>
      )}

      {candidates.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
            Kandidat Diagnosis ({candidates.length})
          </p>
          <div className={`space-y-3 ${candidates.length > 2 ? 'max-h-[min(50vh,420px)] overflow-y-auto overscroll-contain pr-0.5' : ''}`}>
            {candidates.map((candidate, idx) => (
              <CandidateCard
                key={`${candidate.nama_penyakit}-${idx}`}
                candidate={candidate}
                index={idx}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      {result.disclaimer && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-xs leading-relaxed break-words text-amber-800 dark:text-amber-300">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}
