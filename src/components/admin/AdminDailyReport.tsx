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
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950">Laporan Kunjungan Harian</h1>
        <p className="text-slate-600">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Antrean</p>
          <p className="mt-1 text-2xl font-extrabold text-zinc-900">{summary?.totalQueues ?? queues.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-xs font-bold text-emerald-700 uppercase">Selesai</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-800">
            {summary?.totalDone ?? completedToday.length}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
          <p className="text-xs font-bold text-rose-700 uppercase">Dibatalkan</p>
          <p className="mt-1 text-2xl font-extrabold text-rose-800">{summary?.totalCancelled ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-xs font-bold text-indigo-700 uppercase">Rata-rata Tunggu</p>
          <p className="mt-1 text-2xl font-extrabold text-indigo-800">
            {summary?.avgWaitMinutes != null ? `${summary.avgWaitMinutes} mnt` : '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="">Semua Poliklinik</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {summary && (
          <span className="text-sm font-semibold text-teal-700">
            Tingkat selesai: {summary.completionRate}%
          </span>
        )}
      </div>

      {byDepartment.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-zinc-900">Selesai per Poliklinik</h3>
          <div className="space-y-2">
            {byDepartment.map((row) => (
              <div key={row.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2">
                <span className="font-medium">{row.name}</span>
                <span className="font-bold text-teal-700">{row.done}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-zinc-900">Detail Kunjungan Selesai ({completedToday.length})</h3>
        </div>
        {isLoadingTable ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
          </div>
        ) : completedToday.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500 italic">Belum ada kunjungan selesai hari ini.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedToday.map((q: Queue) => (
              <div key={q.id} className="px-6 py-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-zinc-900">
                      {q.patient?.user?.name ?? 'Pasien'} · #{q.queueNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {q.department?.name} · {q.doctor?.user?.name ?? 'Dokter'}
                      {q.actualWaitMinutes != null && ` · tunggu ${q.actualWaitMinutes} mnt`}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 uppercase">
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
