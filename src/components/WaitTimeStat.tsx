import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { usePredictionStore } from '../store/predictionStore';
import { useDashboardFilterStore } from '../store/dashboardFilterStore';
import apiClient from '../lib/apiClient';
import { useQueueStore } from '../store/queueStore';
import { QueueStatus } from '../lib/types';
import { ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function WaitTimeStat() {
  const { waitTimeEstimate, isLoading, error, fetchWaitTime } = usePredictionStore();
  const { selectedDepartment } = useDashboardFilterStore();
  const { overviewStats, isLoadingStats, errorStats, fetchOverviewStats } = useQueueStore();
  const [averageWaitTime, setAverageWaitTime] = useState<number | null>(null);
  const [isAverageLoading, setIsAverageLoading] = useState(false);
  const [averageError, setAverageError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDepartment) {
      fetchWaitTime(selectedDepartment);
      return;
    }

    if (!overviewStats) {
      fetchOverviewStats();
    }
  }, [selectedDepartment, fetchWaitTime, overviewStats, fetchOverviewStats]);

  useEffect(() => {
    if (selectedDepartment) {
      setAverageWaitTime(null);
      setAverageError(null);
      setIsAverageLoading(false);
      return;
    }

    if (!overviewStats?.departments.length) return;

    let cancelled = false;

    const fetchAverageWaitTime = async () => {
      setIsAverageLoading(true);
      setAverageError(null);

      try {
        const activeDepartments = overviewStats.departments
          .map((department) => ({
            departmentId: department.departmentId,
            activeCount:
              (department.counts[QueueStatus.WAITING] ?? 0) +
              (department.counts[QueueStatus.CALLED] ?? 0) +
              (department.counts[QueueStatus.IN_PROGRESS] ?? 0),
          }))
          .filter((department) => department.activeCount > 0);

        if (activeDepartments.length === 0) {
          if (!cancelled) setAverageWaitTime(0);
          return;
        }

        const results = await Promise.all(
          activeDepartments.map(async ({ departmentId, activeCount }) => {
            const response = await apiClient.get<{ data: { estimatedMinutes: number } }>(
              `/predictions/wait-time?departmentId=${departmentId}`
            );
            return {
              estimatedMinutes: response.data.data.estimatedMinutes,
              weight: activeCount,
            };
          })
        );

        if (cancelled) return;

        const totalWeight = results.reduce((sum, item) => sum + item.weight, 0);
        const weightedSum = results.reduce((sum, item) => sum + item.estimatedMinutes * item.weight, 0);
        const average = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

        setAverageWaitTime(average);
      } catch (err: any) {
        if (cancelled) return;
        setAverageError(err.response?.data?.message || err.message || 'Gagal memuat rata-rata waktu tunggu.');
      } finally {
        if (!cancelled) {
          setIsAverageLoading(false);
        }
      }
    };

    fetchAverageWaitTime();

    return () => {
      cancelled = true;
    };
  }, [selectedDepartment, overviewStats]);

  if (selectedDepartment) {
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
        description="Estimasi poli terpilih"
      />
    );
  }

  if (isLoadingStats || isAverageLoading) {
      return (
        <StatCard
          title="Waktu Tunggu Rata-rata"
          value={<ArrowPathIcon className="w-6 h-6 animate-spin text-slate-500" />}
          icon={<ClockIcon className="w-6 h-6" />}
        description="Memuat rata-rata semua poli..."
      />
    );
  }

  if (errorStats || averageError) {
    return (
      <StatCard
        title="Waktu Tunggu Rata-rata"
        value={<ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
        icon={<ClockIcon className="w-6 h-6" />}
        description={errorStats || averageError || 'Gagal memuat data.'}
      />
    );
  }

  return (
    <StatCard
      title="Waktu Tunggu Rata-rata"
      value={`${averageWaitTime ?? 0} Menit`}
      icon={<ClockIcon className="w-6 h-6" />}
      description="Rata-rata semua poli aktif"
    />
  );
}
