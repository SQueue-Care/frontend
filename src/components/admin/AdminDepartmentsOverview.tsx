import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDepartmentStore } from '../../store/departmentStore'

export default function AdminDepartmentsOverview() {
  const { departments, fetchDepartments, isLoading } = useDepartmentStore()

  useEffect(() => {
    void fetchDepartments()
  }, [fetchDepartments])

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 dark:border-teal-500/20 dark:bg-teal-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400"></span>
            <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase dark:text-teal-400">
              Direktori Fasilitas
            </span>
          </div>
          <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
            Poliklinik & Lokasi
          </h1>
          <p className="font-['Inter'] text-sm font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">
            Informasi ruang tunggu, ruang pemeriksaan, loket kasir, dan apotek per departemen untuk memandu alur kunjungan pasien.
          </p>
        </div>
        <Link
          to="/admin/services"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:text-zinc-900 dark:shadow-teal-900/40 dark:hover:bg-teal-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Kelola Layanan
        </Link>
      </div>

      {/* Content Section */}
      {isLoading && departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-b-teal-600 dark:border-zinc-800 dark:border-b-teal-500" />
          <p className="mt-4 text-xs tracking-widest text-slate-400 uppercase dark:text-zinc-500">Memuat Fasilitas...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 dark:border-zinc-800 dark:bg-[#131314]">
          <svg className="mb-4 h-12 w-12 text-slate-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Belum ada data poliklinik terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {departments.map((dept) => (
            <article
              key={dept.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-800/50"
            >
              {/* Background Accent Gradient */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-50/50 blur-3xl transition-opacity group-hover:opacity-100 dark:bg-teal-900/10 opacity-0 duration-500"></div>

              <div>
                {/* Card Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 font-mono text-[10px] tracking-widest text-slate-600 uppercase dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-400">
                      {dept.code}
                    </span>
                    <h2 className="mt-3 font-['Manrope'] text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      {dept.name}
                    </h2>
                    {dept.description && (
                      <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-zinc-400 line-clamp-2">
                        {dept.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Real-time Active Queue Badge */}
                  {typeof dept.activeQueueCount === 'number' && (
                    <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse"></div>
                      <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                        {dept.activeQueueCount} Aktif
                      </span>
                    </div>
                  )}
                </div>

                {/* REVISI: Lokasi - Bento Style Grid DENGAN TATA LETAK FLAT */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors group-hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-[#131314]/50 dark:group-hover:bg-[#131314]">
                    <span className="mb-1 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">Gedung / Bangunan</span>
                    <span className="block font-medium text-zinc-800 dark:text-zinc-200 text-sm leading-snug">{dept.building || 'Gedung Utama'}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors group-hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-[#131314]/50 dark:group-hover:bg-[#131314]">
                    <span className="mb-1 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">Ruang Tunggu</span>
                    <span className="block font-medium text-zinc-800 dark:text-zinc-200 text-sm leading-snug">{dept.waitingRoomName || '—'}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors group-hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-[#131314]/50 dark:group-hover:bg-[#131314]">
                    <span className="mb-1 block text-[10px] tracking-widest text-indigo-400/80 uppercase dark:text-indigo-500/80">R. Pemeriksaan</span>
                    <span className="block font-medium text-indigo-900 dark:text-indigo-300 text-sm leading-snug">{dept.examinationRoom || '—'}</span>
                  </div>
                  {/* Kasir kini mendapatkan porsi 50% penuh di baris kedua */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors group-hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-[#131314]/50 dark:group-hover:bg-[#131314]">
                    <span className="mb-1 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">Kasir Admin</span>
                    <span className="block font-medium text-zinc-800 dark:text-zinc-200 text-sm leading-snug">{dept.adminCounter || '—'}</span>
                  </div>
                  {/* Apotek kini membentang penuh 100% (col-span-2) di baris ketiga */}
                  <div className="col-span-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors group-hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-[#131314]/50 dark:group-hover:bg-[#131314]">
                    <span className="mb-1 block text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">Instalasi Farmasi / Apotek</span>
                    <span className="block font-medium text-zinc-800 dark:text-zinc-200 text-sm leading-snug">{dept.pharmacyLocation || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Doctors List */}
              {dept.doctors && dept.doctors.length > 0 && (
                <div className="mt-auto border-t border-slate-100 pt-5 dark:border-zinc-800/80">
                  <p className="mb-3 text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                    Tim Medis ({dept.doctors.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dept.doctors.map((d) => (
                      <span
                        key={d.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500/80"></div>
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