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
const PatientQueueDetail = lazy(() => import('./pages/patient/QueueDetail'))
const PatientProfile = lazy(() => import('./pages/patient/Profile'))
const PatientVisitHistory = lazy(() => import('./pages/patient/VisitHistory'))
const PatientVisitGuide = lazy(() => import('./pages/patient/VisitGuide'))
const PatientAnnouncements = lazy(() => import('./pages/patient/Announcements'))
const PatientNotifications = lazy(() => import('./pages/patient/Notifications'))
const PatientPrescriptions = lazy(() => import('./pages/patient/Prescriptions'))
const PatientMedicalRecords = lazy(() => import('./pages/patient/MedicalRecords'))
const PatientBilling = lazy(() => import('./pages/patient/Billing'))
const PatientHelp = lazy(() => import('./pages/patient/Help'))

// ── Doctor ───────────────────────────────────────────────────
const DoctorLayout = lazy(() => import('./pages/doctor/Dashboard'))
const DoctorOverview = lazy(() => import('./pages/doctor/Overview'))
const DoctorQueues = lazy(() => import('./pages/doctor/Queues'))
const DoctorAppointments = lazy(() => import('./pages/doctor/Appointments'))
const DoctorPatientHistory = lazy(() => import('./pages/doctor/PatientHistory'))
const DoctorCDSSHistory = lazy(() => import('./pages/doctor/CDSSHistory'))
const DoctorProfile = lazy(() => import('./pages/doctor/Profile'))
const DoctorNotifications = lazy(() => import('./pages/doctor/Notifications'))

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
const AdminBilling = lazy(() => import('./pages/admin/Billing'))
const AdminPatients = lazy(() => import('./pages/admin/Patients'))
const AdminDepartments = lazy(() => import('./pages/admin/Departments'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'))
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'))

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
            <Route path="visits" element={<PatientVisitHistory />} />
            <Route path="reservations" element={<Navigate to="/portal/visits?tab=reservations" replace />} />
            <Route path="queues" element={<Navigate to="/portal/visits?tab=queues" replace />} />
            <Route path="queues/:id" element={<PatientQueueDetail />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="medical-records" element={<PatientMedicalRecords />} />
            <Route path="guide" element={<PatientVisitGuide />} />
            <Route path="announcements" element={<PatientAnnouncements />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="billing" element={<PatientBilling />} />
            <Route path="help" element={<PatientHelp />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Doctor routes */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorOverview />} />
            <Route path="queues" element={<DoctorQueues />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatientHistory />} />
            <Route path="cdss" element={<DoctorCDSSHistory />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="notifications" element={<DoctorNotifications />} />
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
            <Route path="billing" element={<AdminBilling />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
