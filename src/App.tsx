import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import PatientPortal from "./pages/PatientPortal";
import Booking from "./pages/Booking";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>}></Route>
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage/>}></Route>
      <Route path="*" element={<Navigate to="/" replace />}></Route>
      <Route path="/reset-password" element={<ResetPassword/>}></Route>

      <Route path="/portal" element={<PatientPortal/>}></Route>
      <Route path="/booking" element={<Booking/>}></Route>
    </Routes>
  )
}

export default App;