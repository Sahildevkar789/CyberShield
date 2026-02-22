import { useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import MiniChat from "./MiniChat";

const iconSvg = (name) => {
  const icons = {
    shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    globe: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    server: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
    lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    radar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    file: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bot: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="8.5" cy="16" r="1"/><circle cx="15.5" cy="16" r="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
    admin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><path d="M16 12l2 2 4-4"/></svg>
  };
  return icons[name] || null;
};

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!userInfo) {
    navigate("/");
    return null;
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "shield" },
    { path: "/domain", label: "Domain Intel", icon: "search" },
    { path: "/website", label: "Website Intelligence", icon: "globe" },
    { path: "/port", label: "Port Intelligence", icon: "server" },
    { path: "/password", label: "Password Intelligence", icon: "lock" },
    { path: "/threat", label: "Threat Intelligence", icon: "radar" },
    { path: "/ip", label: "IP Intel", icon: "globe" },
    { path: "/cve", label: "CVE Search", icon: "search" },
    { path: "/assistant", label: "Cyber AI Assistant", icon: "bot" },
    { path: "/history", label: "History", icon: "history" },
    { path: "/reports", label: "Reports", icon: "file" },
    ...(userInfo?.role === "admin" ? [{ path: "/admin", label: "Admin", icon: "admin" }] : []),
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>CyberShield</h2>
        <ul>
          {navItems.map(({ path, label, icon }) => (
            <li
              key={path}
              onClick={() => navigate(path)}
              className={location.pathname === path ? "active" : ""}
            >
              {icon && <span className="sidebar-icon">{iconSvg(icon)}</span>}
              {label}
            </li>
          ))}
        </ul>
        <button onClick={logout} style={{ marginTop: "20px", width: "100%" }}>
          Logout
        </button>
      </div>
      <div className="main-wrap">
        <div className="main animate-stagger">{children}</div>
        <Footer />
      </div>
      <MiniChat />
    </div>
  );
}

export default Layout;
