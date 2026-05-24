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
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950">Dashboard Praktik</h1>
        <p className="text-slate-600">
          Selamat datang, {user?.name}. Ringkasan praktik hari ini di {profile?.department?.name ?? 'poli Anda'}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Hari Ini</p>
          <p className="mt-1 text-3xl font-extrabold text-zinc-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-xs font-bold text-amber-700 uppercase">Menunggu</p>
          <p className="mt-1 text-3xl font-extrabold text-amber-800">{stats.waiting}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-xs font-bold text-indigo-700 uppercase">Sedang Dilayani</p>
          <p className="mt-1 text-3xl font-extrabold text-indigo-800">{stats.inProgress}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-xs font-bold text-emerald-700 uppercase">Selesai</p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-800">{stats.done}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-['Manrope'] text-lg font-bold text-indigo-900">Pasien Saat Ini</h2>
          <Link
            to="/doctor/queues"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Buka Antrean
          </Link>
        </div>
        {isLoadingTable ? (
          <div className="flex justify-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : activePatient ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white">
              {activePatient.queueNumber}
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">{activePatient.patient?.user?.name}</p>
              <p className="text-sm text-indigo-700">
                Status:{' '}
                {activePatient.status === QueueStatus.IN_PROGRESS ? 'Sedang diperiksa' : 'Sudah dipanggil'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Belum ada pasien aktif. Panggil pasien dari{' '}
            <Link to="/doctor/queues" className="font-bold text-indigo-600 underline">
              antrean hari ini
            </Link>
            .
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/doctor/queues"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <p className="font-bold text-zinc-900">Antrean Hari Ini</p>
          <p className="mt-1 text-sm text-slate-500">Kelola pemeriksaan & catatan medis</p>
        </Link>
        <Link
          to="/doctor/appointments"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <p className="font-bold text-zinc-900">Jadwal Reservasi</p>
          <p className="mt-1 text-sm text-slate-500">Lihat reservasi mendatang</p>
        </Link>
        <Link
          to="/doctor/patients"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <p className="font-bold text-zinc-900">Riwayat Pasien</p>
          <p className="mt-1 text-sm text-slate-500">Cari & lihat rekam medis</p>
        </Link>
      </div>
    </div>
  )
}
