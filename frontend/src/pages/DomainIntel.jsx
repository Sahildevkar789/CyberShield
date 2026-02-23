import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import API_BASE_URL from "../api";

const API = `${API_BASE_URL}/api/threat/domain-intel`;

function DomainIntel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const domainParam = searchParams.get("domain") || "";
  const [domain, setDomain] = useState(domainParam || "");
  const [searchInput, setSearchInput] = useState(domainParam || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [data, setData] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  useEffect(() => {
    if (domainParam) {
      setDomain(domainParam);
      setSearchInput(domainParam);
    }
  }, [domainParam]);

  const handleLookup = async () => {
    const target = searchInput.trim();
    if (!target) return;

    setSearchParams({ domain: target });
    setDomain(target);
    setLoading(true);
    setErrors([]);
    setData(null);

    try {
      const { data: res } = await axios.post(
        API,
        { domain: target },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setData(res);
      if (res?.errors?.length) {
        setErrors(res.errors);
      }
    } catch (e) {
      setErrors([{ source: "Request", message: e.response?.data?.message || e.message || "Lookup failed", hint: e.response?.data?.hint }]);
    } finally {
      setLoading(false);
    }
  };

  const vt = data?.vt || null;
  const website = data?.website || null;
  const malCount = vt?.malicious ?? 0;
  const suspiciousCount = vt?.suspicious ?? 0;
  const harmlessCount = vt?.harmless ?? 0;
  const undetectedCount = vt?.undetected ?? 0;
  const totalEngines = vt?.total ?? 0;
  const displayScore = totalEngines ? `${malCount}/${totalEngines}` : (website?.risk_score ?? "—");
  const vtRisk = malCount > 0 ? "high" : suspiciousCount > 0 ? "medium" : "low";
  const webRisk = (website?.risk_level || "").toLowerCase();
  const overallRisk = webRisk === "high" || vtRisk === "high" ? "high" : webRisk === "medium" || vtRisk === "medium" ? "medium" : "low";
  const circleClass = overallRisk === "high" ? "danger" : overallRisk === "medium" ? "warning" : "safe";
  const maliciousEngines = vt?.engines?.filter((e) => e.result && e.result !== "clean" && e.result !== "unrated" && String(e.result).toLowerCase() !== "null") || [];

  return (
    <Layout>
      <div className="domain-intel-page">
        <div className="domain-search">
          <input
            placeholder="Enter domain (e.g. google.com or https://example.com)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <button onClick={handleLookup} disabled={loading}>
            {loading ? "Analyzing…" : "Lookup"}
          </button>
        </div>

        {errors.length > 0 && (
          <div className="scan-error-card" style={{ marginBottom: "20px" }}>
            <div className="scan-error-header">
              <span className="scan-error-icon" aria-hidden>⚠</span>
              <h3 className="scan-error-title">Lookup had issues</h3>
            </div>
            {errors.map((err, i) => (
              <div key={i} style={{ marginBottom: i < errors.length - 1 ? "14px" : 0 }}>
                <p className="scan-error-message" style={{ marginBottom: "4px" }}>
                  <strong>{err.source}:</strong> {err.message}
                </p>
                {err.hint && (
                  <div className="scan-error-hint" style={{ marginBottom: "8px" }}>
                    {err.hint}
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="scan-error-dismiss" onClick={() => setErrors([])}>
              Dismiss
            </button>
          </div>
        )}

        {domain && (
          <>
            <div className="score-card domain-score-card">
              <div className={`score-circle ${circleClass}`}>
                {loading ? "…" : displayScore}
              </div>
              <div className="score-meta">
                <h2>{data?.domain || domain}</h2>
                <p className="risk-line">
                  Overall risk: <span className={`badge ${overallRisk}`}>{overallRisk.toUpperCase()}</span>
                  {website?.risk_level && (
                    <span className="muted"> · Web: {website.risk_level}</span>
                  )}
                  {totalEngines > 0 && (
                    <span className="muted"> · VT: {malCount} malicious / {totalEngines} engines</span>
                  )}
                </p>
                {(website?.server || website?.technology) && (
                  <p className="tech-line">
                    {website.server && <span>Server: {website.server}</span>}
                    {website.server && website.technology && " · "}
                    {website.technology && <span>Tech: {website.technology}</span>}
                  </p>
                )}
                {(website?.ssl_expiry || vt?.last_analysis_date) && (
                  <p className="date-line">
                    {website?.ssl_expiry && <span>SSL expires: {website.ssl_expiry}</span>}
                    {website?.ssl_expiry && vt?.last_analysis_date && " · "}
                    {vt?.last_analysis_date && (
                      <span>VT analysis: {new Date(vt.last_analysis_date).toLocaleString()}</span>
                    )}
                  </p>
                )}
                {!website && !vt && !loading && (
                  <p className="muted">Run a lookup to see domain intelligence.</p>
                )}
              </div>
            </div>

            <div className="tabs">
              <span className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
                Overview
              </span>
              <span className={activeTab === "details" ? "active" : ""} onClick={() => setActiveTab("details")}>
                Headers & Details
              </span>
              <span className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>
                Security & Engines
              </span>
            </div>

            {activeTab === "overview" && (
              <div className="intel-card">
                <div className="section-title">Detection summary</div>
                {vt && (
                  <div className="threat-grid">
                    <div className="threat-box">
                      <p className="threat-label">Malicious</p>
                      <p className="threat-value danger">{malCount}</p>
                    </div>
                    <div className="threat-box">
                      <p className="threat-label">Suspicious</p>
                      <p className="threat-value warning">{suspiciousCount}</p>
                    </div>
                    <div className="threat-box">
                      <p className="threat-label">Harmless</p>
                      <p className="threat-value">{harmlessCount}</p>
                    </div>
                    <div className="threat-box">
                      <p className="threat-label">Undetected</p>
                      <p className="threat-value">{undetectedCount}</p>
                    </div>
                  </div>
                )}
                {website && (
                  <>
                    <div className="section-title" style={{ marginTop: "16px" }}>Web security</div>
                    <ul className="check-list">
                      <li className={website.https ? "ok" : "fail"}>HTTPS: {website.https ? "Yes" : "No"}</li>
                      <li className={website.ssl_valid ? "ok" : "fail"}>Valid SSL: {website.ssl_valid ? "Yes" : "No"}</li>
                      <li>Status code: {website.status_code ?? "—"}</li>
                    </ul>
                    {website.missing_headers?.length > 0 && (
                      <p className="muted">Missing security headers: {website.missing_headers.join(", ")}</p>
                    )}
                  </>
                )}
                {!vt && !website && !loading && (
                  <p className="muted">No overview data. Check errors above or run again.</p>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="intel-card">
                <div className="section-title">Missing security headers</div>
                {website?.missing_headers?.length > 0 ? (
                  <ul className="header-list">
                    {website.missing_headers.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">None missing or no website scan data.</p>
                )}
                <div className="section-title" style={{ marginTop: "16px" }}>Response headers</div>
                {website?.headers && Object.keys(website.headers).length > 0 ? (
                  <div className="headers-block">
                    {Object.entries(website.headers).map(([k, v]) => (
                      <p key={k}><span className="header-key">{k}</span>: {v || "(not set)"}</p>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No header data. Website scan may have failed.</p>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="intel-card">
                <div className="section-title">TLS & redirects</div>
                {website && (
                  <>
                    <p>HTTPS: <strong>{website.https ? "Yes" : "No"}</strong></p>
                    <p>SSL valid: <strong>{website.ssl_valid ? "Yes" : "No"}</strong></p>
                    {website.redirect_chain?.length > 0 && (
                      <>
                        <p>Redirect chain:</p>
                        <ul className="redirect-list">
                          {website.redirect_chain.map((r, i) => (
                            <li key={i}>{r.url} → {r.status}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
                <div className="section-title" style={{ marginTop: "16px" }}>VirusTotal engines (flagged)</div>
                {maliciousEngines.length > 0 ? (
                  <div className="engine-list">
                    {maliciousEngines.map((engine, i) => (
                      <div key={i} className="engine-item">
                        <span className="engine-name">{engine.name}</span> → {engine.result}
                      </div>
                    ))}
                  </div>
                ) : vt?.engines?.length > 0 ? (
                  <p className="muted">No engines flagged this URL as malicious.</p>
                ) : (
                  <p className="muted">No VirusTotal engine data.</p>
                )}
              </div>
            )}
          </>
        )}

        {!domain && (
          <div className="intel-card">
            <div className="section-title">Domain Intelligence</div>
            <p>Enter a domain above to analyze. You get:</p>
            <ul className="feature-list">
              <li>Threat score and risk level (VirusTotal + website scan)</li>
              <li>Detection breakdown: malicious / suspicious / harmless / undetected</li>
              <li>HTTP headers and missing security headers</li>
              <li>SSL/TLS and redirect chain</li>
              <li>VirusTotal engine results (flagged engines)</li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DomainIntel;
