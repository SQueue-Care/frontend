import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinationIconPath } from '../../lib/queueVisitFlow'
import { useAlertStore } from '../../store/alertStore'
import { useQueueStore } from '../../store/queueStore'
import ConfirmModal from '../ui/ConfirmModal'
import PatientQueueSummary from './PatientQueueSummary'
import { useQueueLiveEstimate } from '../../hooks/useQueueLiveEstimate'

interface LiveQueueTrackerProps {
  queueId: string | null
  onCancelSuccess: () => void
}

export default function LiveQueueTracker({ queueId, onCancelSuccess }: LiveQueueTrackerProps) {
  const navigate = useNavigate()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false)
  const { activeQueueDetail, fetchActiveQueue, cancelQueue } = useQueueStore()
  const showAlert = useAlertStore((s) => s.showAlert)
  const { liveEstimate } = useQueueLiveEstimate(activeQueueDetail)

  useEffect(() => {
    if (!queueId) return

    fetchActiveQueue(queueId)

    const timer = setInterval(() => {
      const detail = useQueueStore.getState().activeQueueDetail
      const currentStatus = detail?.status
      const visitComplete =
        detail?.visitFlow?.currentStage === 'COMPLETE' ||
        detail?.visitFlow?.currentStage === 'TERMINAL'
      if (visitComplete || currentStatus === 'CANCELLED' || currentStatus === 'SKIPPED') {
        clearInterval(timer)
        return
      }
      fetchActiveQueue(queueId)
    }, 10000)

    return () => clearInterval(timer)
  }, [queueId, fetchActiveQueue])

  const executeCancel = async () => {
    setIsCancelling(true)
    try {
      if (queueId) {
        await cancelQueue(queueId)
        onCancelSuccess()
      }
    } catch {
      showAlert('Gagal membatalkan antrean. Silakan coba lagi.', 'error')
    } finally {
      setIsCancelling(false)
      setIsConfirmCancelOpen(false)
    }
  }

  if (!queueId || !activeQueueDetail) {
    return (
      <section className="rounded-3xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-8 text-center dark:border-zinc-700 dark:bg-[#1e1f20]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm dark:bg-[#131314] dark:text-teal-400">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
        </div>
        <h3 className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-white">
          Belum ada antrean hari ini
        </h3>
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-slate-600 dark:text-zinc-400">
          Tekan tombol <strong>Ambil Antrean</strong> di atas untuk mendaftar ke poliklinik.
        </p>
      </section>
    )
  }

  const isWaiting = activeQueueDetail.status === 'WAITING'
  const isInProgress =
    activeQueueDetail.status === 'IN_PROGRESS' || activeQueueDetail.status === 'CALLED'
  const isPostExam =
    activeQueueDetail.status === 'DONE' &&
    activeQueueDetail.visitFlow?.currentStage !== 'COMPLETE' &&
    activeQueueDetail.visitFlow?.currentStage !== 'TERMINAL'
  const nextDestination =
    activeQueueDetail.nextDestination ?? activeQueueDetail.visitFlow?.nextDestination

  return (
    <>
      <div className="space-y-4">
        <PatientQueueSummary queue={activeQueueDetail} liveEstimate={liveEstimate} />

        {nextDestination &&
          nextDestination.stage !== 'COMPLETE' &&
          nextDestination.stage !== 'TERMINAL' && (
            <div className="rounded-2xl border border-teal-200 bg-white p-4 dark:border-teal-900/40 dark:bg-[#1e1f20]">
              <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">Langkah selanjutnya</p>
              <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-zinc-300">
                {nextDestination.instruction}
              </p>
              {(nextDestination.roomName ?? nextDestination.locationName) && (
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={destinationIconPath(nextDestination.icon)} />
                  </svg>
                  Lokasi: {nextDestination.roomName ?? nextDestination.locationName}
                </p>
              )}
            </div>
          )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isWaiting && (
            <button
              type="button"
              onClick={() => setIsConfirmCancelOpen(true)}
              disabled={isCancelling}
              className="min-h-12 rounded-xl border-2 border-rose-200 bg-white px-5 py-3 text-base font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:bg-[#1e1f20] dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              {isCancelling ? 'Memproses...' : 'Batalkan antrean'}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/portal/queues/${queueId}`)}
            className={`min-h-12 rounded-xl px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors ${
              isInProgress
                ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500'
                : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600'
            }`}
          >
            {isInProgress
              ? 'Lihat petunjuk pemanggilan'
              : isPostExam
                ? 'Lanjutkan kunjungan'
                : 'Lihat detail lengkap'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        title="Batalkan antrean?"
        message="Nomor antrean Anda akan dibatalkan dan tidak bisa dipakai lagi. Anda perlu mengambil nomor baru jika masih ingin berobat."
        confirmText="Ya, batalkan"
        cancelText="Tidak jadi"
        type="danger"
        isLoading={isCancelling}
        onConfirm={executeCancel}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />
    </>
  )
}
