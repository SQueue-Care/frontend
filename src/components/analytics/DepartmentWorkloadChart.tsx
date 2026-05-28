// src/components/DepartmentWorkloadChart.tsx
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { TooltipItem } from 'chart.js'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { useDepartmentStore } from '../../store/departmentStore'
import { useQueueStore } from '../../store/queueStore'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLOR_PALETTE = [
  '#e11d48', // Rose 600
  '#d97706', // Amber 600
  '#059669', // Emerald 600
  '#fbbf24', // Amber 400
  '#f43f5e', // Rose 500
  '#34d399', // Emerald 400
  '#8b5cf6', // Violet 500
  '#06b6d4', // Cyan 500
  '#ec4899', // Pink 500
  '#6366f1', // Indigo 500
]

export default function DepartmentWorkloadChart() {
  const { overviewStats, isLoadingStats, errorStats } = useQueueStore()
  const {
    departments,
    isLoading: isLoadingDepartments,
    error: departmentError,
  } = useDepartmentStore()

  // Calculate workload percentage for each department
  const chartData = useMemo(() => {
    if (departments.length === 0) {
      return null
    }

    const statsByDepartmentId = new Map(
      overviewStats?.departments.map((dept) => [dept.departmentId, dept.total]) ?? []
    )

    const mergedDepartments = departments.map((department) => ({
      ...department,
      total: statsByDepartmentId.get(department.id) ?? 0,
    }))

    const totalPatients = mergedDepartments.reduce((sum, dept) => sum + dept.total, 0)
    const labels = mergedDepartments.map((dept) => dept.name)
    const data = mergedDepartments.map((dept) => {
      const percentage = totalPatients > 0 ? (dept.total / totalPatients) * 100 : 0
      return Math.round(percentage * 10) / 10 // Round to 1 decimal
    })

    return {
      labels,
      data,
      departments: mergedDepartments,
      totalPatients,
    }
  }, [departments, overviewStats])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { family: 'Inter', size: 10 },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        bodyFont: { family: 'Inter', size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: TooltipItem<'doughnut'>) {
            return ` ${context.label}: ${context.raw}%`
          },
        },
      },
    },
  }

  if (isLoadingStats || isLoadingDepartments) {
    return (
      <div className="flex h-[280px] w-full flex-col items-center justify-center">
        <ArrowPathIcon className="mb-2 h-8 w-8 animate-spin text-slate-400 dark:text-zinc-500" />
        <p className="text-sm text-slate-400 dark:text-zinc-500">Memuat data...</p>
      </div>
    )
  }

  if (errorStats || departmentError || !chartData) {
    return (
      <div className="flex h-[280px] w-full flex-col items-center justify-center">
        <ExclamationTriangleIcon className="mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {errorStats || departmentError || 'Tidak ada data'}
        </p>
      </div>
    )
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: COLOR_PALETTE.slice(0, chartData.labels.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }

  return (
    <div className="relative h-[280px] w-full">
      <Doughnut data={data} options={options} />
      {/* Teks di tengah Donat */}
      <div className="pointer-events-none absolute inset-0 mt-[-30px] flex flex-col items-center justify-center">
        <span className="font-['Manrope'] text-3xl text-zinc-900 dark:text-zinc-100">
          {chartData.totalPatients}
        </span>
        <span className="text-xs text-slate-500 dark:text-zinc-400">Total Pasien</span>
      </div>
    </div>
  )
}
