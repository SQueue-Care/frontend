import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import DashboardShell, { type NavSection } from '../../layouts/DashboardShell'
import NotificationBell from '../../components/shared/NotificationBell'
import { useAuthStore } from '../../store/authStore'
import { useDoctorStore } from '../../store/doctorStore'
import { doctorNavIcons } from './doctorNavIcons'

type DoctorView = 'dashboard' | 'queues' | 'appointments' | 'patients' | 'profile' | 'cdss' | 'notifications'

const PAGE_TITLES: Record<DoctorView, string> = {
  dashboard: 'Dashboard Praktik',
  queues: 'Antrean Hari Ini',
  appointments: 'Jadwal Reservasi',
  patients: 'Riwayat Pasien',
  profile: 'Profil Praktik',
  cdss: 'Riwayat CDSS',
  notifications: 'Notifikasi',
}

const VALID_VIEWS: DoctorView[] = ['dashboard', 'queues', 'appointments', 'patients', 'profile', 'cdss', 'notifications']

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Praktik',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: doctorNavIcons.dashboard },
      { id: 'queues', label: 'Antrean Hari Ini', icon: doctorNavIcons.queues },
      { id: 'appointments', label: 'Jadwal Reservasi', icon: doctorNavIcons.appointments },
    ],
  },
  {
    title: 'Pasien',
    items: [{ id: 'patients', label: 'Riwayat Pasien', icon: doctorNavIcons.patients }],
  },
  {
    title: 'Akun',
    items: [
      { id: 'profile', label: 'Profil Praktik', icon: doctorNavIcons.profile },
      { id: 'cdss', label: 'Riwayat CDSS', icon: doctorNavIcons.cdss },
    ],
  },
]

export default function DoctorLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const { profile, fetchProfile } = useDoctorStore()

  const activeView = useMemo((): DoctorView => {
    const segment = location.pathname.split('/')[2] ?? ''
    return VALID_VIEWS.includes(segment as DoctorView) ? (segment as DoctorView) : 'dashboard'
  }, [location.pathname])

  useEffect(() => {
    const doctorId = user?.doctor?.id ?? (user?.role === 'DOCTOR' ? user?.id : null)
    if (doctorId && !profile) fetchProfile(doctorId)
  }, [user, profile, fetchProfile])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <DashboardShell
      navSections={NAV_SECTIONS}
      activeView={activeView}
      onNavigate={(id) => navigate(`/doctor/${id}`)}
      user={user ? { name: user.name, email: user.email } : null}
      onLogout={handleLogout}
      logoLabel="Doctor"
      logoAccent="Portal"
      pageTitle={PAGE_TITLES[activeView]}
      headerExtras={
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden h-6 w-px bg-slate-200 md:block dark:bg-zinc-800" />
          <div className="hidden flex-col text-right md:flex">
            <span className="text-sm leading-none text-zinc-900 dark:text-zinc-100">
              {user?.name ?? 'Dokter'}
            </span>
            <span className="mt-0.5 text-[11px] tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
              {profile?.department?.name ?? 'Dokter'}
            </span>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-sm text-indigo-700 dark:text-indigo-400">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </span>
          </div>
        </div>
      }
    >
      <Outlet />
    </DashboardShell>
  )
}
