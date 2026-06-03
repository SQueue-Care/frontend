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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
            Riwayat Analisis CDSS
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Kumpulan rekomendasi diagnosis dari SmartQueue AI (Google Gemini).
          </p>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="shrink-0 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-teal-500 dark:text-zinc-900 dark:hover:bg-teal-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
        >
          {isLoading ? 'Memuat Ulang...' : 'Refresh Data'}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-b-teal-600 dark:border-zinc-800 dark:border-b-teal-500" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm font-medium text-rose-600 italic dark:text-rose-400">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500 italic dark:text-zinc-400">
            Belum ada hasil analisis CDSS yang tercatat.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const patientName = result.patient?.user?.name ?? 'Pasien'

              return (
                <div
                  key={result.id}
                  className="cursor-pointer rounded-2xl border border-slate-200 p-5 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:bg-slate-50 hover:shadow-md dark:border-zinc-800 dark:hover:border-teal-800/50 dark:hover:bg-[#131314]/80"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-zinc-100">{patientName}</h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-500">
                        {formatDate(result.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold tracking-widest text-violet-600 uppercase dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
                      {result.kandidat_diagnosis?.length || 0} diagnosis
                    </span>
                  </div>

                  {(result.gejala_teridentifikasi?.length ?? 0) > 0 && (
                    <div className="mb-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Gejala Ekstraksi AI:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.gejala_teridentifikasi!.slice(0, 3).map((symptom) => (
                          <span
                            key={symptom}
                            className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                          >
                            {symptom}
                          </span>
                        ))}
                        {(result.gejala_teridentifikasi?.length ?? 0) > 3 && (
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                            +{(result.gejala_teridentifikasi?.length ?? 0) - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-[#131314]">
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold text-slate-800 dark:text-zinc-300">Input Dokter:</span> {result.gejala || result.notes || '-'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* REVISI: Z-Index 60, pt-24, max-h-[85dvh] agar tidak menabrak Navbar */}
      {selectedResult && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 pt-24 sm:items-center sm:p-4 sm:pt-24">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity" onClick={() => setSelectedResult(null)} />
          <div className="relative z-10 flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:border dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
              <h2 className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Detail Analisis CDSS
              </h2>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-[#131314]">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Pasien Teridentifikasi</p>
                  <p className="font-['Manrope'] text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedResult.patient?.user?.name ?? 'Pasien Anonim'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-[#131314]">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Waktu Analisis</p>
                  <p className="font-mono text-sm text-slate-700 dark:text-zinc-300">
                    {formatDate(selectedResult.createdAt)}
                  </p>
                </div>
              </div>

              {(selectedResult.gejala || selectedResult.notes) && (
                <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
                  <p className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400">
                    Gejala Input Awal
                  </p>
                  <p className="max-h-32 overflow-y-auto overscroll-contain bg-white px-4 py-3.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-700 dark:bg-[#1e1f20] dark:text-zinc-300">
                    {selectedResult.gejala || selectedResult.notes}
                  </p>
                </div>
              )}

              <CdssResultsView result={selectedResult} />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-[#131314]/50">
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto sm:px-8 dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}