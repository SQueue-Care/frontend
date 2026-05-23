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
import { useAlertStore } from '../../store/alertStore'
import { useDepartmentStore } from '../../store/departmentStore'
import { useQueueStore } from '../../store/queueStore'

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
        <h2 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950">
          Daftar Antrean Aktif
        </h2>
        <p className="text-sm font-medium text-slate-500">
          Kelola dan perbarui status antrean aktif pasien secara real-time.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* AREA FILTER & SEARCH (Identik dengan Reservasi) */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari nama, NIK, atau no antrean..."
              value={queueSearchQuery}
              onChange={(e) => setQueueSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-zinc-800 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
            />
            <div className="absolute top-3.5 right-3 text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[200px]">
              <label className="absolute -top-2.5 left-3 z-10 bg-white px-1.5 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Filter Departemen
              </label>
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="relative z-0 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-semibold text-zinc-700 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              >
                <option value="">Semua Departemen</option>
                {departments.map((dept: Department) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center px-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative min-w-[200px]">
              <label className="absolute -top-2.5 left-3 z-10 bg-white px-1.5 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Status Antrean
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="relative z-0 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-semibold text-zinc-700 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              >
                <option value="">Semua Status</option>
                <option value="WAITING">Menunggu</option>
                <option value="CALLED">Dipanggil</option>
                <option value="IN_PROGRESS">Diperiksa</option>
                <option value="DONE">Selesai</option>
                <option value="SKIPPED">Dilewati</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center px-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL DATA ANTREAN */}
        {isLoadingTable ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
          </div>
        ) : errorTable ? (
          <div className="py-12 text-center text-sm font-bold text-rose-600 italic">
            {errorTable}
          </div>
        ) : sortedQueues.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 italic">
            {queueSearchQuery
              ? `Tidak ada antrean yang cocok dengan pencarian "${queueSearchQuery}"`
              : 'Belum ada data antrean yang sesuai dengan kriteria filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                <tr>
                  <th className="p-5 pl-8">No. Antrean</th>
                  <th className="p-5">Nama Pasien</th>
                  <th className="p-5">Dokter</th>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Waktu Tiba</th>
                  <th className="p-5">Estimasi Tunggu</th>
                  <th className="p-5">Departemen</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 pr-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-zinc-900">
                {sortedQueues.map((item) => {
                  const statusClasses: Record<string, string> = {
                    WAITING: 'bg-slate-50 text-slate-600 border-slate-200',
                    CALLED: 'bg-blue-50 text-blue-600 border-blue-200',
                    IN_PROGRESS: 'bg-amber-50 text-amber-600 border-amber-200',
                    DONE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    SKIPPED: 'bg-gray-50 text-gray-600 border-gray-200',
                    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200',
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
                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="p-5 pl-8">
                        <span className="inline-block rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 font-mono font-extrabold tracking-widest text-slate-700">
                          {item.department?.code}-{item.queueNumber}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="font-extrabold text-zinc-950 uppercase transition-colors group-hover:text-teal-600">
                          {item.patient?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">
                          {item.doctor?.user?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">
                          {new Date(item.queueDate).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[11px] font-black tracking-widest text-slate-600">
                          {item.checkInAt
                            ? new Date(item.checkInAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">
                          {item.prediction?.estimatedMin
                            ? `${item.prediction.estimatedMin} min`
                            : '-'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-700">
                          {item.department?.name || '-'}
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`rounded-lg border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${statusClasses[item.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}
                        >
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                      <td className="p-5 pr-8 text-right">
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
  )
}
