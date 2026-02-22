import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const headers = { Authorization: `Bearer ${userInfo.token}` };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, usersRes] = await Promise.all([
          axios.get(`${API}/api/admin/stats`, { headers }),
          axios.get(`${API}/api/admin/users`, { headers }),
        ]);
        setStats(statsRes.data);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/admin/users/${id}`, { headers });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="admin-subtitle">System overview and user management</p>

        {error && (
          <div className="auth-error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="intel-card">
            <p className="muted">Loading…</p>
          </div>
        ) : (
          <>
            <div className="section-title">System stats</div>
            <div className="stats-row admin-stats">
              <div className="stat-card">
                <h3>Users</h3>
                <strong>{stats?.totalUsers ?? 0}</strong>
              </div>
              <div className="stat-card">
                <h3>Website scans</h3>
                <strong>{stats?.totalWebsiteScans ?? 0}</strong>
              </div>
              <div className="stat-card">
                <h3>Port scans</h3>
                <strong>{stats?.totalPortScans ?? 0}</strong>
              </div>
              <div className="stat-card">
                <h3>Password checks</h3>
                <strong>{stats?.totalPasswordChecks ?? 0}</strong>
              </div>
              <div className="stat-card">
                <h3>Phishing checks</h3>
                <strong>{stats?.totalPhishingChecks ?? 0}</strong>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: "32px" }}>Users</div>
            <div className="intel-card admin-users-card">
              {users.length === 0 ? (
                <p className="muted">No users.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name ?? "—"}</td>
                          <td>{user.email ?? "—"}</td>
                          <td>
                            <span className={`badge ${user.role === "admin" ? "high" : "low"}`}>
                              {user.role || "user"}
                            </span>
                          </td>
                          <td>
                            {user.role !== "admin" && (
                              <button
                                type="button"
                                className="danger-btn"
                                disabled={deletingId === user._id}
                                onClick={() => handleDelete(user._id)}
                              >
                                {deletingId === user._id ? "…" : "Delete"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;
