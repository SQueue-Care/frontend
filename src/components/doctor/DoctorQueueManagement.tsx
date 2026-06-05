import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import {
  getAllowedQueueTransitions,
  isValidQueueTransition,
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
import DoctorNotesModal from './DoctorNotesModal'
import DoctorPatientExamination from './DoctorPatientExamination'

const ACTIVE_STATUSES: QueueStatus[] = [QueueStatus.CALLED, QueueStatus.IN_PROGRESS]

const STATUS_LABEL: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]: 'Menunggu',
  [QueueStatus.CALLED]: 'Dipanggil',
  [QueueStatus.IN_PROGRESS]: 'Diperiksa',
  [QueueStatus.DONE]: 'Selesai',
  [QueueStatus.SKIPPED]: 'Dilewati',
  [QueueStatus.CANCELLED]: 'Dibatalkan',
}

const STATUS_CLASSES: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]: 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-[#131314] dark:border-zinc-800 dark:text-zinc-300',
  [QueueStatus.CALLED]: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  [QueueStatus.IN_PROGRESS]: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  [QueueStatus.DONE]: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  [QueueStatus.SKIPPED]: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-400',
  [QueueStatus.CANCELLED]: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
}

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

    if (!window.confirm('Apakah Anda yakin ingin membatalkan antrean ini?')) return

    try {
      await apiClient.post(`/queues/${queueId}/cancel`)
      refreshDepartmentQueues()
      showAlert('Antrean berhasil dibatalkan.', 'success')
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal membatalkan antrean.'), 'error')
    }
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Terima Pasien
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Selamat datang, <span className="font-bold text-zinc-800 dark:text-zinc-200">{user?.name}</span>. Kelola pemeriksaan pasien dan lihat riwayat medis.
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
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-zinc-800 dark:bg-[#131314]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-zinc-100">Belum ada pasien aktif</h2>
          <p className="mt-2 max-w-md text-sm font-medium text-slate-500 dark:text-zinc-400">
            Panggil pasien dari daftar antrean di bawah untuk memulai sesi pemeriksaan medis.
          </p>
        </div>
      )}

      {/* TABEL ANTREAN */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-zinc-800">
          <div>
            <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-zinc-100">Daftar Antrean</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Pasien menunggu di poli {profile?.department?.name || 'Anda'}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold tracking-widest text-indigo-700 uppercase dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            {activeCount} aktif
          </span>
        </div>

        {isLoadingTable ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-b-indigo-600 dark:border-zinc-800 dark:border-b-indigo-500" />
          </div>
        ) : errorTable ? (
          <div className="py-16 text-center text-sm font-medium text-rose-600 dark:text-rose-400">{errorTable}</div>
        ) : departmentQueues.length === 0 ? (
          <div className="py-16 text-center text-sm font-medium italic text-slate-500 dark:text-zinc-400">
            Belum ada antrean untuk departemen Anda hari ini.
          </div>
        ) : (
          <div className="no-scrollbar relative overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="border-b border-slate-100 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:text-zinc-500">
                <tr>
                  <th className="p-6 pl-8">No. Antrean</th>
                  <th className="p-6">Nama Pasien</th>
                  <th className="p-6">Status</th>
                  <th className="sticky right-0 z-20 p-6 pr-8 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
                {departmentQueues.map((queue, index) => {
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
                      style={{ zIndex: departmentQueues.length - index }}
                      className={`group relative transition-colors duration-200 ${
                        isCurrent
                          ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-100 dark:bg-[#252636] dark:ring-indigo-500/20'
                          : 'bg-white hover:bg-slate-50 dark:bg-[#1e1f20] dark:hover:bg-[#252628]'
                      }`}
                    >
                      <td className="p-6 pl-8 align-top">
                        <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          {queue.department?.code || 'XX'}-{queue.queueNumber}
                          {isCurrent && (
                            <span className="ml-3 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-[0_0_8px_rgba(79,70,229,0.5)]">
                              AKTIF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="font-medium uppercase text-zinc-900 transition-colors group-hover:text-teal-600 dark:text-zinc-100">
                          {queue.patient?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <span
                          className={`inline-flex min-w-[100px] items-center justify-center rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase ${STATUS_CLASSES[queue.status]}`}
                        >
                          {STATUS_LABEL[queue.status]}
                        </span>
                      </td>
                      
                      <td
                        className="sticky right-0 bg-inherit p-6 pr-8 text-right shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          
                          {ACTIVE_STATUSES.includes(queue.status) && (
                            <button
                              type="button"
                              onClick={() => setCdssQueue(queue)}
                              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] font-bold tracking-widest text-violet-600 uppercase transition-all hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
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
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold tracking-widest text-amber-700 uppercase transition-all hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                            >
                              Catatan
                            </button>
                          )}

                          <Menu as="div" className="relative inline-block text-left">
                            <div>
                              <MenuButton className="flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300">
                                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                              </MenuButton>
                            </div>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <MenuItems className="absolute right-0 z-50 mt-2 w-max min-w-[180px] origin-top-right divide-y divide-slate-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-zinc-800 dark:bg-[#1e1f20] dark:ring-white/10">
                                <div className="py-1">
                                  {getAllowedQueueTransitions(queue.status)
                                    .filter((nextStatus) => nextStatus !== QueueStatus.CANCELLED)
                                    .map((nextStatus) => {
                                      const blocked = isBlocked && ACTIVE_STATUSES.includes(nextStatus)
                                      return (
                                        <MenuItem key={nextStatus}>
                                          {({ active }) => (
                                            <button
                                              disabled={blocked}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                void handleUpdateQueueStatus(queue.id, queue.status, nextStatus)
                                              }}
                                              title={blocked ? 'Selesaikan pasien saat ini terlebih dahulu' : QUEUE_TRANSITION_TITLES[nextStatus]}
                                              className={`${
                                                active
                                                  ? 'bg-slate-50 text-teal-600 dark:bg-zinc-800 dark:text-teal-400'
                                                  : 'text-slate-700 dark:text-zinc-300'
                                              } group flex w-full items-center px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40`}
                                            >
                                              {QUEUE_TRANSITION_LABELS[nextStatus]}
                                            </button>
                                          )}
                                        </MenuItem>
                                      )
                                    })}
                                    
                                  {(
                                    [
                                      QueueStatus.WAITING,
                                      QueueStatus.CALLED,
                                      QueueStatus.SKIPPED,
                                    ] as QueueStatus[]
                                  ).includes(queue.status) && (
                                    <MenuItem>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            void handleCancelQueue(queue.id, queue.status)
                                          }}
                                          className={`${
                                            active
                                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                              : 'text-rose-600 dark:text-rose-400'
                                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                                        >
                                          Batalkan Antrean
                                        </button>
                                      )}
                                    </MenuItem>
                                  )}
                                </div>
                              </MenuItems>
                            </Transition>
                          </Menu>
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
          <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-zinc-800 dark:bg-[#131314]/50">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{waitingQueues.length}</span> pasien menunggu · Panggil nomor antrean{' '}
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                {waitingQueues[0]?.department?.code}-{waitingQueues[0]?.queueNumber}
              </span>{' '}
              untuk memulai pemeriksaan.
            </p>
          </div>
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