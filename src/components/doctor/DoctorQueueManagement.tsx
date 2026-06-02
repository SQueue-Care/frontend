import { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import {
  getAllowedQueueTransitions,
  isValidQueueTransition,
  QUEUE_TRANSITION_CLASSES,
  QUEUE_TRANSITION_LABELS,
  QUEUE_TRANSITION_TITLES,
} from '../../lib/queueStateMachine'
import type { Queue } from '../../lib/types'
import { QueueStatus } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { useDoctorStore } from '../../store/doctorStore'
import { useQueueStore } from '../../store/queueStore'
import { panel, QUEUE_STATUS_BADGE } from '../../lib/panelTheme'
import CDSSModal from './CDSSModal'
import DoctorPatientExamination from './DoctorPatientExamination'
import DoctorNotesModal from './DoctorNotesModal'

const ACTIVE_STATUSES: QueueStatus[] = [QueueStatus.CALLED, QueueStatus.IN_PROGRESS]

const STATUS_LABEL: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]: 'Menunggu',
  [QueueStatus.CALLED]: 'Dipanggil',
  [QueueStatus.IN_PROGRESS]: 'Diperiksa',
  [QueueStatus.DONE]: 'Selesai',
  [QueueStatus.SKIPPED]: 'Dilewati',
  [QueueStatus.CANCELLED]: 'Dibatalkan',
}

const STATUS_CLASSES = QUEUE_STATUS_BADGE

export default function DoctorQueueManagement() {
  const user = useAuthStore((state) => state.user)
  const { profile } = useDoctorStore()
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore()
  const showAlert = useAlertStore((s) => s.showAlert)

  const [cdssQueue, setCdssQueue] = useState<Queue | null>(null)
  const [notesQueue, setNotesQueue] = useState<Queue | null>(null)

  const departmentId = profile?.department?.id || profile?.departmentId
  const doctorId = profile?.id

  useEffect(() => {
    if (departmentId) {
      fetchQueues({ departmentId, date: new Date() })
    }
  }, [departmentId, fetchQueues])

  const refreshDepartmentQueues = useCallback(() => {
    if (departmentId) {
      fetchQueues({ departmentId, date: new Date() })
    }
  }, [departmentId, fetchQueues])

  const departmentQueues = useMemo(() => {
    if (!departmentId) return []

    const activeStatuses: QueueStatus[] = [
      QueueStatus.WAITING,
      QueueStatus.CALLED,
      QueueStatus.IN_PROGRESS,
    ]
    const filtered = queues.filter((queue) => queue.department?.id === departmentId)

    return [...filtered].sort((a, b) => {
      const aActive = activeStatuses.includes(a.status) ? 0 : 1
      const bActive = activeStatuses.includes(b.status) ? 0 : 1
      if (aActive !== bActive) return aActive - bActive
      return a.queueNumber - b.queueNumber
    })
  }, [departmentId, queues])

  const activePatientQueue = useMemo(() => {
    if (!doctorId) return null
    return (
      departmentQueues.find(
        (q) => ACTIVE_STATUSES.includes(q.status) && q.doctorId === doctorId
      ) ?? null
    )
  }, [departmentQueues, doctorId])

  const hasBlockingPatient = Boolean(activePatientQueue)

  const waitingQueues = useMemo(
    () => departmentQueues.filter((q) => q.status === QueueStatus.WAITING),
    [departmentQueues]
  )

  const activeCount = departmentQueues.filter((q) =>
    ([QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_PROGRESS] as QueueStatus[]).includes(
      q.status
    )
  ).length

  const handleUpdateQueueStatus = async (
    queueId: string,
    currentStatus: QueueStatus,
    nextStatus: QueueStatus
  ) => {
    if (!isValidQueueTransition(currentStatus, nextStatus)) {
      showAlert('Transisi status tidak valid.', 'warning')
      return
    }

    if (
      ACTIVE_STATUSES.includes(nextStatus) &&
      hasBlockingPatient &&
      activePatientQueue?.id !== queueId
    ) {
      showAlert('Selesaikan pasien saat ini terlebih dahulu', 'warning')
      return
    }

    try {
      await apiClient.patch(`/queues/${queueId}/status`, { status: nextStatus })
      refreshDepartmentQueues()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal mengubah status antrean.'), 'error')
    }
  }

  const handleCancelQueue = async (queueId: string, currentStatus: QueueStatus) => {
    if (
      !([QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SKIPPED] as QueueStatus[]).includes(
        currentStatus
      )
    ) {
      showAlert('Antrean ini tidak bisa dibatalkan.', 'warning')
      return
    }

    try {
      await apiClient.post(`/queues/${queueId}/cancel`)
      refreshDepartmentQueues()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal membatalkan antrean.'), 'error')
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className={`mb-2 ${panel.headingLg}`}>Terima Pasien</h1>
        <p className={panel.subtext}>
          Selamat datang, {user?.name}. Kelola pemeriksaan pasien dan lihat riwayat medis.
        </p>
      </div>

      {activePatientQueue ? (
        <DoctorPatientExamination
          key={activePatientQueue.id}
          queue={activePatientQueue}
          hasBlockingPatient={hasBlockingPatient}
          onUpdateStatus={handleUpdateQueueStatus}
          onOpenNotes={setNotesQueue}
          onOpenCdss={setCdssQueue}
        />
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] p-10 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 transition-colors dark:bg-indigo-900/20 text-indigo-600 transition-colors dark:text-indigo-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="font-['Manrope'] text-xl font-bold text-zinc-900 transition-colors dark:text-zinc-100">Belum ada pasien aktif</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500 transition-colors dark:text-zinc-400">
            Panggil pasien dari daftar antrean di bawah untuk memulai pemeriksaan.
          </p>
        </div>
      )}

      <div className={`${panel.card} p-6`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-['Manrope'] text-lg text-zinc-900 transition-colors dark:text-zinc-100">Daftar Antrean</h3>
            <p className="text-sm text-slate-500 transition-colors dark:text-zinc-400">
              Pasien menunggu di poli {profile?.department?.name || 'Anda'}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-100 transition-colors dark:border-indigo-800/50 bg-indigo-50 transition-colors dark:bg-indigo-900/20 px-3 py-1 text-xs text-indigo-700 transition-colors dark:text-indigo-400">
            {activeCount} aktif
          </span>
        </div>

        {isLoadingTable ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
          </div>
        ) : errorTable ? (
          <div className="py-8 text-center text-sm font-medium text-rose-600 transition-colors dark:text-rose-400">{errorTable}</div>
        ) : departmentQueues.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 transition-colors dark:text-zinc-400 italic">
            Belum ada antrean untuk departemen Anda hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={panel.tableHead}>
                  <th className="p-3 pl-0">No. Antrean</th>
                  <th className="p-3">Nama Pasien</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className={panel.tableBody}>
                {departmentQueues.map((queue) => {
                  const isCurrent = queue.id === activePatientQueue?.id
                  const isBlocked =
                    hasBlockingPatient &&
                    activePatientQueue?.id !== queue.id &&
                    getAllowedQueueTransitions(queue.status).some((s) =>
                      ACTIVE_STATUSES.includes(s)
                    )

                  return (
                    <tr
                      key={queue.id}
                      className={isCurrent ? panel.tableRowActive : panel.tableRowHover}
                    >
                      <td className="p-3 pl-0 font-mono text-zinc-900 transition-colors dark:text-zinc-100">
                        {queue.department?.code || 'XX'}-{queue.queueNumber}
                        {isCurrent && (
                          <span className="ml-2 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                            AKTIF
                          </span>
                        )}
                      </td>
                      <td className="p-3">{queue.patient?.user?.name || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs ${STATUS_CLASSES[queue.status]}`}
                        >
                          {STATUS_LABEL[queue.status]}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {ACTIVE_STATUSES.includes(queue.status) && (
                            <button
                              type="button"
                              onClick={() => setCdssQueue(queue)}
                              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] text-violet-600 transition-colors hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
                            >
                              CDSS
                            </button>
                          )}

                          {(
                            [
                              QueueStatus.CALLED,
                              QueueStatus.IN_PROGRESS,
                              QueueStatus.DONE,
                            ] as QueueStatus[]
                          ).includes(queue.status) && (
                            <button
                              type="button"
                              onClick={() => setNotesQueue(queue)}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                            >
                              Catatan
                            </button>
                          )}

                          {getAllowedQueueTransitions(queue.status)
                            .filter((nextStatus) => nextStatus !== QueueStatus.CANCELLED)
                            .map((nextStatus) => {
                              const blocked =
                                isBlocked && ACTIVE_STATUSES.includes(nextStatus)
                              return (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  disabled={blocked}
                                  onClick={() =>
                                    handleUpdateQueueStatus(queue.id, queue.status, nextStatus)
                                  }
                                  className={`${QUEUE_TRANSITION_CLASSES[nextStatus]} disabled:cursor-not-allowed disabled:opacity-40`}
                                  title={
                                    blocked
                                      ? 'Selesaikan pasien saat ini terlebih dahulu'
                                      : QUEUE_TRANSITION_TITLES[nextStatus]
                                  }
                                >
                                  {QUEUE_TRANSITION_LABELS[nextStatus]}
                                </button>
                              )
                            })}

                          {(
                            [
                              QueueStatus.WAITING,
                              QueueStatus.CALLED,
                              QueueStatus.SKIPPED,
                            ] as QueueStatus[]
                          ).includes(queue.status) && (
                            <button
                              type="button"
                              onClick={() => handleCancelQueue(queue.id, queue.status)}
                              className="rounded-lg border border-transparent p-1.5 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                              title="Batalkan antrean"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {waitingQueues.length > 0 && !activePatientQueue && (
          <p className="mt-4 text-xs text-slate-500 transition-colors dark:text-zinc-400">
            {waitingQueues.length} pasien menunggu · Panggil nomor{' '}
            <span className="text-indigo-700 transition-colors dark:text-indigo-400">
              {waitingQueues[0]?.department?.code}-{waitingQueues[0]?.queueNumber}
            </span>{' '}
            untuk memulai
          </p>
        )}
      </div>

      <CDSSModal
        isOpen={!!cdssQueue}
        onClose={() => setCdssQueue(null)}
        queue={cdssQueue}
        onSaved={refreshDepartmentQueues}
      />
      <DoctorNotesModal
        isOpen={!!notesQueue}
        onClose={() => setNotesQueue(null)}
        queue={notesQueue}
        onSaved={refreshDepartmentQueues}
      />
    </div>
  )
}
