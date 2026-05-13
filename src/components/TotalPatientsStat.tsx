import { useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import { useQueueStore } from '../store/queueStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore';
import { UsersIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function TotalPatientsStat() {
  const { overviewStats, isLoadingStats, errorStats, fetchOverviewStats } = useQueueStore();
  const { selectedDepartment } = useDashboardFilterStore();

  useEffect(() => {
    fetchOverviewStats();
  }, [fetchOverviewStats]);

  const totalPatientsCount = useMemo(() => {
    if (!overviewStats) return 0;
    
    if (selectedDepartment) {
      const dept = overviewStats.departments.find(d => d.departmentId === selectedDepartment);
      return dept ? dept.total : 0;
    }

    return overviewStats.departments.reduce((sum, dept) => sum + dept.total, 0);
  }, [overviewStats, selectedDepartment]);

  if (isLoadingStats && !overviewStats) {
    return (
      <StatCard
        title="Total Antrean Hari Ini"
        value={<ArrowPathIcon className="w-6 h-6 animate-spin text-slate-500" />}
        icon={<UsersIcon className="w-6 h-6" />}
        description="Memuat data..."
      />
    );
  }

  if (errorStats) {
    return (
      <StatCard
        title="Total Antrean Hari Ini"
        value={<ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
        icon={<UsersIcon className="w-6 h-6" />}
        description="Gagal memuat data."
      />
    );
  }

  return (
    <StatCard
      title="Total Antrean Hari Ini"
      value={new Intl.NumberFormat('id-ID').format(totalPatientsCount)}
      icon={<UsersIcon className="w-6 h-6" />}
      description={selectedDepartment ? "Di poli terpilih" : "Di seluruh poliklinik"}
    />
  );
}
