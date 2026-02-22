import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function WebsiteIntelligence() {
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setHistory(data.websiteScans || []);
    } catch (e) {
      console.error(e);
    }
  };

  const scanWebsite = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/scan/website",
        { url: urlInput },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setResult(data);
      fetchHistory();
    } catch (err) {
      const res = err.response?.data;
      setError({
        message: res?.message || "Scan could not be completed.",
        code: res?.code,
        hint: res?.hint
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1>Website Intelligence</h1>
      <p>Deep HTTP + SSL + Header Analysis</p>

      <div className="scan-input-section">
        <input
          type="text"
          placeholder="Enter URL (https://example.com)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={{ width: "400px", marginRight: "10px" }}
        />
        <button onClick={scanWebsite} disabled={loading}>
          {loading ? "Scanning..." : "Scan Website"}
        </button>
      </div>

      {loading && (
        <div className="intel-card scan-loading-card">
          <p>Scanning target...</p>
          <div className="loader-bar"></div>
        </div>
      )}

      {error && (
        <div className="scan-error-card">
          <div className="scan-error-header">
            <span className="scan-error-icon" aria-hidden>⚠</span>
            <div>
              <h3 className="scan-error-title">Scan failed</h3>
              {error.code && <span className="scan-error-code">{error.code}</span>}
            </div>
          </div>
          <p className="scan-error-message">{error.message}</p>
          {error.hint && (
            <div className="scan-error-hint">
              <strong>What you can do:</strong> {error.hint}
            </div>
          )}
          <button type="button" className="scan-error-dismiss" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {result && (
        <div className="scan-result-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>Scan Result</h2>
            <button className="secondary" onClick={() => navigate(`/domain?domain=${encodeURIComponent(result.url?.replace(/^https?:\/\//, "").split("/")[0] || "")}`)}>
              Full Domain Intel →
            </button>
          </div>
          <p><strong>URL:</strong> {result.url}</p>
          <p><strong>Status:</strong> {result.status_code}</p>
          <p><strong>Risk Level:</strong> <span className={`badge ${(result.risk_level || "").toLowerCase()}`}>{result.risk_level}</span></p>
          {result.risk_score != null && <p><strong>Risk Score:</strong> {result.risk_score}/100</p>}
          {result.server && <p><strong>Server:</strong> {result.server}</p>}
          {result.technology && <p><strong>Technology:</strong> {result.technology}</p>}
          {result.missing_headers?.length > 0 && (
            <div>
              <strong>Missing Headers:</strong>
              <ul>
                {result.missing_headers.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {result.ssl_expiry && <p><strong>SSL Expires:</strong> {result.ssl_expiry}</p>}
          {result.redirect_chain?.length > 1 && (
            <div>
              <strong>Redirect Chain:</strong>
              <ul>
                {result.redirect_chain.map((r, i) => (
                  <li key={i}>{r.url} → {r.status}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}


<div className="history-section">
  <h2>Recent Scans</h2>
  <table className="history-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((s) => (
              <tr key={s._id}>
                <td>{s.url}</td>
                <td>{s.status_code}</td>
                <td><span className={`badge ${(s.risk_level || "").toLowerCase()}`}>{s.risk_level}</span></td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default WebsiteIntelligence;
