// src/components/AdminQueueManagement.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import {
  getAllowedQueueTransitions,
  isValidQueueTransition,
  QUEUE_TRANSITION_CLASSES,
  QUEUE_TRANSITION_LABELS,
  QUEUE_TRANSITION_TITLES,
} from '../../lib/queueStateMachine'
import type { Department } from '../../lib/types'
import { QueueStatus } from '../../lib/types'
import { VISIT_STAGE_LABELS } from '../../lib/queueVisitFlow'
import { useAlertStore } from '../../store/alertStore'
import { useDepartmentStore } from '../../store/departmentStore'
import { useQueueStore } from '../../store/queueStore'
import CustomSearchBar from '../ui/CustomSearchBar'
import CustomSelect from '../ui/CustomSelect'

export default function AdminQueueManagement() {
  const { queues, isLoadingTable, errorTable, fetchQueues } = useQueueStore()
  const { departments } = useDepartmentStore()
  const showAlert = useAlertStore((s) => s.showAlert)

  // STATE BARU: Untuk Search Bar & Filter Antrean (Sama persis dengan Reservasi)
  const [queueSearchQuery, setQueueSearchQuery] = useState('')
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')

  useEffect(() => {
    fetchQueues()
  }, [fetchQueues])

  const handleUpdateStatus = async (
    id: string,
    currentStatus: QueueStatus,
    newStatus: QueueStatus
  ) => {
    if (!isValidQueueTransition(currentStatus, newStatus)) {
      showAlert('Transisi status tidak valid.', 'warning')
      return
    }

    try {
      await apiClient.patch(`/queues/${id}/status`, { status: newStatus })
      fetchQueues()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal mengubah status antrean.'), 'error')
    }
  }

  // LOGIKA PENYARINGAN DATA (Departemen, Status, & Teks Pencarian)
  const filteredQueues = queues.filter((item) => {
    const matchDept = !selectedDepartmentFilter || item.department?.id === selectedDepartmentFilter
    const matchStatus = !selectedStatusFilter || item.status === selectedStatusFilter
    const matchSearch =
      !queueSearchQuery ||
      item.patient?.user?.name?.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
      `${item.department?.code}-${item.queueNumber}`
        .toLowerCase()
        .includes(queueSearchQuery.toLowerCase()) ||
      item.patient?.nik?.includes(queueSearchQuery)

    return matchDept && matchStatus && matchSearch
  })

  // LOGIKA PENGURUTAN (Aktif di atas, Selesai/Batal di bawah)
  const activeStatuses: QueueStatus[] = [
    QueueStatus.WAITING,
    QueueStatus.CALLED,
    QueueStatus.IN_PROGRESS,
  ]
  const sortedQueues = [...filteredQueues].sort((a, b) => {
    const aActive = activeStatuses.includes(a.status) ? 0 : 1
    const bActive = activeStatuses.includes(b.status) ? 0 : 1
    if (aActive !== bActive) return aActive - bActive
    return new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime()
  })

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Daftar Antrean Aktif
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          Kelola dan perbarui status antrean aktif pasien secara real-time.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
        {/* AREA FILTER & SEARCH (Identik dengan Reservasi) */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="w-full md:w-72">
            <CustomSearchBar
              label="Cari Antrean"
              value={queueSearchQuery}
              onChange={(val) => setQueueSearchQuery(val)}
              placeholder="Cari nama, NIK, atau no antrean..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <CustomSelect
                label="Filter Departemen"
                value={selectedDepartmentFilter}
                onChange={(val) => setSelectedDepartmentFilter(val)}
                options={[
                  { value: '', label: 'Semua Departemen' },
                  ...departments.map((dept: Department) => ({ value: dept.id, label: dept.name })),
                ]}
                placeholder="Semua Departemen"
              />
            </div>

            <div className="min-w-[200px]">
              <CustomSelect
                label="Status Antrean"
                value={selectedStatusFilter}
                onChange={(val) => setSelectedStatusFilter(val)}
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'WAITING', label: 'Menunggu' },
                  { value: 'CALLED', label: 'Dipanggil' },
                  { value: 'IN_PROGRESS', label: 'Diperiksa' },
                  { value: 'DONE', label: 'Selesai' },
                  { value: 'SKIPPED', label: 'Dilewati' },
                  { value: 'CANCELLED', label: 'Dibatalkan' },
                ]}
                placeholder="Semua Status"
              />
            </div>
          </div>
        </div>

        {/* TABEL DATA ANTREAN */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          {isLoadingTable ? (
            <p className="p-16 text-center text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500 animate-pulse">
              Memuat antrean...
            </p>
          ) : errorTable ? (
            <p className="p-16 text-center text-sm text-rose-600 dark:text-rose-400 italic">
              {errorTable}
            </p>
          ) : sortedQueues.length === 0 ? (
            <p className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500">
              {queueSearchQuery
                ? `Tidak ada antrean yang cocok dengan pencarian "${queueSearchQuery}"`
                : 'Belum ada data antrean yang sesuai dengan kriteria filter.'}
            </p>
          ) : (
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                  <tr>
                    <th className="p-6 pl-8">No. Antrean</th>
                    <th className="p-6">Nama Pasien</th>
                    <th className="p-6">Dokter</th>
                    <th className="p-6">Tanggal</th>
                    <th className="p-6">Waktu Tiba</th>
                    <th className="p-6">Estimasi Tunggu</th>
                    <th className="p-6">Departemen</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
                  {sortedQueues.map((item) => {
                    const statusClasses: Record<string, string> = {
                      WAITING:
                        'bg-slate-50 dark:bg-[#131314] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800',
                      CALLED:
                        'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
                      IN_PROGRESS:
                        'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                      DONE:
                        'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                      SKIPPED:
                        'bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700',
                      CANCELLED:
                        'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                    }
                    const statusLabel: Record<string, string> = {
                      WAITING: 'Menunggu',
                      CALLED: 'Dipanggil',
                      IN_PROGRESS: 'Diperiksa',
                      DONE: 'Selesai',
                      SKIPPED: 'Dilewati',
                      CANCELLED: 'Dibatalkan',
                    }

                    return (
                      <tr
                        key={item.id}
                        className="group transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                      >
                        <td className="p-6 pl-8 align-top">
                          <span className="inline-block rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 px-3 py-1 font-mono tracking-widest text-slate-700 dark:text-zinc-300 shadow-sm">
                            {item.department?.code}-{item.queueNumber}
                          </span>
                        </td>
                        <td className="p-6 align-top">
                          <div className="font-medium text-zinc-950 dark:text-white uppercase transition-colors group-hover:text-teal-600">
                            {item.patient?.user?.name || '-'}
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <div className="text-slate-700 dark:text-slate-300">
                            {item.doctor?.user?.name || '-'}
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <div className="text-slate-700 dark:text-slate-300">
                            {new Date(item.queueDate).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                            {item.checkInAt
                              ? new Date(item.checkInAt).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <span className="rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400">
                            {item.prediction?.estimatedMin
                              ? `${item.prediction.estimatedMin} min`
                              : '-'}
                          </span>
                        </td>
                        <td className="p-6 align-top text-slate-700 dark:text-slate-300">
                          {item.department?.name || '-'}
                        </td>
                        <td className="p-6 align-top">
                          <span
                            className={`inline-flex min-w-[120px] items-center justify-center rounded-lg border px-3.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
                              statusClasses[item.status] ||
                              'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {statusLabel[item.status] || item.status}
                          </span>
                          {item.visitFlow?.currentStage && item.status === 'DONE' && (
                            <p className="mt-1 text-[10px] text-teal-700 dark:text-teal-400">
                              Tahap:{' '}
                              {VISIT_STAGE_LABELS[item.visitFlow.currentStage] ??
                                item.visitFlow.currentStage}
                            </p>
                          )}
                        </td>
                        <td className="p-6 pr-8 text-right align-top">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {getAllowedQueueTransitions(item.status).map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() => handleUpdateStatus(item.id, item.status, nextStatus)}
                                className={QUEUE_TRANSITION_CLASSES[nextStatus]}
                                title={QUEUE_TRANSITION_TITLES[nextStatus]}
                              >
                                {QUEUE_TRANSITION_LABELS[nextStatus]}
                              </button>
                            ))}
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
      </div>
    </div>
  )
}
