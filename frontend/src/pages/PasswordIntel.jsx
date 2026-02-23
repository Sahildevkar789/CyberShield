import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import API_BASE_URL from "../api";

function PasswordIntel() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const checkPassword = async () => {
    if (!password.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data } = await axios.post(
  `${API_BASE_URL}/api/password`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`
          }
        }
      );
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || "Password check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1>Password Intelligence</h1>
      <p>Enterprise-grade password strength analysis with entropy, crack time, and secure recommendations</p>

      <div className="intel-card" style={{ marginTop: "20px" }}>
        <div className="section-title">Analyze Password</div>
        <div className="domain-search">
          <input
            type="password"
            placeholder="Enter password to analyze"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkPassword()}
          />
          <button onClick={checkPassword} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {result && (
        <div className="intel-card">
          <div className="section-title">Analysis Result</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div>
              <p style={{ color: "var(--text-muted)", margin: "0 0 4px", fontSize: "0.85rem" }}>Strength</p>
              <p><span className={`badge ${(result.strength || "").toLowerCase()}`}>{result.strength || "—"}</span></p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", margin: "0 0 4px", fontSize: "0.85rem" }}>Difficulty</p>
              <p>{result.difficulty || "—"}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", margin: "0 0 4px", fontSize: "0.85rem" }}>Entropy</p>
              <p>{result.entropy ?? "—"}</p>
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", margin: "0 0 4px", fontSize: "0.85rem" }}>Crack Time</p>
              <p>{result.crack_time_estimate || "—"}</p>
            </div>
          </div>

          {result.suggestions?.length > 0 && (
            <>
              <div className="section-title">Suggestions</div>
              <ul style={{ margin: "8px 0 20px", paddingLeft: "20px" }}>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {result.recommended_password && (
            <>
              <div className="section-title">Recommended Secure Password</div>
              <p style={{ fontFamily: "monospace", background: "var(--bg-primary)", padding: "12px", borderRadius: "8px", margin: 0 }}>
                {result.recommended_password}
              </p>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}

export default PasswordIntel;
