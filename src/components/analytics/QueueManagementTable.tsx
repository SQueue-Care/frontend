import { useMemo } from 'react'
import { QUEUE_STATUS_BADGE } from '../../lib/panelTheme'
import { QueueStatus } from '../../lib/types'
import { useDashboardFilterStore } from '../../store/dashboardFilterStore'
import { useQueueStore } from '../../store/queueStore'
import CustomSearchBar from '../ui/CustomSearchBar'

const STATUS_LABEL: Record<QueueStatus, string> = {
  [QueueStatus.WAITING]: 'Menunggu',
  [QueueStatus.CALLED]: 'Dipanggil',
  [QueueStatus.IN_PROGRESS]: 'Diperiksa',
  [QueueStatus.DONE]: 'Selesai',
  [QueueStatus.SKIPPED]: 'Dilewati',
  [QueueStatus.CANCELLED]: 'Dibatalkan',
}

const StatusBadge = ({ status }: { status: QueueStatus }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${QUEUE_STATUS_BADGE[status] ?? QUEUE_STATUS_BADGE[QueueStatus.WAITING]}`}
  >
    {STATUS_LABEL[status] ?? status}
  </span>
)

export default function QueueManagementTable() {
  const { queues, isLoadingTable, errorTable } = useQueueStore()
  const { searchQuery, setSearchQuery, selectedDepartment } = useDashboardFilterStore()

  const filteredQueues = useMemo(() => {
    let result = queues

    if (selectedDepartment) {
      result = result.filter((q) => q.department?.id === selectedDepartment)
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter((q) => {
        const patientName = q.patient?.user?.name || ''
        const deptCode = q.department?.code || ''
        const qNum = q.queueNumber || ''

        return (
          patientName.toLowerCase().includes(lowerQuery) ||
          `${deptCode}-${qNum}`.toLowerCase().includes(lowerQuery)
        )
      })
    }

    // Urutkan: Aktif (WAITING, CALLED, IN_PROGRESS) di atas
    const activeStatuses: QueueStatus[] = [
      QueueStatus.WAITING,
      QueueStatus.CALLED,
      QueueStatus.IN_PROGRESS,
    ]
    return [...result].sort((a, b) => {
      const aActive = activeStatuses.includes(a.status) ? 0 : 1
      const bActive = activeStatuses.includes(b.status) ? 0 : 1
      if (aActive !== bActive) return aActive - bActive
      return new Date(b.queueDate).getTime() - new Date(a.queueDate).getTime()
    })
  }, [queues, searchQuery, selectedDepartment])

  const renderTableBody = () => {
    if (isLoadingTable) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-zinc-500 italic">
            Memuat data antrean...
          </td>
        </tr>
      )
    }

    if (errorTable) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-rose-600 italic dark:text-rose-400">
            {errorTable}
          </td>
        </tr>
      )
    }

    if (filteredQueues.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-zinc-500 italic">
            {queues.length === 0
              ? 'Tidak ada antrean terdeteksi.'
              : 'Pasien tidak ditemukan dalam daftar antrean.'}
          </td>
        </tr>
      )
    }

    return filteredQueues.map((item) => (
      <tr key={item.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-[#131314]/50">
        <td className="p-4 pl-6">
          <span className="inline-block rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {item.department?.code || 'XX'}-{item.queueNumber}
          </span>
        </td>
        <td className="p-4">{item.patient?.user?.name || '-'}</td>
        <td className="p-4 text-slate-500 dark:text-zinc-400">{item.department?.name || '-'}</td>
        <td className="p-4 text-slate-500 dark:text-zinc-400">{item.doctor?.user?.name || '-'}</td>
        <td className="p-4">
          <StatusBadge status={item.status} />
        </td>
      </tr>
    ))
  }

  return (
    /* Kontainer Utama: Statis (Tanpa Efek Hover) */
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shadow-sm">
      {/* HEADER & SEARCH BAR PREMIUM */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 p-6 lg:flex-row lg:items-center">
        <div>
          <h3 className="font-['Manrope'] text-lg text-zinc-950 dark:text-zinc-100">
            Live Queue Control
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Memantau antrean aktif dan riwayat terbaru.
          </p>
        </div>

        <div className="flex w-full items-center lg:w-auto">
          <div className="w-full lg:w-80">
            <CustomSearchBar
              label="Cari Pasien"
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Cari ID Pasien, Nama..."
            />
          </div>
        </div>
      </div>

      {/* AREA TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
              <th className="p-4 pl-6">No. Antrean</th>
              <th className="p-4">Nama Pasien</th>
              <th className="p-4">Poliklinik</th>
              <th className="p-4">Dokter</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  )
}
