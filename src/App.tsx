import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PatientPortal from "./pages/PatientPortal";
import Booking from "./pages/Booking";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/portal" element={<PatientPortal/>}></Route>
      <Route path="/booking" element={<Booking/>}></Route>
    </Routes>
  )
}

export default App;