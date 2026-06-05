import type { ChartOptions } from 'chart.js'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import apiClient from '../../lib/apiClient'
import { getChartTheme } from '../../lib/panelTheme'
import { useThemeStore } from '../../store/themeStore'
import CustomDatePicker from '../ui/CustomDatePicker'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const COLOR_PALETTE = [
  '#e11d48',
  '#d97706',
  '#059669',
  '#fbbf24',
  '#f43f5e',
  '#34d399',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
]

interface AnalyticsData {
  summary: {
    totalQueues: number
    totalDone: number
    totalCancelled: number
    totalSkipped: number
    completionRate: number
    cancellationRate: number
    avgWaitMinutes: number
  }
  byDate: Array<{ date: string; total: number; done: number; cancelled: number; skipped: number }>
  byDepartment: Array<{
    departmentId: string
    name: string
    code: string
    total: number
    done: number
    cancelled: number
    avgWaitMinutes: number
  }>
}

interface AppointmentStats {
  total: number
  byStatus: Record<string, number>
}

export default function AnalyticsView() {
  const isDark = useThemeStore((s) => s.theme) === 'dark'
  const chartTheme = getChartTheme(isDark)

  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [appointments, setAppointments] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)

  const handleApplyFilter = async () => {
    setLoading(true)
    try {
      const [analyticsRes, appointmentRes] = await Promise.all([
        apiClient.get('/queues/stats/analytics', { params: { from: fromDate, to: toDate } }),
        apiClient.get('/appointments/stats/overview', { params: { from: fromDate, to: toDate } }),
      ])
      setAnalytics(analyticsRes.data.data)
      setAppointments(appointmentRes.data.data)
    } catch (err) {
      console.error('Fetch analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [analyticsRes, appointmentRes] = await Promise.all([
          apiClient.get('/queues/stats/analytics', { params: { from: fromDate, to: toDate } }),
          apiClient.get('/appointments/stats/overview', { params: { from: fromDate, to: toDate } }),
        ])
        if (!cancelled) {
          setAnalytics(analyticsRes.data.data)
          setAppointments(appointmentRes.data.data)
        }
      } catch (err) {
        console.error('Fetch analytics error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fromDate, toDate])

  const setPresetDates = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days + 1)
    setFromDate(from.toISOString().split('T')[0])
    setToDate(to.toISOString().split('T')[0])
  }

  if (!analytics) {
    return (
      <div className="py-10 text-center text-slate-500 dark:text-zinc-400">Memuat data...</div>
    )
  }

  // Chart data
  const lineChartData = {
    labels: analytics.byDate.map((d) => {
      const date = new Date(d.date)
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Total',
        data: analytics.byDate.map((d) => d.total),
        borderColor: COLOR_PALETTE[0],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Selesai',
        data: analytics.byDate.map((d) => d.done),
        borderColor: COLOR_PALETTE[2],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Dibatalkan',
        data: analytics.byDate.map((d) => d.cancelled + d.skipped),
        borderColor: COLOR_PALETTE[1],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  }

  const barChartData = {
    labels: analytics.byDepartment.map((d) => d.name),
    datasets: [
      {
        label: 'Total',
        data: analytics.byDepartment.map((d) => d.total),
        backgroundColor: COLOR_PALETTE[0],
      },
      {
        label: 'Selesai',
        data: analytics.byDepartment.map((d) => d.done),
        backgroundColor: COLOR_PALETTE[2],
      },
      {
        label: 'Dibatalkan',
        data: analytics.byDepartment.map((d) => d.cancelled),
        backgroundColor: COLOR_PALETTE[1],
      },
    ],
  }

  const sharedScale = {
    y: {
      beginAtZero: true,
      ticks: { color: chartTheme.text, font: { size: 11 } },
      grid: { color: chartTheme.grid, display: true },
    },
    x: {
      ticks: { color: chartTheme.text, font: { size: 11 } },
      grid: { display: false },
    },
  }

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12, weight: 'bold' }, color: chartTheme.text },
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        titleColor: chartTheme.tooltipTitle,
        bodyColor: chartTheme.tooltipBody,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
      },
    },
    scales: sharedScale,
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12, weight: 'bold' }, color: chartTheme.text },
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        titleColor: chartTheme.tooltipTitle,
        bodyColor: chartTheme.tooltipBody,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
      },
    },
    scales: sharedScale,
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Analitik Performa
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">Analisis mendalam terhadap performa antrian dan reservasi.</p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full md:w-64">
            <CustomDatePicker
              label="Dari Tanggal"
              value={fromDate}
              onChange={(val) => setFromDate(val)}
            />
          </div>
          <div className="w-full md:w-64">
            <CustomDatePicker
              label="Sampai Tanggal"
              value={toDate}
              onChange={(val) => setToDate(val)}
            />
          </div>
          
          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700 disabled:bg-slate-400 dark:bg-teal-500 dark:text-zinc-900 dark:hover:bg-teal-400"
          >
            {loading ? 'Memuat...' : 'Terapkan Filter'}
          </button>
          
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPresetDates(1)}
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-900 dark:hover:bg-teal-400"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPresetDates(7)}
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-900 dark:hover:bg-teal-400"
            >
              7 Hari
            </button>
            <button
              onClick={() => setPresetDates(30)}
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-teal-700 dark:bg-teal-500 dark:text-zinc-900 dark:hover:bg-teal-400"
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <p className="mb-2 text-sm text-slate-500 dark:text-zinc-400">Total Antrian</p>
          <p className="text-3xl text-teal-600 dark:text-teal-400">{analytics.summary.totalQueues}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <p className="mb-2 text-sm text-slate-500 dark:text-zinc-400">Tingkat Selesai</p>
          <p className="text-3xl text-emerald-600 dark:text-emerald-400">
            {analytics.summary.completionRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <p className="mb-2 text-sm text-slate-500 dark:text-zinc-400">Rata-rata Tunggu</p>
          <p className="text-3xl text-indigo-600 dark:text-indigo-400">
            {analytics.summary.avgWaitMinutes}m
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <p className="mb-2 text-sm text-slate-500 dark:text-zinc-400">Total Reservasi</p>
          <p className="text-3xl text-amber-600 dark:text-amber-400">{appointments?.total || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <h3 className="mb-6 text-zinc-950 dark:text-zinc-100">Tren Harian</h3>
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <h3 className="mb-6 text-zinc-950 dark:text-zinc-100">Perbandingan Departemen</h3>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
        <h3 className="mb-6 text-lg text-zinc-950 dark:text-zinc-100">Detail per Departemen</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314]">
              <tr>
                <th className="p-4 pl-6 text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                  Departemen
                </th>
                <th className="p-4 text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                  Total
                </th>
                <th className="p-4 text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                  Selesai
                </th>
                <th className="p-4 text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                  Dibatalkan
                </th>
                <th className="p-4 text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                  Selesai %
                </th>
                <th className="p-4 pr-6 text-right text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
                  Avg Tunggu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1e1f20] text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {analytics.byDepartment.map((dept) => (
                <tr
                  key={dept.departmentId}
                  className="border-b border-slate-100 dark:border-zinc-800 transition-colors last:border-0 hover:bg-slate-50/50 dark:hover:bg-[#131314]/50"
                >
                  <td className="p-4 pl-6">{dept.name}</td>
                  <td className="p-4">{dept.total}</td>
                  <td className="p-4">{dept.done}</td>
                  <td className="p-4">{dept.cancelled}</td>
                  <td className="p-4">
                    {dept.total > 0 ? Math.round((dept.done / dept.total) * 100) : 0}%
                  </td>
                  <td className="p-4 pr-6 text-right">{dept.avgWaitMinutes}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservasi Summary */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
        <h3 className="mb-6 text-lg text-zinc-950 dark:text-zinc-100">Ringkasan Reservasi</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {appointments &&
            Object.entries(appointments.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] p-4 text-center"
              >
                <p className="text-2xl text-zinc-900 dark:text-zinc-100">{count}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 uppercase">{status}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
