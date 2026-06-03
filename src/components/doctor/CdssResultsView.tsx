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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="min-w-0 flex-1 font-['Manrope'] text-base font-bold leading-snug break-words text-zinc-900 dark:text-zinc-100">
          {index + 1}. {candidate.nama_penyakit}
        </p>
        {candidate.tingkat_urgensi && (
          <span
            className={`inline-flex w-fit shrink-0 rounded-lg border px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${getUrgencyBadgeClasses(candidate.tingkat_urgensi)}`}
          >
            {candidate.tingkat_urgensi === 'HIGH' && '🔴 '}
            {candidate.tingkat_urgensi === 'MEDIUM' && '🟡 '}
            {candidate.tingkat_urgensi === 'LOW' && '🟢 '}
            {candidate.tingkat_urgensi}
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500 dark:text-zinc-400">Confidence Score</span>
          <span className="text-teal-600 dark:text-teal-400">
            {candidate.confidence}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, candidate.confidence))}%` }}
          />
        </div>
      </div>

      {candidate.penjelasan && (
        <p
          className={`mb-4 text-sm leading-relaxed break-words text-slate-600 dark:text-zinc-300 ${compact ? 'line-clamp-4' : ''}`}
        >
          {candidate.penjelasan}
        </p>
      )}

      {candidate.departemen && (
        <div className="mb-4 inline-flex items-center rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-[#131314]">
          <span className="font-bold text-slate-600 dark:text-zinc-400 mr-2">Dept. Rujukan:</span>{' '}
          <span className="font-medium text-zinc-900 dark:text-zinc-200 break-words">{candidate.departemen}</span>
        </div>
      )}

      {(candidate.pemeriksaan_lanjutan?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-zinc-800/50 dark:bg-[#131314]/80">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            Pemeriksaan Medis Lanjutan
          </p>
          <ul className="space-y-1.5 text-sm leading-relaxed break-words text-zinc-700 dark:text-zinc-300">
            {candidate.pemeriksaan_lanjutan?.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="shrink-0 font-bold text-indigo-400 dark:text-indigo-500">•</span>
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
    <div className="space-y-6">
      {symptoms.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
            Gejala Teridentifikasi (Ekstraksi AI)
          </p>
          <div
            className={`flex flex-wrap gap-2 ${symptoms.length > 8 ? 'max-h-28 overflow-y-auto overscroll-contain pr-2' : ''}`}
          >
            {symptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-flex max-w-full items-center truncate rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                title={symptom}
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.catatan_medis && (
        <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm dark:border-sky-500/20 dark:bg-[#1e1f20]">
          <p className="border-b border-sky-100 bg-sky-50/50 px-4 py-3 text-[10px] font-bold tracking-widest text-sky-700 uppercase dark:border-sky-500/10 dark:bg-sky-500/5 dark:text-sky-400">
            Catatan Medis AI Terintegrasi
          </p>
          <p
            className={`px-4 py-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-sky-950 dark:text-sky-100 ${compact ? 'max-h-40 overflow-y-auto overscroll-contain' : 'max-h-60 overflow-y-auto overscroll-contain'}`}
          >
            {result.catatan_medis}
          </p>
        </div>
      )}

      {candidates.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
            Kandidat Diagnosis ({candidates.length})
          </p>
          <div className={`space-y-4 ${candidates.length > 2 ? 'max-h-[min(50vh,460px)] overflow-y-auto overscroll-contain pr-1' : ''}`}>
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
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-xs font-medium leading-relaxed break-words text-amber-800 dark:text-amber-300">
            <span className="font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">Disclaimer: </span> 
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}