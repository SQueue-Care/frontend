import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { isCdssAvailable, normalizeCdssResult } from '../../lib/cdssUtils'
import { getErrorMessage } from '../../lib/errors'
import { cdss } from '../../lib/panelTheme'
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
      <div className={cdss.backdrop} onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className={cdss.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cdss-modal-title"
        >
          {/* Header — tetap di atas */}
          <div className={cdss.modalHeader}>
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
                className={cdss.closeButton}
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
              <section className={cdss.section}>
                <button
                  type="button"
                  onClick={() => setShowInput((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
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
                      className={cdss.textarea}
                      placeholder="Contoh: demam tinggi sudah 3 hari, batuk kering, sesak napas..."
                    />
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Umur & jenis kelamin diambil otomatis dari profil pasien.
                    </p>
                    <button
                      type="button"
                      onClick={handleRecommend}
                      disabled={isLoading || !cdssReady || gejala.trim().length < 3}
                      className={cdss.primaryButton}
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
                <section className={cdss.accentSection}>
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
          <div className={cdss.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto sm:px-6 ${cdss.secondaryButton}`}
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
