import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import { useThemeStore } from '../../store/themeStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface RangeStatsData {
  date: string
  departments: Array<{
    departmentId: string
    code: string
    name: string
    total: number
  }>
}

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

export default function QueuePerformanceChart({ days = 7 }: { days: number }) {
  const [data, setData] = useState<RangeStatsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await apiClient.get('/queues/stats/range', {
          params: { days },
        })
        if (!cancelled) setData(response.data.data || [])
      } catch (err: unknown) {
        console.error('Gagal fetch analytics data:', err)
        if (!cancelled) {
          setError(getErrorMessage(err, 'Gagal memuat data analytics'))
          setData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [days])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600 transition-colors dark:border-teal-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-rose-500 transition-colors dark:text-rose-400 italic">{error}</p>
      </div>
    )
  }

  // Aggregate departments across all dates
  const allDepartments = Array.from(
    new Map(data.flatMap((d) => d.departments).map((dept) => [dept.departmentId, dept])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  // Prepare chart data
  const labels = data.map((d) => {
    const date = new Date(d.date)
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
  })

  const datasets = allDepartments.map((dept, idx) => ({
    label: dept.name,
    data: data.map((d) => {
      const deptData = d.departments.find((x) => x.departmentId === dept.departmentId)
      return deptData?.total ?? 0
    }),
    borderColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    pointBorderColor: isDark ? '#1e1f20' : '#fff',
    pointBorderWidth: 2,
  }))

  const textColor = isDark ? '#a1a1aa' : '#64748b' // zinc-400 : slate-500
  const gridColor = isDark ? '#27272a' : '#e2e8f0' // zinc-800 : slate-200
  const titleColor = isDark ? '#d4d4d8' : '#475569' // zinc-300 : slate-600

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12, weight: 'bold' },
          color: textColor,
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDark ? '#131314' : 'rgba(0, 0, 0, 0.8)',
        titleColor: isDark ? '#f4f4f5' : '#fff', // zinc-100 : white
        bodyColor: isDark ? '#d4d4d8' : '#fff', // zinc-300 : white
        borderColor: isDark ? '#27272a' : 'transparent', // zinc-800 : transparent
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} antrian`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
        grid: {
          color: gridColor,
          display: true,
        },
        title: {
          display: true,
          text: 'Total Antrian',
          color: titleColor,
          font: { size: 12, weight: 'bold' },
        },
      },
      x: {
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  }

  return <Line data={{ labels, datasets }} options={chartOptions} />
}
