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
    return <div className="py-10 text-center">Memuat data...</div>
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

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12, weight: 'bold' } },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12, weight: 'bold' } },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950">
          Analitik Performa
        </h1>
        <p className="text-slate-600">Analisis mendalam terhadap performa antrian dan reservasi.</p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Dari Tanggal</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:bg-slate-400"
          >
            {loading ? 'Memuat...' : 'Terapkan Filter'}
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => {
                setPresetDates(1)
              }}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                setPresetDates(7)
              }}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              7 Hari
            </button>
            <button
              onClick={() => {
                setPresetDates(30)
              }}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-500">Total Antrian</p>
          <p className="text-3xl font-extrabold text-teal-600">{analytics.summary.totalQueues}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-500">Tingkat Selesai</p>
          <p className="text-3xl font-extrabold text-emerald-600">
            {analytics.summary.completionRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-500">Rata-rata Tunggu</p>
          <p className="text-3xl font-extrabold text-indigo-600">
            {analytics.summary.avgWaitMinutes}m
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-500">Total Reservasi</p>
          <p className="text-3xl font-extrabold text-amber-600">{appointments?.total || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold text-zinc-950">Tren Harian</h3>
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-bold text-zinc-950">Perbandingan Departemen</h3>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-zinc-950">Detail per Departemen</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 pl-6 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Departemen
                </th>
                <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Total
                </th>
                <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Selesai
                </th>
                <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Dibatalkan
                </th>
                <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Selesai %
                </th>
                <th className="p-4 pr-6 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Avg Tunggu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium text-zinc-900">
              {analytics.byDepartment.map((dept) => (
                <tr
                  key={dept.departmentId}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                >
                  <td className="p-4 pl-6 font-bold">{dept.name}</td>
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-zinc-950">Ringkasan Reservasi</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {appointments &&
            Object.entries(appointments.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"
              >
                <p className="text-2xl font-bold text-zinc-900">{count}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 uppercase">{status}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
