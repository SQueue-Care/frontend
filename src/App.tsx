import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Public pages — loaded immediately (small bundle)
import ProtectedRoute from './components/auth/ProtectedRoute'
import Auth from './pages/Auth'
import Landing from './pages/Landing'
import ResetPassword from './pages/ResetPassword'

// ── Patient ──────────────────────────────────────────────────
const PatientLayout = lazy(() => import('./pages/patient/Portal'))
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'))
const PatientPolyclinics = lazy(() => import('./pages/patient/Polyclinics'))
const PatientReservations = lazy(() => import('./pages/patient/Reservations'))
const PatientQueues = lazy(() => import('./pages/patient/Queues'))
const PatientProfile = lazy(() => import('./pages/patient/Profile'))

// ── Doctor ───────────────────────────────────────────────────
const DoctorLayout = lazy(() => import('./pages/doctor/Dashboard'))
const DoctorPractice = lazy(() => import('./pages/doctor/Practice'))
const DoctorAppointments = lazy(() => import('./pages/doctor/Appointments'))
const DoctorCDSSHistory = lazy(() => import('./pages/doctor/CDSSHistory'))
const DoctorProfile = lazy(() => import('./pages/doctor/Profile'))

// ── Admin ────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('./pages/admin/Dashboard'))
const AdminCommandCenter = lazy(() => import('./pages/admin/CommandCenter'))
const AdminUsersPatient = lazy(() => import('./pages/admin/UsersPatient'))
const AdminUsersDoctor = lazy(() => import('./pages/admin/UsersDoctor'))
const AdminUsersAdmin = lazy(() => import('./pages/admin/UsersAdmin'))
const AdminServices = lazy(() => import('./pages/admin/Services'))
const AdminQueues = lazy(() => import('./pages/admin/Queues'))
const AdminAppointments = lazy(() => import('./pages/admin/Appointments'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-['Inter'] dark:bg-[#131314]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Memuat halaman...</p>
      </div>
    </div>
  )
}

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Patient routes */}
        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route path="/portal" element={<PatientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="polyclinics" element={<PatientPolyclinics />} />
            <Route path="reservations" element={<PatientReservations />} />
            <Route path="queues" element={<PatientQueues />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Doctor routes */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorPractice />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="cdss" element={<DoctorCDSSHistory />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminCommandCenter />} />
            <Route path="users_patient" element={<AdminUsersPatient />} />
            <Route path="users_doctor" element={<AdminUsersDoctor />} />
            <Route path="users_admin" element={<AdminUsersAdmin />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="queues" element={<AdminQueues />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
