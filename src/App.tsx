// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import PatientPortal from './pages/PatientPortal';
import Booking from './pages/Booking';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Verifikasi sesi setiap kali aplikasi dirender pertama kali
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* 1. RUTE PUBLIK */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 2. RUTE PASIEN (Role: PATIENT) */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/portal" element={<PatientPortal />} />
        <Route path="/booking" element={<Booking />} />
      </Route>

      {/* 3. RUTE DOKTER (Role: DOCTOR) - TAMBAHKAN INI */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Route>

      {/* 4. RUTE ADMIN (Hanya Role: ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* 5. RUTE FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;