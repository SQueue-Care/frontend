// src/App.tsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import PatientPortal from './pages/PatientPortal';
import Booking from './pages/Booking';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Verifikasi sesi setiap kali aplikasi dirender pertama kali
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* 1. RUTE PUBLIK (Dapat diakses siapa saja) */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 2. RUTE PASIEN (Hanya untuk pengguna dengan Role: PATIENT) */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/portal" element={<PatientPortal />} />
        <Route path="/booking" element={<Booking />} />
      </Route>

      {/* 3. RUTE ADMIN (Hanya untuk pengguna dengan Role: ADMIN atau DOCTOR) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* 4. RUTE FALLBACK (Penanganan URL tidak valid) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;