// src/components/patient/LiveQueueTracker.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinationIconPath } from '../../lib/queueVisitFlow'
import { useAlertStore } from '../../store/alertStore'
import { useQueueStore } from '../../store/queueStore'
import ConfirmModal from '../ui/ConfirmModal'

interface LiveQueueTrackerProps {
  queueId: string | null
  onCancelSuccess: () => void
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    case 'CALLED':
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    case 'DONE':
    case 'SKIPPED':
    case 'CANCELLED':
      return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700'
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'Menunggu Antrean'
    case 'CALLED':
      return 'Giliran Anda Dipanggil'
    case 'IN_PROGRESS':
      return 'Sedang Diperiksa'
    default:
      return status
  }
}

export default function LiveQueueTracker({ queueId, onCancelSuccess }: LiveQueueTrackerProps) {
  const navigate = useNavigate()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false)
  const { activeQueueDetail, fetchActiveQueue, cancelQueue } = useQueueStore()
  const showAlert = useAlertStore((s) => s.showAlert)

  useEffect(() => {
    if (!queueId) return

    fetchActiveQueue(queueId)

    const timer = setInterval(() => {
      const detail = useQueueStore.getState().activeQueueDetail
      const currentStatus = detail?.status
      const visitComplete =
        detail?.visitFlow?.currentStage === 'COMPLETE' ||
        detail?.visitFlow?.currentStage === 'TERMINAL'
      if (
        visitComplete ||
        currentStatus === 'CANCELLED' ||
        currentStatus === 'SKIPPED'
      ) {
        clearInterval(timer)
        return
      }
      fetchActiveQueue(queueId)
    }, 10000)

    return () => clearInterval(timer)
  }, [queueId, fetchActiveQueue])

  const triggerCancel = () => {
    setIsConfirmCancelOpen(true)
  }

  const executeCancel = async () => {
    setIsCancelling(true)
    try {
      if (queueId) {
        await cancelQueue(queueId)
        onCancelSuccess()
      }
    } catch {
      showAlert('Gagal membatalkan antrean. Server mungkin sedang sibuk.', 'error')
    } finally {
      setIsCancelling(false)
      setIsConfirmCancelOpen(false)
    }
  }

  if (!queueId || !activeQueueDetail) {
    return (
      <div className="relative mb-8 flex min-h-[160px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-teal-200 bg-teal-50 p-6 text-center shadow-inner transition-all duration-500 dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-100/50 blur-3xl dark:bg-teal-900/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 translate-y-1/3 rounded-full bg-teal-100/50 blur-2xl dark:bg-teal-900/10" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-teal-100 bg-white text-teal-600 shadow-sm dark:border-zinc-800 dark:bg-[#131314] dark:text-teal-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <h3 className="mb-1.5 font-['Manrope'] text-lg tracking-tight text-teal-950 transition-colors md:text-xl dark:text-zinc-100">
            Belum Ada Antrean Aktif
          </h3>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-teal-800/80 transition-colors dark:text-zinc-400">
            Silakan pilih layanan poliklinik di bawah untuk mengambil nomor antrean Anda hari ini.
          </p>
        </div>
      </div>
    )
  }

  const isWaiting = activeQueueDetail.status === 'WAITING'
  const isInProgress =
    activeQueueDetail.status === 'IN_PROGRESS' || activeQueueDetail.status === 'CALLED'
  const isPostExam =
    activeQueueDetail.status === 'DONE' &&
    activeQueueDetail.visitFlow?.currentStage !== 'COMPLETE' &&
    activeQueueDetail.visitFlow?.currentStage !== 'TERMINAL'
  const nextDestination = activeQueueDetail.nextDestination ?? activeQueueDetail.visitFlow?.nextDestination

  const themeParams = {
    bg: isInProgress
      ? 'bg-amber-50 dark:bg-[#1e1f20] border-amber-200 dark:border-amber-900/50'
      : 'bg-teal-50 dark:bg-[#1e1f20] border-teal-200 dark:border-zinc-800',
    blob: isInProgress
      ? 'bg-amber-200/40 dark:bg-amber-900/10'
      : 'bg-teal-100/50 dark:bg-teal-900/10',
    date: isInProgress
      ? 'text-amber-700/70 dark:text-amber-500/70'
      : 'text-teal-700/70 dark:text-teal-500/70',
    title: isInProgress ? 'text-amber-950 dark:text-zinc-100' : 'text-teal-950 dark:text-zinc-100',
    doctor: isInProgress ? 'text-amber-800 dark:text-zinc-400' : 'text-teal-800 dark:text-zinc-400',
    labelCurrent: isInProgress
      ? 'text-amber-600/70 dark:text-amber-500/70'
      : 'text-teal-600/70 dark:text-teal-500/70',
    numCurrent: isInProgress
      ? 'text-amber-900/40 dark:text-amber-700/50'
      : 'text-teal-900/40 dark:text-teal-700/50',
    divider: isInProgress ? 'bg-amber-200/50 dark:bg-zinc-800' : 'bg-teal-200/50 dark:bg-zinc-800',
    labelYours: isInProgress
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-teal-600 dark:text-teal-400',
    numYours: isInProgress
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-teal-600 dark:text-teal-400',
    borderTop: isInProgress
      ? 'border-amber-200/50 dark:border-zinc-800'
      : 'border-teal-200/50 dark:border-zinc-800',
  }

  return (
    <>
      <div
        className={`${themeParams.bg} relative mb-8 flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-inner transition-colors duration-700 md:p-6`}
      >
        <div
          className={`pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700 ${themeParams.blob}`}
        />

        <div className="relative z-10 flex h-full w-full flex-1 flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`inline-flex rounded-md border px-2.5 py-1 text-[9px] tracking-widest uppercase shadow-sm transition-colors duration-500 ${getStatusStyle(activeQueueDetail.status)}`}
              >
                {getStatusText(activeQueueDetail.status)}
              </span>
              <span
                className={`text-[10px] tracking-widest uppercase transition-colors duration-500 ${themeParams.date}`}
              >
                {new Date(activeQueueDetail.queueDate).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h2
              className={`mb-1.5 font-['Manrope'] text-2xl font-extrabold tracking-tight transition-colors duration-500 md:text-3xl ${themeParams.title}`}
            >
              {activeQueueDetail?.department?.name || 'Poliklinik'}
            </h2>
            <p
              className={`text-xs tracking-wide uppercase transition-colors duration-500 ${themeParams.doctor}`}
            >
              {activeQueueDetail?.doctor?.user?.name || 'Dokter belum ditentukan'}
            </p>
            {nextDestination &&
              nextDestination.stage !== 'COMPLETE' &&
              nextDestination.stage !== 'TERMINAL' && (
                <div className="mt-3 rounded-xl border border-teal-200/80 bg-white/70 px-3 py-2.5 dark:border-teal-900/40 dark:bg-[#131314]/60">
                  <p className="text-[9px] tracking-widest text-teal-700 uppercase dark:text-teal-400">
                    Langkah berikutnya
                  </p>
                  <p className="mt-0.5 text-xs text-teal-950 dark:text-teal-100">
                    {nextDestination.instruction}
                  </p>
                  {(nextDestination.roomName ?? nextDestination.locationName) && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-teal-800/80 dark:text-teal-300/70">
                      <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={destinationIconPath(nextDestination.icon)} />
                      </svg>
                      {nextDestination.roomName ?? nextDestination.locationName}
                    </p>
                  )}
                </div>
              )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p
                className={`mb-1 text-[9px] tracking-widest uppercase transition-colors duration-500 ${themeParams.labelCurrent}`}
              >
                Antrean Ke-
              </p>
              <div
                className={`font-mono text-4xl tracking-tighter transition-colors duration-500 md:text-5xl ${themeParams.numCurrent}`}
              >
                {activeQueueDetail.currentServingNumber ?? '-'}
              </div>
            </div>
            <div
              className={`h-14 w-px transition-colors duration-500 ${themeParams.divider}`}
            ></div>
            <div className="text-center">
              <p
                className={`mb-1 text-[9px] tracking-widest uppercase transition-colors duration-500 ${themeParams.labelYours}`}
              >
                Nomor Anda
              </p>
              <div
                className={`font-mono text-4xl tracking-tighter transition-colors duration-500 md:text-5xl ${themeParams.numYours}`}
              >
                {activeQueueDetail.queueNumber}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`relative z-10 mt-5 flex flex-row items-center justify-end gap-2.5 border-t pt-4 transition-colors duration-700 ${themeParams.borderTop}`}
        >
          {isWaiting && (
            <button
              onClick={triggerCancel}
              disabled={isCancelling}
              className="flex-1 rounded-lg border border-rose-200 bg-white px-3 py-2.5 text-center text-[9px] tracking-widest whitespace-nowrap text-rose-600 uppercase shadow-sm transition-all duration-300 outline-none hover:bg-rose-50 disabled:opacity-50 md:flex-none md:px-5 md:text-[10px] dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              {isCancelling ? 'Memproses...' : 'Batalkan Antrean'}
            </button>
          )}
          <button
            onClick={() => navigate(`/portal/queues/${queueId}`)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-center text-[9px] tracking-widest whitespace-nowrap uppercase shadow-sm transition-all duration-300 outline-none md:flex-none md:px-6 md:text-[10px] ${ isInProgress ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500' : 'bg-teal-600 text-white shadow-teal-600/20 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600' }`}
          >
            {isInProgress ? 'Instruksi Pemanggilan' : isPostExam ? 'Lanjutkan Kunjungan' : 'Detail Kunjungan'}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        title="Batalkan Antrean?"
        message="Tindakan ini mutlak dan tidak dapat dibatalkan. Nomor antrean Anda akan ditarik oleh sistem dan diberikan ke pasien lain."
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        type="danger"
        isLoading={isCancelling}
        onConfirm={executeCancel}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />
    </>
  )
}
