import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminUserModal, { type ManagedUser } from '../../components/admin/AdminUserModal'
import DashboardShell, { type NavSection } from '../../layouts/DashboardShell'
import NotificationBell from '../../components/shared/NotificationBell'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { adminNavIcons } from './adminNavIcons'

export type AdminDashboardContext = {
  onManageUser: (user: ManagedUser) => void
  onDeleteUser: (userId: string) => void
  userTableKey: number
}

type AdminView =
  | 'dashboard'
  | 'queues'
  | 'appointments'
  | 'billing'
  | 'patients'
  | 'users_patient'
  | 'users_doctor'
  | 'users_admin'
  | 'departments'
  | 'services'
  | 'analytics'
  | 'reports'
  | 'settings'
  | 'announcements'
  | 'notifications'

const PAGE_TITLES: Record<AdminView, string> = {
  dashboard: 'Command Center',
  queues: 'Manajemen Antrean',
  appointments: 'Manajemen Reservasi',
  billing: 'Tagihan & Pembayaran',
  patients: 'Data Pasien',
  users_patient: 'Manajemen Pengguna — Data Pasien',
  users_doctor: 'Manajemen Pengguna — Data Dokter',
  users_admin: 'Manajemen Pengguna — Administrator',
  departments: 'Poliklinik & Lokasi',
  services: 'Manajemen Layanan',
  analytics: 'Analitik Performa',
  reports: 'Laporan Kunjungan Harian',
  settings: 'Pengaturan Sistem',
  announcements: 'Pengumuman Global',
  notifications: 'Notifikasi',
}

const VALID_VIEWS: AdminView[] = [
  'dashboard',
  'queues',
  'appointments',
  'billing',
  'patients',
  'users_patient',
  'users_doctor',
  'users_admin',
  'departments',
  'services',
  'analytics',
  'reports',
  'settings',
  'announcements',
  'notifications',
]

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operasional',
    items: [
      { id: 'dashboard', label: 'Command Center', icon: adminNavIcons.dashboard },
      { id: 'queues', label: 'Manajemen Antrean', icon: adminNavIcons.queues },
      { id: 'appointments', label: 'Manajemen Reservasi', icon: adminNavIcons.appointments },
    ],
  },
  {
    title: 'Keuangan',
    items: [{ id: 'billing', label: 'Tagihan', icon: adminNavIcons.billing }],
  },
  {
    title: 'Master Data',
    items: [
      { id: 'patients', label: 'Pasien', icon: adminNavIcons.patients },
      {
        id: 'users',
        label: 'Manajemen Pengguna',
        icon: adminNavIcons.users,
        children: [
          { id: 'users_patient', label: 'Daftar Pasien (Akun)' },
          { id: 'users_doctor', label: 'Daftar Dokter' },
          { id: 'users_admin', label: 'Administrator' },
        ],
      },
      { id: 'departments', label: 'Poliklinik', icon: adminNavIcons.departments },
      { id: 'services', label: 'Manajemen Layanan', icon: adminNavIcons.services },
    ],
  },
  {
    title: 'Laporan',
    items: [
      { id: 'analytics', label: 'Analitik Performa', icon: adminNavIcons.analytics },
      { id: 'reports', label: 'Laporan Harian', icon: adminNavIcons.reports },
    ],
  },
  {
    title: 'Informasi',
    items: [
      { id: 'announcements', label: 'Pengumuman', icon: adminNavIcons.announcements },
      { id: 'notifications', label: 'Notifikasi', icon: adminNavIcons.notifications },
    ],
  },
  {
    title: 'Pengaturan',
    items: [{ id: 'settings', label: 'Pengaturan', icon: adminNavIcons.settings }],
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const showAlert = useAlertStore((s) => s.showAlert)

  const activeView = useMemo((): AdminView => {
    const segment = location.pathname.split('/')[2] ?? ''
    return VALID_VIEWS.includes(segment as AdminView) ? (segment as AdminView) : 'dashboard'
  }, [location.pathname])

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [userTableKey, setUserTableKey] = useState(0)

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

  const handleCloseModal = () => {
    setIsUserModalOpen(false)
    setSelectedUser(null)
  }

  const handleModalSuccess = () => {
    setUserTableKey((k) => k + 1)
    handleCloseModal()
    showAlert('Data pengguna berhasil diperbarui.', 'success')
  }

  const headerExtras = (
    <div className="flex items-center gap-3">
      <NotificationBell />
      <div className="hidden h-6 w-px bg-slate-200 md:block dark:bg-zinc-800" />
      <div className="hidden flex-col text-right md:flex">
        <span className="text-sm leading-none text-zinc-900 dark:text-zinc-100">
          {user?.name ?? 'Administrator'}
        </span>
        <span className="mt-0.5 text-[11px] tracking-wide text-teal-600 uppercase dark:text-teal-400">
          {user?.role ?? 'Admin'}
        </span>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-teal-200 bg-teal-100 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="text-sm text-teal-700 dark:text-teal-400">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </span>
      </div>
    </div>
  )

  const outletContext: AdminDashboardContext = { onManageUser, onDeleteUser, userTableKey }

  return (
    <>
      <DashboardShell
        navSections={NAV_SECTIONS}
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
