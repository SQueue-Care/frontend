import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import LiveQueueTracker from '../../components/patient/LiveQueueTracker'
import PolyclinicCard from '../../components/patient/PolyclinicCard'
import type { AppointmentDetail, Department } from '../../lib/types'
import { useAuthStore } from '../../store/authStore'
import { useDepartmentStore } from '../../store/departmentStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useQueueStore } from '../../store/queueStore'
import type { PatientPortalContext } from './Portal'
import { patientNavIcons } from './patientNavIcons'

const getQueueDensity = (activeCount = 0) => {
  const maxCapacity = 30
  const percentage = `${Math.min(Math.round((activeCount / maxCapacity) * 100), 100)}%`
  if (activeCount <= 10)
    return { status: `${activeCount} Antrean (Sepi)`, color: 'emerald', percentage }
  if (activeCount <= 18)
    return { status: `${activeCount} Antrean (Sedang)`, color: 'amber', percentage }
  return { status: `${activeCount} Antrean (Ramai)`, color: 'rose', percentage }
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function canCheckIn(appointment: AppointmentDetail): boolean {
  if (appointment.status !== 'CONFIRMED') return false
  const now = new Date()
  const scheduledTime = new Date(appointment.scheduledAt)
  const checkInWindowStart = new Date(scheduledTime.getTime() - 30 * 60000)
  return now >= checkInWindowStart
}

const QUICK_ACTIONS = [
  {
    id: 'visits',
    label: 'Riwayat',
    description: 'Antrean & reservasi',
    href: '/portal/visits',
    icon: patientNavIcons.visits,
    accent: 'teal',
  },
  {
    id: 'medical-records',
    label: 'Rekam Medis',
    description: 'Hasil pemeriksaan',
    href: '/portal/medical-records',
    icon: patientNavIcons.medicalRecords,
    accent: 'sky',
  },
  {
    id: 'billing',
    label: 'Tagihan',
    description: 'Pembayaran & invoice',
    href: '/portal/billing',
    icon: patientNavIcons.billing,
    accent: 'amber',
  },
  {
    id: 'announcements',
    label: 'Pengumuman',
    description: 'Info rumah sakit',
    href: '/portal/announcements',
    icon: patientNavIcons.announcements,
    accent: 'slate',
  },
] as const

const accentStyles: Record<string, string> = {
  teal: 'border-teal-100 bg-teal-50/80 text-teal-700 dark:border-teal-900/40 dark:bg-teal-500/10 dark:text-teal-400',
  sky: 'border-sky-100 bg-sky-50/80 text-sky-700 dark:border-sky-900/40 dark:bg-sky-500/10 dark:text-sky-400',
  amber: 'border-amber-100 bg-amber-50/80 text-amber-700 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-400',
  slate: 'border-slate-200 bg-slate-50/80 text-slate-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400',
}

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  BOOKED: 'Menunggu konfirmasi',
  CONFIRMED: 'Terkonfirmasi',
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { openBooking, openAppointmentDetail, activeQueueId, setActiveQueueOverride } =
    useOutletContext<PatientPortalContext>()
  const { departments, isLoading: isDeptLoading } = useDepartmentStore()
  const { patientAppointments, isLoadingAppointments } = useQueueStore()
  const { notifications, unreadCount, fetchNotifications } = useNotificationStore()

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  const today = useMemo(() => new Date(), [])

  const todayAppointments = useMemo(() => {
    return patientAppointments
      .filter((apt) => {
        const scheduled = new Date(apt.scheduledAt)
        return (
          isSameCalendarDay(scheduled, today) &&
          (apt.status === 'BOOKED' || apt.status === 'CONFIRMED')
        )
      })
      .sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
  }, [patientAppointments, today])

  const checkInReady = useMemo(
    () => todayAppointments.find((apt) => canCheckIn(apt)),
    [todayAppointments]
  )

  const latestUnread = useMemo(
    () => notifications.find((n) => !n.isRead) ?? notifications[0] ?? null,
    [notifications]
  )

  const featuredPolyclinics = useMemo(() => {
    return departments
      .map((dept: Department & { activeQueueCount?: number }) => {
        const density = getQueueDensity(dept.activeQueueCount ?? 0)
        return {
          id: dept.id,
          name: dept.name,
          description: dept.description ?? 'Layanan poliklinik rumah sakit.',
          activeCount: dept.activeQueueCount ?? 0,
          ...density,
        }
      })
      .sort((a, b) => a.activeCount - b.activeCount)
      .slice(0, 3)
  }, [departments])

  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const firstName = user?.name?.split(' ')[0] ?? 'Pasien'

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 md:space-y-8">
      {/* Hero + primary CTAs */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-linear-to-br from-teal-50 via-white to-sky-50/60 p-6 shadow-sm md:p-8 dark:border-teal-900/30 dark:from-teal-950/40 dark:via-[#1e1f20] dark:to-[#1e1f20]">
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-800/20" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-sky-200/30 blur-2xl dark:bg-sky-900/15" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-1 text-xs tracking-widest text-teal-700 uppercase dark:text-teal-400">
              {formattedDate}
            </p>
            <h1 className="mb-2 font-['Manrope'] text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl dark:text-white">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Kelola kunjungan, antrean, dan informasi medis Anda dari satu tempat.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/portal/polyclinics')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 active:scale-[0.98] dark:bg-teal-700 dark:hover:bg-teal-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ambil Antrean
            </button>
            {checkInReady ? (
              <button
                type="button"
                onClick={() => openAppointmentDetail(checkInReady)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-5 py-3.5 text-sm text-teal-800 shadow-sm transition-all hover:bg-teal-50 active:scale-[0.98] dark:border-teal-800 dark:bg-[#131314] dark:text-teal-300 dark:hover:bg-teal-950/50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check-in Sekarang
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/portal/visits?tab=reservations')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-5 py-3.5 text-sm text-slate-700 shadow-sm transition-all hover:border-teal-200 hover:text-teal-800 active:scale-[0.98] dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-300 dark:hover:border-teal-800"
              >
                Lihat Reservasi
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Active queue — prominent */}
      <LiveQueueTracker
        queueId={activeQueueId}
        onCancelSuccess={() => setActiveQueueOverride(null)}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        {/* Quick actions */}
        <section className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-['Manrope'] text-lg font-extrabold text-zinc-950 dark:text-white">
              Akses Cepat
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                to={action.href}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:p-5 dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-teal-900/50"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accentStyles[action.accent]}`}
                >
                  {action.icon}
                </div>
                <div>
                  <p className="text-zinc-900 dark:text-white">{action.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sidebar column: notifications + today */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
              <h2 className="font-['Manrope'] text-sm font-extrabold text-zinc-950 dark:text-white">
                Notifikasi
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">
                  {unreadCount > 99 ? '99+' : unreadCount} baru
                </span>
              )}
            </div>
            <div className="p-4">
              {latestUnread ? (
                <button
                  type="button"
                  onClick={() => navigate(latestUnread.link ?? '/portal/notifications')}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${ !latestUnread.isRead ? 'border-teal-100 bg-teal-50/50 dark:border-teal-500/20 dark:bg-teal-500/5' : 'border-transparent' }`}
                >
                  <p className="text-sm text-zinc-900 dark:text-white">
                    {latestUnread.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-zinc-400">
                    {latestUnread.message}
                  </p>
                </button>
              ) : (
                <p className="text-center text-xs text-slate-500 dark:text-zinc-400">
                  Belum ada notifikasi terbaru.
                </p>
              )}
              <Link
                to="/portal/notifications"
                className="mt-3 block text-center text-xs tracking-wide text-teal-600 uppercase dark:text-teal-400"
              >
                {unreadCount > 0 ? `Lihat ${unreadCount} belum dibaca` : 'Buka semua notifikasi'}
              </Link>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
              <h2 className="font-['Manrope'] text-sm font-extrabold text-zinc-950 dark:text-white">
                Jadwal Hari Ini
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {isLoadingAppointments ? (
                <p className="animate-pulse p-6 text-center text-xs text-teal-700 uppercase dark:text-teal-500">
                  Memuat jadwal...
                </p>
              ) : todayAppointments.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                  Tidak ada reservasi untuk hari ini.
                </p>
              ) : (
                todayAppointments.slice(0, 3).map((apt) => (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => openAppointmentDetail(apt)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                      <span className="text-[9px] uppercase">Jam</span>
                      <span className="text-xs tabular-nums">
                        {new Date(apt.scheduledAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-900 dark:text-white">
                        {apt.department?.name ?? 'Poliklinik'}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                        {apt.doctor?.user?.name ?? 'Dokter belum ditentukan'}
                      </p>
                      <p className="mt-1 text-[10px] text-teal-700 dark:text-teal-400">
                        {APPOINTMENT_STATUS_LABELS[apt.status] ?? apt.status}
                        {canCheckIn(apt) ? ' · Siap check-in' : ''}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            {todayAppointments.length > 0 && (
              <div className="border-t border-slate-100 p-2 dark:border-zinc-800">
                <Link
                  to="/portal/visits?tab=reservations"
                  className="block rounded-lg py-2 text-center text-xs text-teal-600 dark:text-teal-400"
                >
                  Lihat semua reservasi
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Featured polyclinics — compact, booking preserved */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-['Manrope'] text-lg font-extrabold text-zinc-950 dark:text-white">
              Poliklinik Tersedia
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Pilih layanan dengan antrean paling sepi — atau lihat daftar lengkap.
            </p>
          </div>
          <Link
            to="/portal/polyclinics"
            className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            Lihat semua →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isDeptLoading ? (
            <div className="col-span-full py-10 text-center text-slate-500 dark:text-slate-400">
              Memuat layanan poliklinik...
            </div>
          ) : featuredPolyclinics.length > 0 ? (
            featuredPolyclinics.map((poli, index) => (
              <div
                key={poli.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <PolyclinicCard
                  name={poli.name}
                  description={poli.description}
                  status={poli.status}
                  percentage={poli.percentage}
                  colorClass={poli.color}
                  onClick={() => openBooking(poli.id, poli.name)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Belum ada data poliklinik. Silakan coba lagi nanti.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
