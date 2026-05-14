import { useMemo } from 'react';
import StatCard from './StatCard';
import { useDashboardFilterStore } from '../store/dashboardFilterStore';
import { useQueueStore } from '../store/queueStore';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function WaitTimeStat() {
  const { selectedDepartment } = useDashboardFilterStore();
  const { queues, isLoadingTable, errorTable } = useQueueStore();

  const averageWaitTime = useMemo(() => {
    const relevantQueues = queues.filter((queue) => {
      if (selectedDepartment && queue.department.id !== selectedDepartment) {
        return false;
      }
      return typeof queue.actualWaitMinutes === 'number';
    });

    if (!relevantQueues.length) {
      return null;
    }

    const total = relevantQueues.reduce((sum, queue) => sum + (queue.actualWaitMinutes ?? 0), 0);
    return Math.round(total / relevantQueues.length);
  }, [queues, selectedDepartment]);

  if (isLoadingTable && averageWaitTime == null) {
    return (
      <StatCard
        title="Waktu Tunggu Rata-rata"
        value="Memuat..."
        icon={<ClockIcon className="w-6 h-6" />}
        description={selectedDepartment ? 'Memuat rata-rata poli terpilih...' : 'Memuat rata-rata semua poli...'}
      />
    );
  }

  if (errorTable && averageWaitTime == null) {
    return (
      <StatCard
        title="Waktu Tunggu Rata-rata"
        value="-"
        icon={<ClockIcon className="w-6 h-6" />}
        description="Gagal memuat data antrean."
      />
    );
  }

  return (
    <StatCard
      title="Waktu Tunggu Rata-rata"
      value={`${averageWaitTime ?? 0} Menit`}
      icon={<ClockIcon className="w-6 h-6" />}
      description={selectedDepartment ? 'Rata-rata berdasarkan actualWaitMinutes poli terpilih' : 'Rata-rata berdasarkan actualWaitMinutes semua poli'}
    />
  );
}
