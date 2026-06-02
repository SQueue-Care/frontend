import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { normalizeCdssResult } from '../../lib/cdssUtils'
import { getErrorMessage } from '../../lib/errors'
import { cdss, panel } from '../../lib/panelTheme'
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
          <h2 className={`mb-1 ${panel.heading}`}>
            Riwayat Analisis CDSS
          </h2>
          <p className={panel.subtext}>
            Rekomendasi dari SmartQueue AI (Google Gemini).
          </p>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className={`${panel.card} p-6`}>
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
                  className={cdss.historyItem}
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
        <>
          <div
            className={cdss.backdrop}
            onClick={() => setSelectedResult(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div
              className={cdss.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cdss-history-modal-title"
            >
              <div className={`${cdss.modalHeader} flex items-center justify-between`}>
                <h2
                  id="cdss-history-modal-title"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
                >
                  Detail Analisis CDSS
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedResult(null)}
                  className={cdss.closeButton}
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 dark:border-zinc-800 dark:bg-[#131314]/50">
                    <p className="mb-1 text-xs text-slate-500 dark:text-zinc-400">Pasien</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedResult.patient?.user?.name ?? 'Pasien'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 dark:border-zinc-800 dark:bg-[#131314]/50">
                    <p className="mb-1 text-xs text-slate-500 dark:text-zinc-400">Tanggal</p>
                    <p className="text-sm text-slate-600 dark:text-zinc-300">
                      {formatDate(selectedResult.createdAt)}
                    </p>
                  </div>
                </div>

                {(selectedResult.gejala || selectedResult.notes) && (
                  <div className={`mb-4 ${cdss.section}`}>
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

              <div className={cdss.modalFooter}>
                <button
                  type="button"
                  onClick={() => setSelectedResult(null)}
                  className={`w-full sm:w-auto sm:px-6 ${cdss.secondaryButton}`}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
