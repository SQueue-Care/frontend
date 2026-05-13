import { useEffect } from 'react';
import StatCard from './StatCard';
import { usePredictionStore } from '../store/predictionStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore';
import { ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function WaitTimeStat() {
  const { waitTimeEstimate, isLoading, error, fetchWaitTime } = usePredictionStore();
  const { selectedDepartment } = useDashboardFilterStore();

  useEffect(() => {
    if (selectedDepartment) {
      fetchWaitTime(selectedDepartment);
    }
  }, [selectedDepartment, fetchWaitTime]);

  if (!selectedDepartment) {
    return (
      <StatCard
        title="Waktu Tunggu Rata-rata"
        value="-"
        icon={<ClockIcon className="w-6 h-6" />}
        description="Pilih poli spesifik untuk melihat estimasi"
      />
    );
  }

  if (isLoading) {
    return (
      <StatCard
        title="Waktu Tunggu Rata-rata"
        value={<ArrowPathIcon className="w-6 h-6 animate-spin text-slate-500" />}
        icon={<ClockIcon className="w-6 h-6" />}
        description="Memuat estimasi..."
      />
    );
  }

  if (error) {
    return (
      <StatCard
        title="Waktu Tunggu Rata-rata"
        value={<ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
        icon={<ClockIcon className="w-6 h-6" />}
        description="Gagal memuat data."
      />
    );
  }

  const estimatedMinutes = waitTimeEstimate?.estimatedMinutes ?? 0;

  return (
    <StatCard
      title="Waktu Tunggu Rata-rata"
      value={`${estimatedMinutes} Menit`}
      icon={<ClockIcon className="w-6 h-6" />}
      description="Estimasi saat ini"
    />
  );
}
