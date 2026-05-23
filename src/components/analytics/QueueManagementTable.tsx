import { useMemo } from 'react'
import { QueueStatus } from '../../lib/types'
import { useDashboardFilterStore } from '../../store/dashboardFilterStore'
import { useQueueStore } from '../../store/queueStore'

// Helper untuk styling status
const statusStyles: Record<
  QueueStatus,
  { text: string; bg: string; border: string; icon?: React.ReactNode }
> = {
  [QueueStatus.WAITING]: { text: 'Menunggu', bg: 'bg-slate-50', border: 'border-slate-200' },
  [QueueStatus.CALLED]: { text: 'Dipanggil', bg: 'bg-blue-50', border: 'border-blue-200' },
  [QueueStatus.IN_PROGRESS]: { text: 'Diperiksa', bg: 'bg-amber-50', border: 'border-amber-200' },
  [QueueStatus.DONE]: { text: 'Selesai', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  [QueueStatus.SKIPPED]: { text: 'Dilewati', bg: 'bg-gray-50', border: 'border-gray-200' },
  [QueueStatus.CANCELLED]: { text: 'Dibatalkan', bg: 'bg-rose-50', border: 'border-rose-200' },
}

const StatusBadge = ({ status }: { status: QueueStatus }) => {
  const style = statusStyles[status] || statusStyles.WAITING
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${style.bg} ${style.border} text-zinc-800`}
    >
      {style.text}
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
          <td colSpan={5} className="p-8 text-center text-slate-400 italic">
            Memuat data antrean...
          </td>
        </tr>
      )
    }

    if (errorTable) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-red-500 italic">
            {errorTable}
          </td>
        </tr>
      )
    }

    if (filteredQueues.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="p-8 text-center text-slate-400 italic">
            {queues.length === 0
              ? 'Tidak ada antrean terdeteksi.'
              : 'Pasien tidak ditemukan dalam daftar antrean.'}
          </td>
        </tr>
      )
    }

    return filteredQueues.map((item) => (
      <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
        <td className="p-4 pl-6">
          <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 font-mono font-extrabold text-slate-700">
            {item.department?.code || 'XX'}-{item.queueNumber}
          </span>
        </td>
        <td className="p-4">{item.patient?.user?.name || '-'}</td>
        <td className="p-4 text-slate-500">{item.department?.name || '-'}</td>
        <td className="p-4 text-slate-500">{item.doctor?.user?.name || '-'}</td>
        <td className="p-4">
          <StatusBadge status={item.status} />
        </td>
      </tr>
    ))
  }

  return (
    /* Kontainer Utama: Statis (Tanpa Efek Hover) */
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* HEADER & SEARCH BAR PREMIUM */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center">
        <div>
          <h3 className="font-['Manrope'] text-lg font-extrabold text-zinc-950">
            Live Queue Control
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Memantau antrean aktif dan riwayat terbaru.
          </p>
        </div>

        <div className="flex w-full items-center lg:w-auto">
          <div className="group relative w-full lg:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg
                className="h-4.5 w-4.5 text-slate-400 transition-colors duration-300 group-hover:text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pasien, Nama..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm font-medium text-zinc-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* AREA TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <th className="p-4 pl-6">No. Antrean</th>
              <th className="p-4">Nama Pasien</th>
              <th className="p-4">Poliklinik</th>
              <th className="p-4">Dokter</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-zinc-900">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  )
}
