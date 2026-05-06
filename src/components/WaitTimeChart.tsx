// src/components/WaitTimeChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 1. Wajib mendaftarkan elemen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WaitTimeChart() {
  // 2. Data Simulasi Waktu Tunggu (08:00 - 16:00)
  const data = {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    datasets: [
      {
        label: 'Rata-rata Waktu Tunggu (Menit)',
        data: [15, 22, 35, 42, 28, 20, 30, 45, 18],
        borderColor: '#0d9488', // Teal 600
        backgroundColor: 'rgba(13, 148, 136, 0.1)', // Teal 600 transparan untuk efek fill
        borderWidth: 3,
        tension: 0.4, // Membuat garis melengkung mulus (smooth curve)
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0d9488',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // 3. Konfigurasi Tampilan Grafik
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Disembunyikan karena judul sudah jelas
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1e293b', // Slate 800
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9', // Slate 100
        },
        ticks: {
          font: { family: 'Inter' },
          color: '#64748b', // Slate 500
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter' },
          color: '#64748b',
        }
      }
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Line data={data} options={options} />
    </div>
  );
}