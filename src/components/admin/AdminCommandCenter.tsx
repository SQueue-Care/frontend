// src/components/AdminCommandCenter.tsx
import { useEffect, useState } from 'react'
import { useDashboardFilterStore } from '../../store/dashboardFilterStore'
import { useDepartmentStore } from '../../store/departmentStore'
import { useQueueStore } from '../../store/queueStore'
import ActiveQueuesStat from '../analytics/ActiveQueuesStat'
import DepartmentWorkloadChart from '../analytics/DepartmentWorkloadChart'
import QueueManagementTable from '../analytics/QueueManagementTable'
import QueuePerformanceChart from '../analytics/QueuePerformanceChart'
import TotalPatientsStat from '../analytics/TotalPatientsStat'
import WaitTimeStat from '../analytics/WaitTimeStat'
import StatCard from '../ui/StatCard'

export default function AdminCommandCenter() {
  const [analyticsDays, setAnalyticsDays] = useState(1)
  // KOREKSI 3: Panggil fetchDepartments
  const { departments, fetchDepartments } = useDepartmentStore()
  const { selectedDepartment, setSelectedDepartment } = useDashboardFilterStore()
  // KOREKSI 4: Panggil fungsi fetch antrean dan statistik
  const { fetchQueues, fetchOverviewStats } = useQueueStore()

  // KOREKSI 5: INJEKSI LOGIKA REAL-TIME POLLING & SINKRONISASI AWAL
  useEffect(() => {
    // 1. Pastikan data master departemen ditarik agar grafik donat memiliki label
    fetchDepartments()

    // 2. Tarik data analitik untuk mengisi overviewStats dan queues
    const fetchAllDashboardData = () => {
      if (typeof fetchQueues === 'function') fetchQueues()
      if (typeof fetchOverviewStats === 'function') fetchOverviewStats()
    }

    // Eksekusi seketika saat halaman Command Center dibuka
    fetchAllDashboardData()

    // Setup Polling: Sinkronisasi data setiap 15 detik
    const intervalId = setInterval(fetchAllDashboardData, 15000)

    // Pembersihan (Cleanup)
    return () => clearInterval(intervalId)
  }, [fetchDepartments, fetchQueues, fetchOverviewStats])

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-1 font-['Manrope'] text-2xl font-extrabold text-zinc-950 dark:text-zinc-100">
            Overview Antrean Hari Ini
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Pantau metrik operasional seluruh poliklinik secara real-time.
          </p>
        </div>

        {/* Dropdown Filter Poliklinik */}
        <div className="group relative w-full md:w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="relative z-10 block w-full cursor-pointer appearance-none rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] px-4 py-2.5 text-sm font-bold text-zinc-800 dark:text-zinc-200 shadow-sm transition-all hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
          >
            <option value="">Semua Poliklinik</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-3 text-slate-400 dark:text-zinc-500 transition-colors group-hover:text-teal-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <TotalPatientsStat />
        <WaitTimeStat />
        <ActiveQueuesStat />
        <StatCard
          title="Kepuasan Pasien"
          value="4.8/5"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          trend={{ value: '0.2', isPositive: true }}
          description="Rating layanan bulan ini"
        />
      </div>

      {/* Area Grafik Analitik */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Grafik Performa Antrean */}
        <div className="flex min-h-[400px] flex-col rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-['Manrope'] font-extrabold text-zinc-950 dark:text-zinc-100">
              Analitik Performa Antrean
            </h3>
            <select
              value={analyticsDays}
              onChange={(e) => setAnalyticsDays(parseInt(e.target.value))}
              className="cursor-pointer rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 transition-colors outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="1">Hari Ini</option>
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
            </select>
          </div>
          <div className="flex-1">
            <QueuePerformanceChart days={analyticsDays} />
          </div>
        </div>

        {/* Grafik Beban Kerja Departemen */}
        <div className="flex flex-col rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
          <h3 className="mb-6 font-['Manrope'] font-extrabold text-zinc-950 dark:text-zinc-100">
            Beban Kerja Departemen
          </h3>
          <div className="flex flex-1 items-center justify-center">
            <DepartmentWorkloadChart />
          </div>
        </div>
      </div>

      {/* Tabel Manajemen Antrean */}
      <div>
        <QueueManagementTable />
      </div>
    </div>
  )
}
