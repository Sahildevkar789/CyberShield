import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const location = useLocation();
  if (!userInfo?.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const location = useLocation();
  if (!userInfo?.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (userInfo?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
