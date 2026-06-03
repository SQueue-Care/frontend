import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QueueStatus } from '../../lib/types'
import { useAuthStore } from '../../store/authStore'
import { useDoctorStore } from '../../store/doctorStore'
import { useQueueStore } from '../../store/queueStore'

export default function DoctorPracticeOverview() {
  const user = useAuthStore((s) => s.user)
  const { profile } = useDoctorStore()
  const { queues, fetchQueues, isLoadingTable } = useQueueStore()

  const departmentId = profile?.department?.id || profile?.departmentId
  const doctorId = profile?.id

  useEffect(() => {
    if (departmentId) {
      void fetchQueues({ departmentId, date: new Date() })
    }
  }, [departmentId, fetchQueues])

  const departmentQueues = useMemo(() => {
    if (!departmentId) return []
    return queues.filter((q) => q.department?.id === departmentId)
  }, [queues, departmentId])

  const stats = useMemo(() => {
    const waiting = departmentQueues.filter((q) => q.status === QueueStatus.WAITING).length
    const inProgress = departmentQueues.filter(
      (q) => q.status === QueueStatus.CALLED || q.status === QueueStatus.IN_PROGRESS
    ).length
    const done = departmentQueues.filter((q) => q.status === QueueStatus.DONE).length
    return { waiting, inProgress, done, total: departmentQueues.length }
  }, [departmentQueues])

  const activePatient = useMemo(() => {
    if (!doctorId) return null
    return (
      departmentQueues.find(
        (q) => (q.status === QueueStatus.CALLED || q.status === QueueStatus.IN_PROGRESS) && q.doctorId === doctorId
      ) ?? null
    )
  }, [departmentQueues, doctorId])

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      
      {/* HEADER */}
      <div className="max-w-3xl">
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Dashboard Praktik
        </h1>
        <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-zinc-400">
          Selamat datang, <span className="font-bold text-zinc-800 dark:text-zinc-200">{user?.name}</span>. 
          Berikut adalah metrik operasional dan status pasien Anda hari ini di poliklinik <span className="font-bold text-zinc-800 dark:text-zinc-200">{profile?.department?.name ?? 'yang ditugaskan'}</span>.
        </p>
      </div>

      {/* STATISTIK BENTO GRID */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-zinc-600"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Total Hari Ini</p>
          </div>
          <p className="font-['Manrope'] text-4xl font-extrabold text-zinc-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Menunggu</p>
          </div>
          <p className="font-['Manrope'] text-4xl font-extrabold text-amber-600 dark:text-amber-400">{stats.waiting}</p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Sedang Dilayani</p>
          </div>
          <p className="font-['Manrope'] text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.inProgress}</p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Selesai</p>
          </div>
          <p className="font-['Manrope'] text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.done}</p>
        </div>
      </div>

      {/* KARTU PASIEN AKTIF */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm dark:border-indigo-500/20 dark:bg-[#1e1f20]">
        {/* Aksen Garis & Latar Blur */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-500 dark:bg-indigo-400"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-50/50 blur-3xl dark:bg-indigo-900/10"></div>
        
        <div className="relative z-10">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-['Manrope'] text-xl font-extrabold text-zinc-900 dark:text-white">Pasien Saat Ini</h2>
            <Link
              to="/doctor/queues"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:text-zinc-900 dark:shadow-indigo-900/40 dark:hover:bg-indigo-400"
            >
              Buka Antrean
            </Link>
          </div>
          
          {isLoadingTable ? (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-b-indigo-600 dark:border-zinc-800 dark:border-b-indigo-500" />
            </div>
          ) : activePatient ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <span className="font-['Manrope'] text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {activePatient.queueNumber}
                </span>
              </div>
              <div>
                <p className="font-['Manrope'] text-xl font-bold uppercase text-zinc-900 dark:text-white">
                  {activePatient.patient?.user?.name}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500"></span>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    Status:{' '}
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {activePatient.status === QueueStatus.IN_PROGRESS ? 'Sedang diperiksa di ruangan' : 'Sudah dipanggil masuk'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Belum ada pasien aktif yang dipanggil. Silakan buka modul{' '}
              <Link to="/doctor/queues" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                antrean hari ini
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {/* TAUTAN MENU NAVIGASI CEPAT */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          to="/doctor/queues"
          className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-800/50"
        >
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-500/10 dark:text-teal-400 dark:group-hover:bg-teal-500 dark:group-hover:text-zinc-900">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-white">Antrean Hari Ini</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">Kelola pemeriksaan & pengisian rekam medis.</p>
          </div>
        </Link>

        <Link
          to="/doctor/appointments"
          className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-800/50"
        >
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-500/10 dark:text-teal-400 dark:group-hover:bg-teal-500 dark:group-hover:text-zinc-900">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M9 15h.008v.008H9V15zm0 2.25h.008v.008H9v-.008zM9 12.75h.008v.008H9v-.008zm3 2.25h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zm0-4.5h.008v.008H12v-.008zm3 2.25h.008v.008H15V15zm0 2.25h.008v.008H15v-.008zm0-4.5h.008v.008H15v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-white">Jadwal Reservasi</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">Lihat janji temu dan reservasi mendatang.</p>
          </div>
        </Link>

        <Link
          to="/doctor/patients"
          className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-800/50"
        >
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-500/10 dark:text-teal-400 dark:group-hover:bg-teal-500 dark:group-hover:text-zinc-900">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-white">Riwayat Pasien</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">Pencarian rekam medis dan data pasien.</p>
          </div>
        </Link>
      </div>

    </div>
  )
}