import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'

interface CDSSResultItem {
  id: string
  notes?: string
  symptoms: string[]
  candidates: Array<{
    diagnosis: string
    confidence: number
    urgency?: string
  }>
  createdAt: string
  patient?: {
    id: string
    user: { name: string }
  }
}

export default function CDSSHistoryPanel() {
  const [results, setResults] = useState<CDSSResultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<CDSSResultItem | null>(null)

  const fetchResults = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/cdss/results?limit=20')
      setResults(res.data.data)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch CDSS results'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await apiClient.get('/cdss/results?limit=20')
        if (!cancelled) setResults(res.data.data)
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to fetch CDSS results'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const formatDate = (dateString: string) => {
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
          <h2 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950">
            Riwayat Analisis CDSS
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Daftar analisis pasien yang telah dilakukan dengan AI.
          </p>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:bg-slate-300"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm font-bold text-rose-600 italic">{error}</div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 italic">
            Belum ada hasil analisis CDSS.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="cursor-pointer rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50/50"
                onClick={() => setSelectedResult(result)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-zinc-900">
                      {result.patient?.user?.name || 'Unknown Patient'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(result.createdAt)}</p>
                  </div>
                  <span className="rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">
                    {result.candidates?.length || 0} diagnoses
                  </span>
                </div>

                <div className="mb-2">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Gejala:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.symptoms?.slice(0, 3).map((symptom, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
                      >
                        {symptom}
                      </span>
                    ))}
                    {result.symptoms?.length > 3 && (
                      <span className="px-2 py-0.5 text-[11px] text-slate-500">
                        +{result.symptoms.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="line-clamp-2 text-xs text-slate-600">
                  <span className="font-semibold">Catatan:</span> {result.notes || '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-lg">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-xl font-bold text-zinc-900">Detail Analisis CDSS</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6">
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-700">Pasien</p>
                <p className="text-base font-bold text-zinc-900">
                  {selectedResult.patient?.user?.name || 'Unknown'}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-slate-700">Tanggal Analisis</p>
                <p className="text-sm text-slate-600">{formatDate(selectedResult.createdAt)}</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Catatan</p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-600">
                  {selectedResult.notes || '-'}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Gejala Teridentifikasi</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">Kandidat Diagnosis</p>
                <div className="space-y-3">
                  {selectedResult.candidates.map((candidate, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <p className="font-bold text-zinc-900">
                          {idx + 1}. {candidate.diagnosis}
                        </p>
                        {candidate.urgency && (
                          <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-bold text-violet-600">
                            {candidate.urgency.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-teal-500"
                          style={{ width: `${candidate.confidence * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {Math.round(candidate.confidence * 100)}% confidence
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => setSelectedResult(null)}
                className="rounded-lg bg-slate-100 px-6 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
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
