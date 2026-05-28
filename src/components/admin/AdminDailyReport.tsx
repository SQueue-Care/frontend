import { useEffect, useMemo, useState } from 'react'
import apiClient from '../../lib/apiClient'
import type { Queue } from '../../lib/types'
import { QueueStatus } from '../../lib/types'
import DoctorNotesDisplay from '../shared/DoctorNotesDisplay'
import { useDepartmentStore } from '../../store/departmentStore'
import { useQueueStore } from '../../store/queueStore'

interface AnalyticsSummary {
  summary: {
    totalQueues: number
    totalDone: number
    totalCancelled: number
    avgWaitMinutes: number
    completionRate: number
  }
}

import CustomSelect from '../ui/CustomSelect'

export default function AdminDailyReport() {
  const today = useMemo(() => new Date(), [])
  const { departments, fetchDepartments } = useDepartmentStore()
  const { queues, fetchQueues, isLoadingTable } = useQueueStore()
  const [summary, setSummary] = useState<AnalyticsSummary['summary'] | null>(null)
  const [deptFilter, setDeptFilter] = useState('')

  useEffect(() => {
    void fetchDepartments()
    void fetchQueues({ date: today })
  }, [fetchDepartments, fetchQueues, today])

  useEffect(() => {
    const from = today.toISOString().split('T')[0]
    void apiClient
      .get('/queues/stats/analytics', { params: { from, to: from } })
      .then((res) => setSummary(res.data.data?.summary ?? null))
      .catch(() => setSummary(null))
  }, [today])

  const completedToday = useMemo(() => {
    return queues.filter((q) => {
      if (q.status !== QueueStatus.DONE) return false
      if (deptFilter && q.department?.id !== deptFilter) return false
      return true
    })
  }, [queues, deptFilter])

  const byDepartment = useMemo(() => {
    const map = new Map<string, { name: string; done: number }>()
    for (const q of completedToday) {
      const id = q.department?.id ?? 'unknown'
      const name = q.department?.name ?? 'Lainnya'
      const cur = map.get(id) ?? { name, done: 0 }
      cur.done += 1
      map.set(id, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.done - a.done)
  }, [completedToday])

  const dateLabel = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">Laporan Kunjungan Harian</h1>
        <p className="text-slate-600 dark:text-zinc-400">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white dark:bg-[#1e1f20] p-5 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 uppercase">Total Antrean</p>
          <p className="mt-1 text-2xl text-zinc-900 dark:text-zinc-100">{summary?.totalQueues ?? queues.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-5">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase">Selesai</p>
          <p className="mt-1 text-2xl text-emerald-800 dark:text-emerald-400">
            {summary?.totalDone ?? completedToday.length}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-5">
          <p className="text-xs text-rose-700 dark:text-rose-400 uppercase">Dibatalkan</p>
          <p className="mt-1 text-2xl text-rose-800 dark:text-rose-400">{summary?.totalCancelled ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 p-5">
          <p className="text-xs text-indigo-700 dark:text-indigo-400 uppercase">Rata-rata Tunggu</p>
          <p className="mt-1 text-2xl text-indigo-800 dark:text-indigo-400">
            {summary?.avgWaitMinutes != null ? `${summary.avgWaitMinutes} mnt` : '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full md:w-64">
          <CustomSelect
            label="Filter Poliklinik"
            value={deptFilter}
            onChange={(val) => setDeptFilter(val)}
            options={[
              { value: '', label: 'Semua Poliklinik' },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
            placeholder="Semua Poliklinik"
          />
        </div>
        {summary && (
          <span className="text-sm text-teal-700 dark:text-teal-400 mt-2 md:mt-0">
            Tingkat selesai: {summary.completionRate}%
          </span>
        )}
      </div>

      {byDepartment.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm">
          <h3 className="mb-4 text-zinc-900 dark:text-zinc-100">Selesai per Poliklinik</h3>
          <div className="space-y-2">
            {byDepartment.map((row) => (
              <div key={row.name} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-[#131314] px-4 py-2">
                <span className="font-medium">{row.name}</span>
                <span className="text-teal-700 dark:text-teal-400">{row.done}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shadow-sm">
        <div className="border-b border-slate-100 dark:border-zinc-800 px-6 py-4">
          <h3 className="text-zinc-900 dark:text-zinc-100">Detail Kunjungan Selesai ({completedToday.length})</h3>
        </div>
        {isLoadingTable ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
          </div>
        ) : completedToday.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-zinc-400 italic">Belum ada kunjungan selesai hari ini.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {completedToday.map((q: Queue) => (
              <div key={q.id} className="px-6 py-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-zinc-900 dark:text-zinc-100">
                      {q.patient?.user?.name ?? 'Pasien'} · #{q.queueNumber}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {q.department?.name} · {q.doctor?.user?.name ?? 'Dokter'}
                      {q.actualWaitMinutes != null && ` · tunggu ${q.actualWaitMinutes} mnt`}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 uppercase">
                    Selesai
                  </span>
                </div>
                <DoctorNotesDisplay doctorNotes={q.doctorNotes} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
