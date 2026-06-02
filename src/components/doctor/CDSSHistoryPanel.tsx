import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { normalizeCdssResult } from '../../lib/cdssUtils'
import { getErrorMessage } from '../../lib/errors'
import type { CdssHistoryItem } from '../../lib/types'
import CdssResultsView from './CdssResultsView'

export default function CDSSHistoryPanel() {
  const [results, setResults] = useState<CdssHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<CdssHistoryItem | null>(null)

  const fetchResults = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/cdss/results?limit=20')
      const items = (res.data.data ?? []).map((item: unknown) =>
        normalizeCdssResult(item) as CdssHistoryItem
      )
      setResults(items)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Gagal memuat riwayat CDSS'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await apiClient.get('/cdss/results?limit=20')
        const items = (res.data.data ?? []).map((item: unknown) =>
          normalizeCdssResult(item) as CdssHistoryItem
        )
        if (!cancelled) setResults(items)
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, 'Gagal memuat riwayat CDSS'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950 dark:text-zinc-100">
            Riwayat Analisis CDSS
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Rekomendasi dari SmartQueue AI (Google Gemini).
          </p>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:bg-slate-300"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-rose-600 italic dark:text-rose-400">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 italic dark:text-zinc-400">
            Belum ada hasil analisis CDSS.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const patientName = result.patient?.user?.name ?? 'Pasien'

              return (
                <div
                  key={result.id}
                  className="cursor-pointer rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50/50 dark:border-zinc-800"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-zinc-900 dark:text-zinc-100">{patientName}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        {formatDate(result.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
                      {result.kandidat_diagnosis?.length || 0} diagnosis
                    </span>
                  </div>

                  {(result.gejala_teridentifikasi?.length ?? 0) > 0 && (
                    <div className="mb-2">
                      <p className="mb-2 text-xs text-slate-600 dark:text-zinc-300">Gejala:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.gejala_teridentifikasi!.slice(0, 3).map((symptom) => (
                          <span
                            key={symptom}
                            className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          >
                            {symptom}
                          </span>
                        ))}
                        {(result.gejala_teridentifikasi?.length ?? 0) > 3 && (
                          <span className="px-2 py-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                            +{(result.gejala_teridentifikasi?.length ?? 0) - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="line-clamp-2 text-xs text-slate-600 dark:text-zinc-300">
                    <span>Gejala input:</span> {result.gejala || result.notes || '-'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(90dvh,880px)] sm:rounded-2xl dark:bg-[#1e1f20]">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Detail Analisis CDSS
              </h2>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-slate-500 dark:text-zinc-400">Pasien</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedResult.patient?.user?.name ?? 'Pasien'}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-500 dark:text-zinc-400">Tanggal</p>
                  <p className="text-sm text-slate-600 dark:text-zinc-300">
                    {formatDate(selectedResult.createdAt)}
                  </p>
                </div>
              </div>

              {(selectedResult.gejala || selectedResult.notes) && (
                <div className="mb-4 rounded-lg border border-slate-200 dark:border-zinc-800">
                  <p className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-zinc-800 dark:text-zinc-400">
                    Gejala Input
                  </p>
                  <p className="max-h-32 overflow-y-auto overscroll-contain px-3 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-600 dark:text-zinc-300">
                    {selectedResult.gejala || selectedResult.notes}
                  </p>
                </div>
              )}

              <CdssResultsView result={selectedResult} />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-[#1e1f20]">
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 sm:w-auto sm:px-6 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
