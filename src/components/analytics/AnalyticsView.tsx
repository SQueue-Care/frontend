import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import apiClient from '../../lib/apiClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const COLOR_PALETTE = [
  '#e11d48', '#d97706', '#059669', '#fbbf24', '#f43f5e',
  '#34d399', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1',
];

interface AnalyticsData {
  summary: {
    totalQueues: number;
    totalDone: number;
    totalCancelled: number;
    totalSkipped: number;
    completionRate: number;
    cancellationRate: number;
    avgWaitMinutes: number;
  };
  byDate: Array<{ date: string; total: number; done: number; cancelled: number; skipped: number }>;
  byDepartment: Array<{
    departmentId: string;
    name: string;
    code: string;
    total: number;
    done: number;
    cancelled: number;
    avgWaitMinutes: number;
  }>;
}

interface AppointmentStats {
  total: number;
  byStatus: Record<string, number>;
}

export default function AnalyticsView() {
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [appointments, setAppointments] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const [analyticsRes, appointmentRes] = await Promise.all([
        apiClient.get('/queues/stats/analytics', { params: { from: fromDate, to: toDate } }),
        apiClient.get('/appointments/stats/overview', { params: { from: fromDate, to: toDate } }),
      ]);
      setAnalytics(analyticsRes.data.data);
      setAppointments(appointmentRes.data.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleApplyFilter();
  }, []);

  const setPresetDates = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };

  if (!analytics) {
    return <div className="text-center py-10">Memuat data...</div>;
  }

  // Chart data
  const lineChartData = {
    labels: analytics.byDate.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
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
  };

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
  };

  const chartOptions: any = {
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
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Analitik Performa</h1>
        <p className="text-slate-600">Analisis mendalam terhadap performa antrian dan reservasi.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-slate-400 transition-colors text-sm"
          >
            {loading ? 'Memuat...' : 'Terapkan Filter'}
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => {
                setPresetDates(1);
              }}
              className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                setPresetDates(7);
              }}
              className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              7 Hari
            </button>
            <button
              onClick={() => {
                setPresetDates(30);
              }}
              className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-slate-500 text-sm font-semibold mb-2">Total Antrian</p>
          <p className="text-3xl font-extrabold text-teal-600">{analytics.summary.totalQueues}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-slate-500 text-sm font-semibold mb-2">Tingkat Selesai</p>
          <p className="text-3xl font-extrabold text-emerald-600">{analytics.summary.completionRate}%</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-slate-500 text-sm font-semibold mb-2">Rata-rata Tunggu</p>
          <p className="text-3xl font-extrabold text-indigo-600">{analytics.summary.avgWaitMinutes}m</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-slate-500 text-sm font-semibold mb-2">Total Reservasi</p>
          <p className="text-3xl font-extrabold text-amber-600">{appointments?.total || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-zinc-950 mb-6">Tren Harian</h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-zinc-950 mb-6">Perbandingan Departemen</h3>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-zinc-950 mb-6 text-lg">Detail per Departemen</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Departemen</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selesai</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dibatalkan</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selesai %</th>
                <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Avg Tunggu</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-zinc-900 bg-white">
              {analytics.byDepartment.map((dept) => (
                <tr key={dept.departmentId} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="p-4 pl-6 font-bold">{dept.name}</td>
                  <td className="p-4">{dept.total}</td>
                  <td className="p-4">{dept.done}</td>
                  <td className="p-4">{dept.cancelled}</td>
                  <td className="p-4">{dept.total > 0 ? Math.round((dept.done / dept.total) * 100) : 0}%</td>
                  <td className="p-4 pr-6 text-right">{dept.avgWaitMinutes}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservasi Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-zinc-950 mb-6 text-lg">Ringkasan Reservasi</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {appointments && Object.entries(appointments.byStatus).map(([status, count]) => (
            <div key={status} className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
              <p className="text-2xl font-bold text-zinc-900">{count}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
