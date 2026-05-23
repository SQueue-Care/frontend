// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Role } from '../../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // 1. Tangani state loading saat aplikasi pertama kali dimuat atau direfresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#131314] font-['Inter'] transition-colors">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent dark:border-teal-600 dark:border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 transition-colors">Memverifikasi sesi aman...</p>
        </div>
      </div>
    );
  }

  // 2. Cegah akses jika pengguna belum login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. RBAC (Role-Based Access Control)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  // 4. Izinkan akses ke komponen anak (child routes) jika semua validasi lolos
  return <Outlet />;
}