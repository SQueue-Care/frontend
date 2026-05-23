import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BookingPanel from '../../components/patient/BookingPanel'
import QueueDetailPanel from '../../components/patient/QueueDetailPanel'
import ReservationDetailPanel from '../../components/patient/ReservationDetailPanel'
import DashboardShell, { type NavItem } from '../../layouts/DashboardShell'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { AppointmentDetail, Queue } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useAuthStore } from '../../store/authStore'
import { useDepartmentStore } from '../../store/departmentStore'
import { usePatientStore } from '../../store/patientStore'
import { useQueueStore } from '../../store/queueStore'

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

type PortalView = 'dashboard' | 'polyclinics' | 'reservations' | 'queues' | 'profile'

const PAGE_TITLES: Record<PortalView, string> = {
  dashboard: 'Portal Pasien',
  polyclinics: 'Layanan Poliklinik',
  reservations: 'Jadwal Reservasi',
  queues: 'Riwayat Antrean',
  profile: 'Profil Medis',
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
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
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    id: 'polyclinics',
    label: 'Poliklinik',
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Riwayat Kunjungan',
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    children: [
      { id: 'reservations', label: 'Jadwal Reservasi' },
      { id: 'queues', label: 'Riwayat Antrean' },
    ],
  },
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

  // Derive active nav item from URL
  const activeView = useMemo((): PortalView => {
    const segment = location.pathname.split('/')[2] ?? ''
    const valid: PortalView[] = ['dashboard', 'polyclinics', 'reservations', 'queues', 'profile']
    return valid.includes(segment as PortalView) ? (segment as PortalView) : 'dashboard'
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
        navItems={NAV_ITEMS}
        activeView={activeView}
        onNavigate={(id) => navigate(`/portal/${id}`)}
        user={user ? { name: user.name, email: user.email } : null}
        onLogout={handleLogout}
        logoLabel="Portal"
        logoAccent="Pasien"
        pageTitle={PAGE_TITLES[activeView]}
        supportsTheme
        onProfileClick={() => navigate('/portal/profile')}
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
              <h3 className="mb-2 text-xl font-black tracking-tight text-zinc-900 dark:text-white">
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
                  className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-black text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-700 active:scale-95"
                >
                  Lengkapi Profil Sekarang
                </button>
                <button
                  onClick={() => setIsNikWarningOpen(false)}
                  className="w-full rounded-xl px-4 py-3.5 font-extrabold text-slate-500 transition-all hover:bg-slate-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
