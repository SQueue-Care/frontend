import { useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import { useQueueStore } from '../store/queueStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore';
import { ExclamationTriangleIcon, ArrowPathIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { QueueStatus } from '../lib/types';

export default function ActiveQueuesStat() {
  const { overviewStats, isLoadingStats, errorStats, fetchOverviewStats } = useQueueStore();
  const { selectedDepartment } = useDashboardFilterStore();

  useEffect(() => {
    fetchOverviewStats();
  }, [fetchOverviewStats]);

  const activeQueuesCount = useMemo(() => {
    if (!overviewStats) return 0;

    let deptsToCount = overviewStats.departments;
    if (selectedDepartment) {
      deptsToCount = deptsToCount.filter(d => d.departmentId === selectedDepartment);
    }

    return deptsToCount.reduce((total, dept) => {
      const waiting = dept.counts[QueueStatus.WAITING] ?? 0;
      const inProgress = dept.counts[QueueStatus.IN_PROGRESS] ?? 0;
      const called = dept.counts[QueueStatus.CALLED] ?? 0;
      return total + waiting + inProgress + called;
    }, 0);
  }, [overviewStats, selectedDepartment]);

  if (isLoadingStats && !overviewStats) {
    return (
      <StatCard
        title="Antrean Aktif"
        value={<ArrowPathIcon className="w-6 h-6 animate-spin text-slate-500" />}
        icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
        description="Memuat data..."
      />
    );
  }

  if (errorStats) {
    return (
      <StatCard
        title="Antrean Aktif"
        value={<ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
        icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
        description="Gagal memuat data."
      />
    );
  }

  return (
    <StatCard
      title="Antrean Aktif"
      value={activeQueuesCount}
      icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
      description="Pasien menunggu & dipanggil"
    />
  );
}
