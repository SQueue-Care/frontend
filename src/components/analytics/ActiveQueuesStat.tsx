import {
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { QueueStatus } from '../../lib/types'
import { useDashboardFilterStore } from '../../store/dashboardFilterStore'
import { useQueueStore } from '../../store/queueStore'
import StatCard from '../ui/StatCard'

export default function ActiveQueuesStat() {
  const { queues, isLoadingTable, errorTable } = useQueueStore()
  const { selectedDepartment } = useDashboardFilterStore()

  const activeQueuesCount = useMemo(() => {
    // Kita filter antrean yang statusnya aktif (Waiting, Called, In Progress) dari manapun tanggalnya
    const activeStatuses: QueueStatus[] = [
      QueueStatus.WAITING,
      QueueStatus.CALLED,
      QueueStatus.IN_PROGRESS,
    ]

    let result = queues.filter((q) => activeStatuses.includes(q.status))

    if (selectedDepartment) {
      result = result.filter((q) => q.department?.id === selectedDepartment)
    }

    return result.length
  }, [queues, selectedDepartment])

  // Loading state menggunakan indikator tabel karena 'queues' adalah sumber data kita sekarang
  if (isLoadingTable && queues.length === 0) {
    return (
      <StatCard
        title="Antrean Aktif"
        value={<ArrowPathIcon className="h-6 w-6 animate-spin text-slate-500 dark:text-zinc-400" />}
        icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        description="Sinkronisasi data..."
      />
    )
  }

  if (errorTable && queues.length === 0) {
    return (
      <StatCard
        title="Antrean Aktif"
        value={<ExclamationTriangleIcon className="h-6 w-6 text-red-500" />}
        icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        description="Gagal memuat data."
      />
    )
  }

  return (
    <StatCard
      title="Antrean Aktif"
      value={activeQueuesCount}
      icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
      description="Pasien menunggu & dipanggil"
    />
  )
}
