import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function ThreatIntelligence() {
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const checkVirusTotal = async () => {
    if (!urlInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data } = await axios.post(
       `${API_BASE_URL}/api/threat/virustotal`,
        { url: urlInput },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );

      setResult(data);
      console.log("datameowwww");
      console.log(result);
    } catch (err) {
      alert(err.response?.data?.message || "VirusTotal check failed");
    } finally {
      setLoading(false);
    }
  };

  const riskClass =
    result?.malicious > 0
      ? "high"
      : result?.suspicious > 0
      ? "medium"
      : "low";

  return (
    <Layout>
      <h1>Threat Intelligence</h1>
      <p>VirusTotal Reputation & Multi-Engine Analysis</p>

      {/* INPUT SECTION */}
      <div className="scan-input-section">
        <input
          type="text"
          placeholder="Enter URL (https://example.com)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkVirusTotal()}
        />
        <button onClick={checkVirusTotal} disabled={loading}>
          {loading ? "Analyzing..." : "Check with VirusTotal"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="intel-card scan-loading-card">
          <p>Analyzing with multiple security engines...</p>
          <div className="loader-bar"></div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className={`scan-result-card risk-${riskClass}`}>
          <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
            
            {/* Detection Circle */}
            <div className={`detection-circle ${riskClass}`}>
            {result?.malicious ?? 0}/{result?.total ?? 0}
            </div>

            <div>
              <h2 style={{ margin: 0 }}>{urlInput}</h2>
              <p>
                Risk Level:{" "}
                <span className={`badge ${riskClass}`}>
                  {riskClass.toUpperCase()}
                </span>
              </p>
              {result.last_analysis_date && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Last Analysis:{" "}
                  {new Date(result.last_analysis_date).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Threat Grid */}
          <div className="threat-grid">
            <div className="threat-box">
              <p className="threat-label">Malicious</p>
              <p className="threat-value">{result?.malicious ?? 0}</p>
            </div>

            <div className="threat-box">
              <p className="threat-label">Suspicious</p>
              <p className="threat-value">{result.suspicious}</p>
            </div>

            <div className="threat-box">
              <p className="threat-label">Harmless</p>
              <p className="threat-value">{result.harmless}</p>
            </div>

            <div className="threat-box">
              <p className="threat-label">Undetected</p>
              <p className="threat-value">{result.undetected}</p>
            </div>
          </div>

          {/* Flagged Engines */}
          {result.engines?.length > 0 && (
            <>
              <div className="section-title">Flagged By Security Engines</div>
              <div className="engine-list">
                {result.engines.map((engine, i) => (
                  <div key={i} className="engine-item">
                    <span className="engine-name">
                      {engine.name}
                    </span>{" "}
                    → {engine.result}
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: "20px" }}>
            <button
              className="secondary"
              onClick={() =>
                navigate(
                  `/domain?domain=${encodeURIComponent(
                    urlInput.replace(/^https?:\/\//, "")
                  )}`
                )
              }
            >
              Full Domain Intel →
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ThreatIntelligence;
