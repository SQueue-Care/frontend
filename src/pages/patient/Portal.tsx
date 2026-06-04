import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BookingPanel from '../../components/patient/BookingPanel'
import QueueDetailPanel from '../../components/patient/QueueDetailPanel'
import ReservationDetailPanel from '../../components/patient/ReservationDetailPanel'
import NotificationBell from '../../components/shared/NotificationBell'
import DashboardShell, { type NavSection } from '../../layouts/DashboardShell'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { AppointmentDetail, Queue } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { useDepartmentStore } from '../../store/departmentStore'
import { usePatientStore } from '../../store/patientStore'
import { useQueueStore } from '../../store/queueStore'
import { patientNavIcons } from './patientNavIcons'

// ─────────────────────────────────────────────────────────────
// Outlet context shared with all child pages
// ─────────────────────────────────────────────────────────────
export type PatientPortalContext = {
  openBooking: (deptId: string, deptName: string) => void
  openAppointmentDetail: (apt: AppointmentDetail) => void
  openQueueDetail: (queue: Queue) => void
  activeQueueId: string | null
  setActiveQueueOverride: (id: string | null) => void
}

export type PortalView =
  | 'dashboard'
  | 'polyclinics'
  | 'visits'
  | 'reservations'
  | 'queues'
  | 'prescriptions'
  | 'medical-records'
  | 'guide'
  | 'announcements'
  | 'profile'
  | 'billing'
  | 'help'
  | 'notifications'

const PAGE_TITLES: Record<PortalView, string> = {
  dashboard: 'Beranda',
  polyclinics: 'Jadwal & Info Poliklinik',
  visits: 'Riwayat Kunjungan',
  reservations: 'Jadwal Reservasi',
  queues: 'Riwayat Antrean',
  prescriptions: 'Resep & Obat',
  'medical-records': 'Rekam Medis',
  guide: 'Panduan Kunjungan',
  announcements: 'Pengumuman',
  profile: 'Profil Medis',
  billing: 'Tagihan & Pembayaran',
  help: 'Bantuan & FAQ',
  notifications: 'Notifikasi',
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Beranda',
    items: [
      { id: 'dashboard', label: 'Beranda', icon: patientNavIcons.dashboard },
    ],
  },
  {
    title: 'Layanan',
    items: [
      { id: 'polyclinics', label: 'Poliklinik', icon: patientNavIcons.polyclinics },
    ],
  },
  {
    title: 'Kunjungan',
    items: [
      { id: 'visits', label: 'Riwayat Kunjungan', icon: patientNavIcons.visits },
      { id: 'medical-records', label: 'Rekam Medis', icon: patientNavIcons.medicalRecords },
      { id: 'prescriptions', label: 'Resep & Obat', icon: patientNavIcons.prescriptions },
    ],
  },
  {
    title: 'Informasi',
    items: [
      { id: 'guide', label: 'Panduan Kunjungan', icon: patientNavIcons.guide },
      { id: 'announcements', label: 'Pengumuman', icon: patientNavIcons.announcements },
    ],
  },
  {
    title: 'Akun & Bantuan',
    items: [
      { id: 'profile', label: 'Profil Medis', icon: patientNavIcons.profile },
      { id: 'billing', label: 'Tagihan', icon: patientNavIcons.billing },
      { id: 'help', label: 'Bantuan', icon: patientNavIcons.help },
    ],
  },
]

const VALID_VIEWS: PortalView[] = [
  'dashboard',
  'polyclinics',
  'visits',
  'reservations',
  'queues',
  'prescriptions',
  'medical-records',
  'guide',
  'announcements',
  'profile',
  'billing',
  'help',
  'notifications',
]

// ─────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────
export default function PatientPortalLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const showAlert = useAlertStore((s) => s.showAlert)
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const { fetchDepartments } = useDepartmentStore()
  const { profile, fetchProfile } = usePatientStore()
  const { addAppointmentId } = usePatientStore()
  const { patientHistory, fetchPatientHistory, fetchPatientAppointments } = useQueueStore()

  const activeView = useMemo((): PortalView => {
    const segment = location.pathname.split('/')[2] ?? ''
    if (segment === 'queues' && location.pathname.split('/')[3]) {
      return 'queues'
    }
    return VALID_VIEWS.includes(segment as PortalView) ? (segment as PortalView) : 'dashboard'
  }, [location.pathname])

  const patientId = user?.patient?.id ?? (user?.role === 'PATIENT' ? user?.id : null)

  // ── Overlay state ────────────────────────────────────────
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [selectedDept, setSelectedDept] = useState<{ id: string; name: string } | null>(null)
  const [activeQueueOverride, setActiveQueueOverride] = useState<string | null>(null)
  const [isNikWarningOpen, setIsNikWarningOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null)
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(false)

  // ── Effects ──────────────────────────────────────────────
  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory(patientId)
      fetchPatientAppointments(patientId)
      fetchProfile(patientId)
    }
  }, [patientId, fetchPatientHistory, fetchPatientAppointments, fetchProfile])

  const activeQueueFromHistory = useMemo(() => {
    if (!patientHistory?.length) return null
    const active = patientHistory.find((q) =>
      ['WAITING', 'CALLED', 'IN_PROGRESS'].includes(q.status)
    )
    return active?.id ?? null
  }, [patientHistory])

  const activeQueueId = activeQueueOverride ?? activeQueueFromHistory

  // ── Handlers ────────────────────────────────────────────
  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const openBooking = (deptId: string, deptName: string) => {
    if (!profile?.nik?.trim()) {
      setIsNikWarningOpen(true)
      return
    }
    setSelectedDept({ id: deptId, name: deptName })
    setBookingStep(1)
    setIsBookingOpen(true)
  }

  const closeBooking = () => {
    setIsBookingOpen(false)
    setTimeout(() => {
      setBookingStep(1)
      setSelectedDept(null)
    }, 500)
  }

  const openAppointmentDetail = (apt: AppointmentDetail) => {
    setSelectedAppointment(apt)
    setIsDetailPanelOpen(true)
  }

  const openQueueDetail = (queue: Queue) => {
    setSelectedQueue(queue)
    setIsQueuePanelOpen(true)
  }

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/check-in`)
      const newQueue = response.data?.data as { id?: string } | undefined
      showAlert('Check-in berhasil! Anda telah dipindahkan ke Antrean Berjalan.', 'success')
      setIsDetailPanelOpen(false)
      if (patientId) {
        fetchPatientAppointments(patientId)
        fetchPatientHistory(patientId)
      }
      if (newQueue?.id) setActiveQueueOverride(newQueue.id)
      navigate('/portal/dashboard')
    } catch (err: unknown) {
      showAlert(
        `Gagal Melakukan Check-In:\n\n${getErrorMessage(err, 'Terjadi kesalahan sistem saat check-in.')}`,
        'error'
      )
    }
  }

  const outletContext: PatientPortalContext = {
    openBooking,
    openAppointmentDetail,
    openQueueDetail,
    activeQueueId,
    setActiveQueueOverride,
  }

  return (
    <>
      <DashboardShell
        navSections={NAV_SECTIONS}
        activeView={activeView}
        onNavigate={(id) => navigate(`/portal/${id}`)}
        user={user ? { name: user.name, email: user.email } : null}
        onLogout={handleLogout}
        logoLabel="Patient"
        logoAccent="Portal"
        pageTitle={PAGE_TITLES[activeView]}
        supportsTheme
        onProfileClick={() => navigate('/portal/profile')}
        headerExtras={<NotificationBell />}
      >
        <Outlet context={outletContext} />
      </DashboardShell>

      {/* Booking panel */}
      <BookingPanel
        isOpen={isBookingOpen}
        onClose={closeBooking}
        step={bookingStep}
        selectedDept={selectedDept}
        hasActiveQueue={!!activeQueueId}
        patientProfile={
          profile
            ? { name: user?.name ?? '', nik: profile.nik ?? '', birthDate: profile.birthDate ?? '' }
            : null
        }
        onNext={() => setBookingStep((p) => p + 1)}
        onPrev={() => setBookingStep((p) => p - 1)}
        onBookingSuccess={(id, isAppointment) => {
          if (isAppointment && patientId) {
            addAppointmentId(patientId, id)
            fetchPatientAppointments(patientId)
          } else {
            setActiveQueueOverride(id)
          }
          navigate('/portal/dashboard')
        }}
      />

      <ReservationDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        appointment={selectedAppointment}
        patientProfile={
          profile
            ? { name: user?.name ?? '', nik: profile.nik ?? '', address: profile.address ?? '' }
            : null
        }
        onCheckIn={handleCheckIn}
      />

      <QueueDetailPanel
        isOpen={isQueuePanelOpen}
        onClose={() => setIsQueuePanelOpen(false)}
        queue={selectedQueue}
        patientProfile={
          profile
            ? { name: user?.name ?? '', nik: profile.nik ?? '', address: profile.address ?? '' }
            : null
        }
      />

      {/* NIK warning modal */}
      {isNikWarningOpen && (
        <div className="animate-in fade-in fixed inset-0 z-80 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-300">
          <div className="animate-in zoom-in-95 w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-2xl dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="p-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500 dark:bg-amber-900/40 dark:text-amber-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl tracking-tight text-zinc-900 dark:text-white">
                Akses Layanan Ditahan
              </h3>
              <p className="mb-8 text-sm leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                Anda diwajibkan melengkapi{' '}
                <strong className="text-zinc-800 dark:text-slate-200">
                  Nomor Induk Kependudukan (NIK)
                </strong>{' '}
                pada profil medis Anda sebelum membuat antrean atau reservasi.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsNikWarningOpen(false)
                    navigate('/portal/profile?editing=1')
                  }}
                  className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-700 active:scale-95"
                >
                  Lengkapi Profil Sekarang
                </button>
                <button
                  onClick={() => setIsNikWarningOpen(false)}
                  className="w-full rounded-xl px-4 py-3.5 text-slate-500 transition-all hover:bg-slate-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
