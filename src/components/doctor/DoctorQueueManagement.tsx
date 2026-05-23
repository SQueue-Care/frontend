// src/components/DoctorQueueManagement.tsx
import { useEffect, useMemo, useState } from 'react'
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
import CDSSModal from './CDSSModal'

export default function DoctorQueueManagement() {
  const user = useAuthStore((state) => state.user)
  const { profile } = useDoctorStore()
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore()
  const showAlert = useAlertStore((s) => s.showAlert)
  const [cdssQueue, setCdssQueue] = useState<Queue | null>(null)

  const departmentId = profile?.department?.id || profile?.departmentId

  // Memuat antrean secara otomatis khusus poliklinik dokter yang bersangkutan
  useEffect(() => {
    if (departmentId) {
      fetchQueues({ departmentId, date: new Date() })
    }
  }, [departmentId, fetchQueues])

  const refreshDepartmentQueues = () => {
    if (departmentId) {
      fetchQueues({ departmentId, date: new Date() })
    }
  }

  const handleUpdateQueueStatus = async (
    queueId: string,
    currentStatus: QueueStatus,
    nextStatus: QueueStatus
  ) => {
    if (!isValidQueueTransition(currentStatus, nextStatus)) {
      showAlert('Transisi status tidak valid.', 'warning')
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

  // Mengurutkan antrean: Status aktif di atas, selesai/batal di bawah
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
      return new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime()
    })
  }, [departmentId, queues])

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950">
          Selamat Datang, {user?.name}
        </h1>
        <p className="text-slate-600">
          Pantau jadwal harian dan antrean pasien yang ditugaskan kepada Anda.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Antrean Poli Hari Ini</h3>
            <p className="text-sm text-slate-500">Antrean pasien untuk departemen Anda.</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {
              departmentQueues.filter((queue) =>
                (
                  [
                    QueueStatus.WAITING,
                    QueueStatus.CALLED,
                    QueueStatus.IN_PROGRESS,
                  ] as QueueStatus[]
                ).includes(queue.status)
              ).length
            }{' '}
            aktif
          </span>
        </div>

        {isLoadingTable ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        ) : errorTable ? (
          <div className="py-8 text-center text-sm font-medium text-rose-600">{errorTable}</div>
        ) : departmentQueues.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 italic">
            Belum ada antrean untuk departemen Anda hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <th className="p-3 pl-0">No. Antrean</th>
                  <th className="p-3">Nama Pasien</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-zinc-900">
                {departmentQueues.map((queue) => {
                  const statusLabel: Record<QueueStatus, string> = {
                    [QueueStatus.WAITING]: 'Menunggu',
                    [QueueStatus.CALLED]: 'Dipanggil',
                    [QueueStatus.IN_PROGRESS]: 'Diperiksa',
                    [QueueStatus.DONE]: 'Selesai',
                    [QueueStatus.SKIPPED]: 'Dilewati',
                    [QueueStatus.CANCELLED]: 'Dibatalkan',
                  }

                  const statusClasses: Record<QueueStatus, string> = {
                    [QueueStatus.WAITING]: 'bg-slate-50 text-slate-700 border-slate-200',
                    [QueueStatus.CALLED]: 'bg-blue-50 text-blue-700 border-blue-200',
                    [QueueStatus.IN_PROGRESS]: 'bg-amber-50 text-amber-700 border-amber-200',
                    [QueueStatus.DONE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    [QueueStatus.SKIPPED]: 'bg-gray-50 text-gray-600 border-gray-200',
                    [QueueStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200',
                  }

                  return (
                    <tr key={queue.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="p-3 pl-0 font-mono font-bold text-zinc-900">
                        {queue.department?.code || 'XX'}-{queue.queueNumber}
                      </td>
                      <td className="p-3">{queue.patient?.user?.name || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${statusClasses[queue.status]}`}
                        >
                          {statusLabel[queue.status]}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {(
                            [
                              QueueStatus.WAITING,
                              QueueStatus.CALLED,
                              QueueStatus.IN_PROGRESS,
                            ] as QueueStatus[]
                          ).includes(queue.status) && (
                            <button
                              onClick={() => setCdssQueue(queue)}
                              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-600 transition-colors hover:bg-violet-100"
                              title="Analisis CDSS"
                            >
                              CDSS
                            </button>
                          )}

                          {getAllowedQueueTransitions(queue.status)
                            .filter((nextStatus) => nextStatus !== QueueStatus.CANCELLED)
                            .map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() =>
                                  handleUpdateQueueStatus(queue.id, queue.status, nextStatus)
                                }
                                className={QUEUE_TRANSITION_CLASSES[nextStatus]}
                                title={QUEUE_TRANSITION_TITLES[nextStatus]}
                              >
                                {QUEUE_TRANSITION_LABELS[nextStatus]}
                              </button>
                            ))}

                          {(
                            [
                              QueueStatus.WAITING,
                              QueueStatus.CALLED,
                              QueueStatus.SKIPPED,
                            ] as QueueStatus[]
                          ).includes(queue.status) && (
                            <button
                              onClick={() => handleCancelQueue(queue.id, queue.status)}
                              className="rounded-lg border border-transparent p-1.5 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
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
      </div>

      <CDSSModal isOpen={!!cdssQueue} onClose={() => setCdssQueue(null)} queue={cdssQueue} />
    </div>
  )
}
