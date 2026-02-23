import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api";

const API = `${API_BASE_URL}/api/auth/register`;

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(API, form);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
          <h2>Create account</h2>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-label">Name</label>
          <input
            type="text"
            className="auth-input"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
            disabled={loading}
          />
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
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            disabled={loading}
          />
          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
          <p className="auth-swap">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
