import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WebsiteIntelligence from "./pages/WebsiteIntelligence";
import PortIntelligence from "./pages/PortIntelligence";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import DomainIntel from "./pages/DomainIntel";
import PasswordIntel from "./pages/PasswordIntel";
import IPIntel from "./pages/IPIntel";
import CVEIntel from "./pages/CVEIntel";
import Assistant from "./pages/Assistant";
import History from "./pages/History";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/website" element={<ProtectedRoute><WebsiteIntelligence /></ProtectedRoute>} />
        <Route path="/port" element={<ProtectedRoute><PortIntelligence /></ProtectedRoute>} />
        <Route path="/threat" element={<ProtectedRoute><ThreatIntelligence /></ProtectedRoute>} />
        <Route path="/domain" element={<ProtectedRoute><DomainIntel /></ProtectedRoute>} />
        <Route path="/password" element={<ProtectedRoute><PasswordIntel /></ProtectedRoute>} />
        <Route path="/ip" element={<ProtectedRoute><IPIntel /></ProtectedRoute>} />
        <Route path="/cve" element={<ProtectedRoute><CVEIntel /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SpeedInsights />
    </Router>
  );
}

export default App;
