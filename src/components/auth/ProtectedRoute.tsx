// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../../lib/types'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  // 1. Tangani state loading saat aplikasi pertama kali dimuat atau direfresh
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-['Inter'] transition-colors dark:bg-[#131314]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent dark:border-teal-600 dark:border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 transition-colors dark:text-zinc-400">
            Memverifikasi sesi aman...
          </p>
        </div>
      </div>
    )
  }

  // 2. Cegah akses jika pengguna belum login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />
  }

  // 3. RBAC — redirect to the correct home route for this user's role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/portal" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />
    return <Navigate to="/admin" replace />
  }

  // 4. Izinkan akses ke komponen anak (child routes) jika semua validasi lolos
  return <Outlet />
}
