import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import DashboardShell, { type NavItem } from '../../layouts/DashboardShell'
import { useAuthStore } from '../../store/authStore'
import { useDoctorStore } from '../../store/doctorStore'

type DoctorView = 'dashboard' | 'appointments' | 'cdss' | 'profile'

const PAGE_TITLES: Record<DoctorView, string> = {
  dashboard: 'Ruang Praktik Utama',
  appointments: 'Jadwal Reservasi',
  cdss: 'Riwayat CDSS',
  profile: 'Profil Medis',
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Ruang Praktik',
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: 'appointments',
    label: 'Jadwal Reservasi',
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'cdss',
    label: 'Riwayat CDSS',
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profil Medis',
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
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
    const valid: DoctorView[] = ['dashboard', 'appointments', 'cdss', 'profile']
    return valid.includes(segment as DoctorView) ? (segment as DoctorView) : 'dashboard'
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
      navItems={NAV_ITEMS}
      activeView={activeView}
      onNavigate={(id) => navigate(`/doctor/${id}`)}
      user={user ? { name: user.name, email: user.email } : null}
      onLogout={handleLogout}
      logoLabel="Doctor"
      logoAccent="Portal"
      pageTitle={PAGE_TITLES[activeView]}
    >
      <Outlet />
    </DashboardShell>
  )
}
