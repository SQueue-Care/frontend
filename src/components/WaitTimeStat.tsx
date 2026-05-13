// src/components/WaitTimeChart.tsx
import { useEffect } from 'react';
import StatCard from './StatCard';
import { useDepartmentStore } from '../store/departmentStore';
import { usePredictionStore } from '../store/predictionStore';
import { ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function WaitTimeStat() {
  // Ambil data dan fungsi dari kedua store
  const { departments, fetchDepartments } = useDepartmentStore();
  const { waitTimeEstimate, isLoading, error, fetchWaitTime } = usePredictionStore();

  // 1. Ambil daftar departemen saat komponen pertama kali dimuat
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // 2. Setelah departemen didapat, ambil prediksi untuk departemen pertama
  useEffect(() => {
    if (departments.length > 0) {
      // Menggunakan ID departemen pertama sebagai default
      fetchWaitTime(departments[0].id);
    }
  }, [departments, fetchWaitTime]);

  // Tampilan saat loading
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

  // Tampilan saat terjadi error
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

  // Tampilan default/sukses
  const estimatedMinutes = waitTimeEstimate?.estimatedMinutes ?? 0;

  return (
    <StatCard
      title="Waktu Tunggu Rata-rata"
      value={`${estimatedMinutes} Menit`}
      icon={<ClockIcon className="w-6 h-6" />}
      description={
        departments.length > 0 
        ? `Estimasi untuk ${departments[0].name}`
        : 'Tidak ada data departemen'
      }
    />
  );
}