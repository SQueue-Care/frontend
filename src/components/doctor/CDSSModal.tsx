import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { Queue } from '../../lib/types'

interface CDSSCandidate {
  diagnosis: string
  confidence: number
  reasoning: string
  urgency?: 'low' | 'medium' | 'high'
  recommendedDepartment?: string
}

interface CDSSResult {
  id: string
  symptoms: string[]
  candidates: CDSSCandidate[]
  engine: string
  disclaimer?: string
  notes?: string
  createdAt?: string
}

interface CDSSModalProps {
  isOpen: boolean
  onClose: () => void
  queue: Queue | null
}

function CDSSModalContent({ queue, onClose }: { queue: Queue; onClose: () => void }) {
  const [notes, setNotes] = useState(queue.notes ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CDSSResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await apiClient.get(`/cdss/by-queue/${queue.id}`)
        const existing = res.data?.data as CDSSResult | undefined
        if (!cancelled && existing) setResult(existing)
      } catch {
        console.log('[CDSSModal] No existing CDSS result for this queue')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [queue.id])

  const handleAnalyze = async () => {
    if (!notes.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/cdss/analyze-notes', {
        notes,
        patientId: queue.patient?.id,
        queueId: queue.id,
      })
      setResult(res.data.data)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Analisis gagal. Coba lagi.'))
    } finally {
      setIsLoading(false)
    }
  }

  const hasExistingResult = !!result

  const getUrgencyBadgeClasses = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-rose-50 transition-colors dark:bg-rose-500/10 text-rose-600 transition-colors dark:text-rose-400 border-rose-200 transition-colors dark:border-rose-500/20 '
      case 'medium':
        return 'bg-amber-50 transition-colors dark:bg-amber-500/10 text-amber-600 transition-colors dark:text-amber-400 border-amber-200 transition-colors dark:border-amber-500/20 '
      case 'low':
      default:
        return 'bg-emerald-50 transition-colors dark:bg-emerald-500/10 text-emerald-600 transition-colors dark:text-emerald-400 border-emerald-200 transition-colors dark:border-emerald-500/20 '
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white transition-colors dark:bg-[#1e1f20] shadow-lg">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] px-6 py-4">
            <h2 className="text-xl font-bold text-zinc-900 transition-colors dark:text-zinc-100 ">🧠 Analisis CDSS</h2>
            <button
              onClick={onClose}
              className="text-slate-400 transition-colors dark:text-zinc-500 transition-colors hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="space-y-6 p-6">
            {/* Notes Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 transition-colors dark:text-zinc-300 ">
                Catatan Pasien
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-200 transition-colors dark:border-zinc-800 px-4 py-3 text-sm text-zinc-800 transition-colors dark:text-zinc-200 placeholder-slate-400 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:bg-slate-50"
                rows={5}
                placeholder="Masukkan keluhan/catatan pasien..."
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !notes.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menganalisis...
                </>
              ) : hasExistingResult ? (
                <>Analisa Ulang →</>
              ) : (
                <>Analisa dengan AI →</>
              )}
            </button>

            {/* Existing result indicator */}
            {hasExistingResult && (
              <div className="rounded-lg border border-emerald-200 transition-colors dark:border-emerald-500/20 bg-emerald-50 transition-colors dark:bg-emerald-500/10 p-3 text-center">
                <p className="text-sm font-semibold text-emerald-700">
                  ✓ Hasil analisis sudah ada di database
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-rose-200 transition-colors dark:border-rose-500/20 bg-rose-50 transition-colors dark:bg-rose-500/10 px-4 py-3">
                <p className="text-sm font-medium text-rose-600 transition-colors dark:text-rose-400 ">❌ {error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Candidates */}
                <div>
                  <h3 className="mb-3 text-sm font-bold tracking-widest text-zinc-700 transition-colors dark:text-zinc-300 uppercase">
                    Kandidat Diagnosis
                  </h3>
                  <div className="space-y-3">
                    {result.candidates.map((candidate, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 transition-colors dark:border-zinc-800 bg-slate-50/50 transition-colors dark:bg-[#131314]/50 p-4 transition-colors hover:bg-slate-100/50"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-zinc-900 transition-colors dark:text-zinc-100 ">
                              {idx + 1}. {candidate.diagnosis}
                            </p>
                          </div>
                          {candidate.urgency && (
                            <span
                              className={`rounded-md border px-2.5 py-1 text-[11px] font-bold ${getUrgencyBadgeClasses(candidate.urgency)}`}
                            >
                              {candidate.urgency === 'high' && '🔴'}
                              {candidate.urgency === 'medium' && '🟡'}
                              {candidate.urgency === 'low' && '🟢'}
                              {` ${candidate.urgency.toUpperCase()}`}
                            </span>
                          )}
                        </div>

                        {/* Confidence Bar */}
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-slate-600 transition-colors dark:text-zinc-300 ">Confidence</span>
                            <span className="text-xs font-bold text-slate-700 transition-colors dark:text-zinc-300 ">
                              {Math.round(candidate.confidence * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-teal-500 transition-all"
                              style={{ width: `${candidate.confidence * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="mb-2 text-sm text-slate-600 transition-colors dark:text-zinc-300 ">{candidate.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="rounded-lg border border-amber-200 transition-colors dark:border-amber-500/20 bg-amber-50 transition-colors dark:bg-amber-500/10 px-4 py-3">
                  <p className="text-xs text-amber-700 transition-colors dark:text-amber-400 ">⚠️ {result.disclaimer}</p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end border-t border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 transition-colors dark:bg-[#1e1f20] px-6 py-2 text-sm font-bold text-slate-700 transition-colors dark:text-zinc-300 transition-colors hover:bg-slate-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CDSSModal({ isOpen, onClose, queue }: CDSSModalProps) {
  if (!isOpen || !queue) return null

  return <CDSSModalContent key={queue.id} queue={queue} onClose={onClose} />
}
