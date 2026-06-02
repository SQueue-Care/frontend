import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDepartmentStore } from '../../store/departmentStore'

export default function AdminDepartmentsOverview() {
  const { departments, fetchDepartments, isLoading } = useDepartmentStore()

  useEffect(() => {
    void fetchDepartments()
  }, [fetchDepartments])

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">Poliklinik & Lokasi</h1>
          <p className="text-slate-600 dark:text-zinc-400">
            Informasi ruang tunggu, pemeriksaan, kasir, dan apotek per departemen (alur kunjungan pasien).
          </p>
        </div>
        <Link
          to="/admin/services"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm text-white hover:bg-teal-700"
        >
          Kelola Layanan & Jadwal
        </Link>
      </div>

      {isLoading && departments.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
        </div>
      ) : departments.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500 dark:text-zinc-400">Belum ada data poliklinik.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {departments.map((dept) => (
            <article
              key={dept.id}
              className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 text-[10px] tracking-wider text-teal-700 dark:text-teal-400 uppercase">
                    {dept.code}
                  </span>
                  <h2 className="mt-2 font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-zinc-100">{dept.name}</h2>
                  {dept.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{dept.description}</p>
                  )}
                </div>
                {typeof dept.activeQueueCount === 'number' && (
                  <span className="shrink-0 rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-400">
                    {dept.activeQueueCount} antrean aktif
                  </span>
                )}
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex gap-2 rounded-lg bg-slate-50 dark:bg-[#131314] px-3 py-2">
                  <dt className="w-28 shrink-0 text-slate-500 dark:text-zinc-400">Gedung</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">{dept.building || 'Gedung Utama'}</dd>
                </div>
                <div className="flex gap-2 rounded-lg bg-slate-50 dark:bg-[#131314] px-3 py-2">
                  <dt className="w-28 shrink-0 text-slate-500 dark:text-zinc-400">Ruang Tunggu</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">{dept.waitingRoomName || '—'}</dd>
                </div>
                <div className="flex gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2">
                  <dt className="w-28 shrink-0 text-indigo-600 dark:text-indigo-400">Pemeriksaan</dt>
                  <dd className="font-medium text-indigo-900 dark:text-indigo-300">{dept.examinationRoom || '—'}</dd>
                </div>
                <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3 py-2">
                  <dt className="w-28 shrink-0 text-amber-700 dark:text-amber-400">Kasir Admin</dt>
                  <dd className="font-medium text-amber-900 dark:text-amber-300">{dept.adminCounter || '—'}</dd>
                </div>
                <div className="flex gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2">
                  <dt className="w-28 shrink-0 text-emerald-700 dark:text-emerald-400">Apotek</dt>
                  <dd className="font-medium text-emerald-900">{dept.pharmacyLocation || '—'}</dd>
                </div>
              </dl>

              {dept.doctors && dept.doctors.length > 0 && (
                <div className="mt-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <p className="mb-2 text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">Dokter</p>
                  <div className="flex flex-wrap gap-2">
                    {dept.doctors.map((d) => (
                      <span
                        key={d.id}
                        className="rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] px-2.5 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {d.user?.name ?? 'Dokter'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
