import { useMemo } from 'react'
import { QueueStatus } from '../../lib/types'
import { useDashboardFilterStore } from '../../store/dashboardFilterStore'
import { useQueueStore } from '../../store/queueStore'
import CustomSearchBar from '../ui/CustomSearchBar'

// Helper untuk styling status
const statusClasses: Record<string, string> = {
  WAITING:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  CALLED:
    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  IN_PROGRESS:
    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  DONE:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  SKIPPED:
    'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
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

const StatusBadge = ({ status }: { status: QueueStatus }) => {
  const classes = statusClasses[status] || statusClasses.WAITING
  const label = statusLabel[status] || status
  return (
    <span
      className={`inline-flex min-w-[120px] items-center justify-center rounded-lg border px-3.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${classes}`}
    >
      {label}
    </span>
  )
}

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
          <td colSpan={5} className="p-16 text-center text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500 animate-pulse">
            Memuat data antrean...
          </td>
        </tr>
      )
    }

    if (errorTable) {
      return (
        <tr>
          <td colSpan={5} className="p-16 text-center text-sm text-rose-600 dark:text-rose-400 italic">
            {errorTable}
          </td>
        </tr>
      )
    }

    if (filteredQueues.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500">
            {queues.length === 0
              ? 'Tidak ada antrean terdeteksi.'
              : 'Pasien tidak ditemukan dalam daftar antrean.'}
          </td>
        </tr>
      )
    }

    return filteredQueues.map((item) => (
      <tr key={item.id} className="group transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
        <td className="p-6 pl-8 align-top">
          <span className="inline-block rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 px-3 py-1 font-mono tracking-widest text-slate-700 dark:text-zinc-300 shadow-sm">
            {item.department?.code || 'XX'}-{item.queueNumber}
          </span>
        </td>
        <td className="p-6 align-top">
          <div className="font-medium text-zinc-950 dark:text-white uppercase transition-colors group-hover:text-teal-600">
            {item.patient?.user?.name || '-'}
          </div>
        </td>
        <td className="p-6 align-top">
          <div className="text-slate-700 dark:text-slate-300">
            {item.department?.name || '-'}
          </div>
        </td>
        <td className="p-6 align-top">
          <div className="text-slate-700 dark:text-slate-300">
            {item.doctor?.user?.name || '-'}
          </div>
        </td>
        <td className="p-6 pr-8 align-top">
          <StatusBadge status={item.status} />
        </td>
      </tr>
    ))
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
      {/* HEADER & SEARCH BAR PREMIUM */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 dark:border-zinc-800 md:flex-row md:items-center bg-white dark:bg-[#1e1f20]">
        <div>
          <h3 className="font-['Manrope'] text-lg font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Live Queue Control
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Memantau antrean aktif dan riwayat terbaru.
          </p>
        </div>

        <div className="w-full md:w-72">
          <CustomSearchBar
            label="Cari Pasien"
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Cari ID Pasien, Nama..."
          />
        </div>
      </div>

      {/* AREA TABEL */}
      <div className="no-scrollbar overflow-x-auto bg-white dark:bg-[#1e1f20]">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
            <tr>
              <th className="p-6 pl-8">No. Antrean</th>
              <th className="p-6">Nama Pasien</th>
              <th className="p-6">Poliklinik</th>
              <th className="p-6">Dokter</th>
              <th className="p-6 pr-8">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  )
}
