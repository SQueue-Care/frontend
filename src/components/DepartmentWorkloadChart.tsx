// src/components/DepartmentWorkloadChart.tsx
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DepartmentWorkloadChart() {
  const data = {
    labels: ['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Mata', 'Poli Jantung', 'Poli THT'],
    datasets: [
      {
        data: [35, 15, 20, 10, 15, 5], // Persentase beban kerja
        backgroundColor: [
          '#e11d48', // Rose 600 (Umum/Jantung - Sangat Ramai)
          '#d97706', // Amber 600 (Gigi/Mata - Sedang)
          '#059669', // Emerald 600 (Anak/THT - Sepi)
          '#fbbf24', // Amber 400
          '#f43f5e', // Rose 500
          '#34d399', // Emerald 400
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Membuat lubang donat lebih besar agar elegan
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter', size: 11 },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        bodyFont: { family: 'Inter', size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return ` ${context.label}: ${context.raw}% Pasien`;
          }
        }
      },
    },
  };

  return (
    <div className="w-full h-[280px] relative">
      <Doughnut data={data} options={options} />
      {/* Teks di tengah Donat */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-30px]">
        <span className="text-3xl font-extrabold text-zinc-900 font-['Manrope']">100%</span>
        <span className="text-xs text-slate-500 font-semibold">Kapasitas</span>
      </div>
    </div>
  );
}