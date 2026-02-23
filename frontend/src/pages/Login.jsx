import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";

const API = "${API_BASE_URL}/api/auth/login";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(API, form);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page cyber-auth">
      <div className="auth-bg" aria-hidden="true" />
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1>CyberShield</h1>
          <p className="auth-tagline">Security Operations Center</p>
        </div>
        <form className="auth-card" onSubmit={submitHandler}>
          <h2>Sign in</h2>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-label">Email</label>
          <input
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            disabled={loading}
          />
          <label className="auth-label">Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            disabled={loading}
          />
          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="auth-swap">
            No account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
