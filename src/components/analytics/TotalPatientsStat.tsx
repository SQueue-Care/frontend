import { ArrowPathIcon, ExclamationTriangleIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { useDashboardFilterStore } from '../../store/dashboardFilterStore'
import { useQueueStore } from '../../store/queueStore'
import StatCard from '../ui/StatCard'

export default function TotalPatientsStat() {
  const { overviewStats, isLoadingStats, errorStats } = useQueueStore()
  const { selectedDepartment } = useDashboardFilterStore()

  const totalPatientsCount = useMemo(() => {
    if (!overviewStats) return 0

    if (selectedDepartment) {
      const dept = overviewStats.departments.find((d) => d.departmentId === selectedDepartment)
      return dept ? dept.total : 0
    }

    return overviewStats.departments.reduce((sum, dept) => sum + dept.total, 0)
  }, [overviewStats, selectedDepartment])

  if (isLoadingStats && !overviewStats) {
    return (
      <StatCard
        title="Total Antrean Hari Ini"
        value={<ArrowPathIcon className="h-6 w-6 animate-spin text-slate-500 dark:text-zinc-400" />}
        icon={<UsersIcon className="h-6 w-6" />}
        description="Memuat data..."
      />
    )
  }

  if (errorStats) {
    return (
      <StatCard
        title="Total Antrean Hari Ini"
        value={<ExclamationTriangleIcon className="h-6 w-6 text-red-500" />}
        icon={<UsersIcon className="h-6 w-6" />}
        description="Gagal memuat data."
      />
    )
  }

  return (
    <StatCard
      title="Total Antrean Hari Ini"
      value={new Intl.NumberFormat('id-ID').format(totalPatientsCount)}
      icon={<UsersIcon className="h-6 w-6" />}
      description={selectedDepartment ? 'Di poli terpilih' : 'Di seluruh poliklinik'}
    />
  )
}
