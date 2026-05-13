import { useEffect } from 'react';
import StatCard from './StatCard';
import { usePatientStore } from '../store/patientStore';
import { UsersIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function TotalPatientsStat() {
  const { totalPatients, isLoading, error, fetchPatients } = usePatientStore();

  useEffect(() => {
    // Panggil API untuk mendapatkan data. Cukup ambil 1 item untuk mendapatkan metadata total.
    fetchPatients({ page: 1, pageSize: 1 });
  }, [fetchPatients]);

  const value = new Intl.NumberFormat('id-ID').format(totalPatients);

  if (isLoading && totalPatients === 0) {
    return (
      <StatCard
        title="Total Pasien"
        value={<ArrowPathIcon className="w-6 h-6 animate-spin text-slate-500" />}
        icon={<UsersIcon className="w-6 h-6" />}
        description="Memuat data..."
      />
    );
  }

  if (error) {
    return (
      <StatCard
        title="Total Pasien"
        value={<ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
        icon={<UsersIcon className="w-6 h-6" />}
        description="Gagal memuat data."
      />
    );
  }

  return (
    <StatCard
      title="Total Pasien"
      value={value}
      icon={<UsersIcon className="w-6 h-6" />}
      description="Jumlah seluruh pasien terdaftar"
    />
  );
}
