// src/components/AdminCommandCenter.tsx
import { useState } from 'react';
import StatCard from '../ui/StatCard';
import TotalPatientsStat from '../analytics/TotalPatientsStat';
import ActiveQueuesStat from '../analytics/ActiveQueuesStat';
import WaitTimeStat from '../analytics/WaitTimeStat';
import DepartmentWorkloadChart from '../analytics/DepartmentWorkloadChart';
import QueueManagementTable from '../analytics/QueueManagementTable';
import QueuePerformanceChart from '../analytics/QueuePerformanceChart';
import { useDepartmentStore } from '../../store/departmentStore';
import { useDashboardFilterStore } from '../../store/dashboardFilterStore';

export default function AdminCommandCenter() {
  const [analyticsDays, setAnalyticsDays] = useState(1);
  const { departments } = useDepartmentStore();
  const { selectedDepartment, setSelectedDepartment } = useDashboardFilterStore();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">
            Overview Antrean Hari Ini
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Pantau metrik operasional seluruh poliklinik secara real-time.
          </p>
        </div>

        {/* Dropdown Filter Poliklinik */}
        <div className="w-full md:w-64 relative group">
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-zinc-800 text-sm font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 hover:border-teal-300 block w-full px-4 py-2.5 shadow-sm transition-all cursor-pointer relative z-10"
          >
            <option value="">Semua Poliklinik</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-hover:text-teal-500 transition-colors z-20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TotalPatientsStat />
        <WaitTimeStat />
        <ActiveQueuesStat />
        <StatCard 
          title="Kepuasan Pasien" 
          value="4.8/5" 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
          trend={{ value: "0.2", isPositive: true }}
          description="Rating layanan bulan ini"
        />
      </div>

      {/* Area Grafik Analitik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         {/* Grafik Performa Antrean */}
         <div className="lg:col-span-2 min-h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-300 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-zinc-950 font-['Manrope']">Analitik Performa Antrean</h3>
              <select
                value={analyticsDays}
                onChange={(e) => setAnalyticsDays(parseInt(e.target.value))}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-600 px-3 py-1.5 cursor-pointer outline-none transition-colors"
              >
                <option value="1">Hari Ini</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
              </select>
            </div>
            <div className="flex-1">
              <QueuePerformanceChart days={analyticsDays} />
            </div>
         </div>

         {/* Grafik Beban Kerja Departemen */}
         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-300 p-6 flex flex-col">
            <h3 className="font-extrabold text-zinc-950 font-['Manrope'] mb-6">Beban Kerja Departemen</h3>
            <div className="flex-1 flex items-center justify-center">
              <DepartmentWorkloadChart />
            </div>
         </div>
      </div>

      {/* Tabel Manajemen Antrean */}
      <div>
        <QueueManagementTable />
      </div>
    </div>
  );
}