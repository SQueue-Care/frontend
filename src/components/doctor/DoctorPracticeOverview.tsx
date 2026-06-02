import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QueueStatus } from '../../lib/types'
import { doctor, panel } from '../../lib/panelTheme'
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
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className={`mb-2 ${panel.headingLg}`}>Dashboard Praktik</h1>
        <p className={panel.subtext}>
          Selamat datang, {user?.name}. Ringkasan praktik hari ini di {profile?.department?.name ?? 'poli Anda'}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={`${panel.card} p-5`}>
          <p className="text-xs text-slate-500 uppercase dark:text-zinc-400">Total Hari Ini</p>
          <p className="mt-1 text-3xl text-zinc-900 dark:text-zinc-100">{stats.total}</p>
        </div>
        <div className={doctor.statWaiting}>
          <p className="text-xs text-amber-700 uppercase dark:text-amber-400">Menunggu</p>
          <p className="mt-1 text-3xl text-amber-800 dark:text-amber-300">{stats.waiting}</p>
        </div>
        <div className={doctor.statInProgress}>
          <p className="text-xs text-indigo-700 uppercase dark:text-indigo-400">Sedang Dilayani</p>
          <p className="mt-1 text-3xl text-indigo-800 dark:text-indigo-300">{stats.inProgress}</p>
        </div>
        <div className={doctor.statDone}>
          <p className="text-xs text-emerald-700 uppercase dark:text-emerald-400">Selesai</p>
          <p className="mt-1 text-3xl text-emerald-800 dark:text-emerald-300">{stats.done}</p>
        </div>
      </div>

      <div className={doctor.activePatientCard}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-['Manrope'] text-lg font-bold text-indigo-900 dark:text-indigo-200">
            Pasien Saat Ini
          </h2>
          <Link
            to="/doctor/queues"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Buka Antrean
          </Link>
        </div>
        {isLoadingTable ? (
          <div className="flex justify-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
          </div>
        ) : activePatient ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-semibold text-white dark:bg-indigo-500">
              {activePatient.queueNumber}
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {activePatient.patient?.user?.name}
              </p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Status:{' '}
                {activePatient.status === QueueStatus.IN_PROGRESS ? 'Sedang diperiksa' : 'Sudah dipanggil'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-zinc-300">
            Belum ada pasien aktif. Panggil pasien dari{' '}
            <Link to="/doctor/queues" className="font-medium text-indigo-600 underline dark:text-indigo-400">
              antrean hari ini
            </Link>
            .
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/doctor/queues" className={doctor.navLink}>
          <p className="text-zinc-900 dark:text-zinc-100">Antrean Hari Ini</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Kelola pemeriksaan & catatan medis</p>
        </Link>
        <Link to="/doctor/appointments" className={doctor.navLink}>
          <p className="text-zinc-900 dark:text-zinc-100">Jadwal Reservasi</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Lihat reservasi mendatang</p>
        </Link>
        <Link to="/doctor/patients" className={doctor.navLink}>
          <p className="text-zinc-900 dark:text-zinc-100">Riwayat Pasien</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Cari & lihat rekam medis</p>
        </Link>
      </div>
    </div>
  )
}
