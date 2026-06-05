// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../../lib/types'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

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

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/portal" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
