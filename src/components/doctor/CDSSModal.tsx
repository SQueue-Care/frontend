import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { isCdssAvailable, normalizeCdssResult } from '../../lib/cdssUtils'
import { getErrorMessage } from '../../lib/errors'
import type { CdssHealthResponse, CdssRecommendResponse, Queue } from '../../lib/types'
import CdssResultsView from './CdssResultsView'

interface CDSSModalProps {
  isOpen: boolean
  onClose: () => void
  queue: Queue | null
  onSaved?: () => void
}

function gejalaFromResult(data: CdssRecommendResponse | null): string {
  if (!data) return ''
  return (data.gejala ?? data.notes ?? '').trim()
}

function CDSSModalContent({
  queue,
  onClose,
  onSaved,
}: {
  queue: Queue
  onClose: () => void
  onSaved?: () => void
}) {
  const [gejala, setGejala] = useState(queue.notes ?? '')
  const [health, setHealth] = useState<CdssHealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CdssRecommendResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showInput, setShowInput] = useState(true)

  const cdssReady = isCdssAvailable(health)
  const patientName = queue.patient?.user?.name ?? 'Pasien'

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [existingRes, healthRes] = await Promise.all([
          apiClient.get(`/cdss/by-queue/${queue.id}`),
          apiClient.get('/cdss/health'),
        ])
        if (!cancelled) {
          const existing = existingRes.data?.data
          if (existing) {
            const normalized = normalizeCdssResult(existing)
            setResult(normalized)
            const savedGejala = gejalaFromResult(normalized)
            if (savedGejala) setGejala(savedGejala)
            setShowInput(false)
          }
          setHealth(healthRes.data?.data ?? null)
        }
      } catch {
        if (!cancelled) {
          try {
            const healthRes = await apiClient.get('/cdss/health')
            setHealth(healthRes.data?.data ?? null)
          } catch {
            console.log('[CDSSModal] CDSS health unavailable')
          }
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [queue.id])

  const handleRecommend = async () => {
    const trimmed = gejala.trim()
    if (trimmed.length < 3) {
      setError('Gejala minimal 3 karakter.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSaveMessage(null)
    try {
      const res = await apiClient.post('/cdss/recommend', {
        gejala: trimmed,
        patientId: queue.patient?.id,
        queueId: queue.id,
      })
      const normalized = normalizeCdssResult(res.data.data)
      const savedGejala = gejalaFromResult(normalized) || trimmed
      setResult(normalized)
      setGejala(savedGejala)
      setShowInput(false)
      setSaveMessage(result ? 'Gejala dan hasil analisis diperbarui.' : 'Gejala dan hasil analisis tersimpan.')
      onSaved?.()
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Rekomendasi CDSS gagal. Coba lagi.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(90dvh,880px)] sm:rounded-2xl dark:bg-[#1e1f20]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cdss-modal-title"
        >
          {/* Header — tetap di atas */}
          <div className="shrink-0 border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2
                  id="cdss-modal-title"
                  className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-100"
                >
                  Rekomendasi CDSS
                </h2>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">
                  {patientName}
                  {queue.department?.code && (
                    <span className="ml-2 font-mono">
                      · {queue.department.code}-{queue.queueNumber}
                    </span>
                  )}
                </p>
                {health && (
                  <p
                    className={`mt-1 text-xs ${cdssReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                  >
                    {cdssReady ? '● SmartQueue AI aktif' : `● ${health.message}`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body — scroll terpisah */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-4 p-5">
              {/* Form input — bisa dilipat saat hasil sudah ada */}
              <section className="rounded-xl border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInput((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Deskripsi Gejala
                  </span>
                  <span className="text-xs text-violet-600 dark:text-violet-400">
                    {showInput ? 'Sembunyikan' : 'Tampilkan / Edit'}
                  </span>
                </button>

                {showInput && (
                  <div className="space-y-3 border-t border-slate-200 px-4 py-3 dark:border-zinc-800">
                    <textarea
                      value={gejala}
                      onChange={(e) => setGejala(e.target.value)}
                      disabled={isLoading || !cdssReady}
                      className="max-h-40 min-h-[7rem] w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-relaxed text-zinc-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:bg-slate-50 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-200"
                      placeholder="Contoh: demam tinggi sudah 3 hari, batuk kering, sesak napas..."
                    />
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Umur & jenis kelamin diambil otomatis dari profil pasien.
                    </p>
                    <button
                      type="button"
                      onClick={handleRecommend}
                      disabled={isLoading || !cdssReady || gejala.trim().length < 3}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Menganalisis...
                        </>
                      ) : result ? (
                        'Analisa Ulang'
                      ) : (
                        'Dapatkan Rekomendasi'
                      )}
                    </button>
                  </div>
                )}

                {!showInput && gejala.trim() && (
                  <div className="border-t border-slate-200 px-4 py-3 dark:border-zinc-800">
                    <p className="line-clamp-3 text-sm leading-relaxed break-words text-slate-600 dark:text-zinc-300">
                      {gejala.trim()}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowInput(true)}
                      className="mt-2 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                    >
                      Edit gejala
                    </button>
                  </div>
                )}
              </section>

              {!cdssReady && health && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    CDSS tidak aktif. Pastikan SmartQueue AI berjalan dan GEMINI_API_KEY sudah
                    dikonfigurasi.
                  </p>
                </div>
              )}

              {saveMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {saveMessage}
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              {result && (
                <section className="rounded-xl border border-violet-200/80 bg-violet-50/30 dark:border-violet-500/20 dark:bg-violet-500/5">
                  <div className="border-b border-violet-200/60 px-4 py-3 dark:border-violet-500/20">
                    <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-200">
                      Hasil Rekomendasi
                    </h3>
                    <p className="mt-0.5 text-xs text-violet-700/80 dark:text-violet-300/80">
                      {result.kandidat_diagnosis?.length ?? 0} kandidat diagnosis · status{' '}
                      {result.status}
                    </p>
                  </div>
                  <div className="p-4">
                    <CdssResultsView result={result} compact />
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Footer — tetap di bawah */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-[#1e1f20]">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 sm:w-auto sm:px-6 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CDSSModal({ isOpen, onClose, queue, onSaved }: CDSSModalProps) {
  if (!isOpen || !queue) return null

  return <CDSSModalContent key={queue.id} queue={queue} onClose={onClose} onSaved={onSaved} />
}
