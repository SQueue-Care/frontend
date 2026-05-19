import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import apiClient from '../../lib/apiClient';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface RangeStatsData {
  date: string;
  departments: Array<{
    departmentId: string;
    code: string;
    name: string;
    total: number;
  }>;
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
];

export default function QueuePerformanceChart({ days = 7 }: { days: number }) {
  const [data, setData] = useState<RangeStatsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/queues/stats/range', {
          params: { days },
        });
        setData(response.data.data || []);
      } catch (err: any) {
        console.error('Gagal fetch analytics data:', err);
        setError('Gagal memuat data analytics');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-sm text-rose-500 italic">{error}</p>
      </div>
    );
  }

  // Aggregate departments across all dates
  const allDepartments = Array.from(
    new Map(
      data.flatMap((d) => d.departments).map((dept) => [dept.departmentId, dept])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Prepare chart data
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  });

  const datasets = allDepartments.map((dept, idx) => ({
    label: dept.name,
    data: data.map((d) => {
      const deptData = d.departments.find((x) => x.departmentId === dept.departmentId);
      return deptData?.total ?? 0;
    }),
    borderColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
  }));

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12, weight: 'bold' },
          color: '#64748b',
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} antrian`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
        grid: {
          color: '#e2e8f0',
          display: true,
        },
        title: {
          display: true,
          text: 'Total Antrian',
          color: '#475569',
          font: { size: 12, weight: 'bold' },
        },
      },
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={{ labels, datasets }} options={chartOptions} />;
}
