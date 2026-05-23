import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminUserModal, { type ManagedUser } from '../../components/admin/AdminUserModal'
import DashboardShell, { type NavItem } from '../../layouts/DashboardShell'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'

// ─────────────────────────────────────────────────────────────
// Outlet context shared with user-management child pages
// ─────────────────────────────────────────────────────────────
export type AdminDashboardContext = {
  onManageUser: (user: ManagedUser) => void
  onDeleteUser: (userId: string) => void
  userTableKey: number
}

type AdminView =
  | 'dashboard'
  | 'users_patient'
  | 'users_doctor'
  | 'users_admin'
  | 'services'
  | 'queues'
  | 'appointments'
  | 'analytics'

const PAGE_TITLES: Record<AdminView, string> = {
  dashboard:     'Command Center',
  users_patient: 'Manajemen Pengguna — Data Pasien',
  users_doctor:  'Manajemen Pengguna — Data Dokter',
  users_admin:   'Manajemen Pengguna — Administrator',
  services:      'Manajemen Layanan',
  queues:        'Manajemen Antrean',
  appointments:  'Manajemen Reservasi',
  analytics:     'Analitik Performa',
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Command Center',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Manajemen Pengguna',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    children: [
      {
        id: 'users_patient',
        label: 'Daftar Pasien',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        id: 'users_doctor',
        label: 'Daftar Dokter',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
        ),
      },
      {
        id: 'users_admin',
        label: 'Administrator',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 19a2 2 0 0 0 2 2h1v-6H3v4z" />
            <circle cx="12" cy="9" r="3" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'services',
    label: 'Manajemen Layanan',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'queues',
    label: 'Manajemen Antrean',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'appointments',
    label: 'Manajemen Reservasi',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analitik Performa',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout   = useAuthStore((s) => s.logout)
  const user     = useAuthStore((s) => s.user)
  const showAlert = useAlertStore((s) => s.showAlert)

  const activeView = useMemo((): AdminView => {
    const segment = location.pathname.split('/')[2] ?? ''
    const valid: AdminView[] = ['dashboard', 'users_patient', 'users_doctor', 'users_admin', 'services', 'queues', 'appointments', 'analytics']
    return valid.includes(segment as AdminView) ? (segment as AdminView) : 'dashboard'
  }, [location.pathname])

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser]       = useState<ManagedUser | null>(null)
  const [userTableKey, setUserTableKey]       = useState(0)

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const onManageUser = (u: ManagedUser) => {
    setSelectedUser(u)
    setIsUserModalOpen(true)
  }

  const onDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) return
    try {
      await apiClient.delete(`/users/${userId}`)
      showAlert('Pengguna berhasil dihapus.', 'success')
      setUserTableKey((k) => k + 1)
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal menghapus pengguna.'), 'error')
    }
  }

  const handleCloseModal = () => { setIsUserModalOpen(false); setSelectedUser(null) }

  const handleModalSuccess = () => {
    setUserTableKey((k) => k + 1)
    handleCloseModal()
    showAlert('Data pengguna berhasil diperbarui.', 'success')
  }

  // Notification bell shown in header
  const headerExtras = (
    <div className="flex items-center gap-3">
      <button className="relative p-2 text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-rose-500 dark:border-[#131314]" />
      </button>
      <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-zinc-800" />
      <div className="flex cursor-default items-center gap-3">
        <div className="hidden flex-col text-right md:flex">
          <span className="text-sm leading-none font-bold text-zinc-900 dark:text-zinc-100">{user?.name ?? 'Administrator'}</span>
          <span className="mt-0.5 text-[11px] font-semibold tracking-wide text-teal-600 uppercase dark:text-teal-400">{user?.role ?? 'Admin'}</span>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-teal-200 bg-teal-100 dark:border-zinc-700 dark:bg-zinc-800">
          <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </span>
        </div>
      </div>
    </div>
  )

  const outletContext: AdminDashboardContext = { onManageUser, onDeleteUser, userTableKey }

  return (
    <>
      <DashboardShell
        navItems={NAV_ITEMS}
        activeView={activeView}
        onNavigate={(id) => navigate(`/admin/${id}`)}
        user={user ? { name: user.name, email: user.email } : null}
        onLogout={handleLogout}
        logoLabel="Ethereal"
        logoAccent="Admin"
        pageTitle={PAGE_TITLES[activeView]}
        headerExtras={headerExtras}
      >
        <Outlet context={outletContext} />
      </DashboardShell>

      <AdminUserModal
        isOpen={isUserModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}
