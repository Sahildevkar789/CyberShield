import { useState, useEffect } from "react";
import Layout from "../components/Layout";

const API = "http://localhost:5000/api/report";

function Reports() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchPreview = async () => {
    setLoadingPreview(true);
    setShowPreview(true);
    try {
      const res = await fetch(`${API}/preview`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      const data = await res.json();
      if (res.ok) setPreview(data);
      else setPreview({ error: data.message || "Failed to load preview" });
    } catch (err) {
      setPreview({ error: "Could not load report preview." });
    } finally {
      setLoadingPreview(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "CyberShield_Report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Report download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="reports-hero">
        <h1 className="page-title reports-title">
          <span className="reports-title-icon">📊</span> Security Reports
        </h1>
        <p className="reports-tagline">
          Preview your full security report and download as PDF — scans, ports, passwords, phishing checks.
        </p>
      </div>

      <div className="reports-actions">
        <button
          type="button"
          className="reports-btn reports-btn-preview"
          onClick={fetchPreview}
          disabled={loadingPreview}
        >
          {loadingPreview ? "Loading…" : "👁 Preview Report"}
        </button>
        <button
          type="button"
          className="reports-btn reports-btn-download"
          onClick={downloadReport}
          disabled={downloading}
        >
          {downloading ? "Downloading…" : "⬇ Download PDF"}
        </button>
      </div>

      {showPreview && (
        <div className="report-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="report-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-preview-header">
              <h2>Report Preview</h2>
              <button type="button" className="report-preview-close" onClick={() => setShowPreview(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="report-preview-body">
              {loadingPreview && (
                <div className="report-preview-loading">
                  <div className="loader-dots"><span></span><span></span><span></span></div>
                  <p>Generating preview…</p>
                </div>
              )}
              {!loadingPreview && preview?.error && (
                <p className="report-preview-error">{preview.error}</p>
              )}
              {!loadingPreview && preview && !preview.error && (
                <div className="report-preview-content">
                  <section className="report-preview-section">
                    <h3>Summary</h3>
                    <div className="report-preview-summary-grid">
                      <div className="report-preview-stat">
                        <span className="report-preview-stat-value">{preview.summary?.totalWebsiteScans ?? 0}</span>
                        <span>Website Scans</span>
                      </div>
                      <div className="report-preview-stat">
                        <span className="report-preview-stat-value">{preview.summary?.totalPortScans ?? 0}</span>
                        <span>Port Scans</span>
                      </div>
                      <div className="report-preview-stat">
                        <span className="report-preview-stat-value">{preview.summary?.totalPasswordChecks ?? 0}</span>
                        <span>Password Checks</span>
                      </div>
                      <div className="report-preview-stat">
                        <span className="report-preview-stat-value">{preview.summary?.totalPhishingChecks ?? 0}</span>
                        <span>Phishing Checks</span>
                      </div>
                    </div>
                    {preview.summary?.generatedAt && (
                      <p className="report-preview-meta">
                        Generated: {new Date(preview.summary.generatedAt).toLocaleString()}
                      </p>
                    )}
                  </section>

                  {preview.websiteScans?.length > 0 && (
                    <section className="report-preview-section">
                      <h3>Website Scans</h3>
                      <ul className="report-preview-list">
                        {preview.websiteScans.map((s, i) => (
                          <li key={i} className={`report-preview-item risk-${(s.risk_level || "").toLowerCase()}`}>
                            {s.url} — Status: {s.status_code} · Risk: <strong>{s.risk_level}</strong>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {preview.portScans?.length > 0 && (
                    <section className="report-preview-section">
                      <h3>Port Scans</h3>
                      <ul className="report-preview-list">
                        {preview.portScans.map((s, i) => (
                          <li key={i} className={`report-preview-item risk-${(s.risk_level || "").toLowerCase()}`}>
                            {s.host} — Open: {(s.open_ports || []).map(p => typeof p === "object" ? `${p.port} (${p.description})` : p).join(", ") || "none"} · Risk: <strong>{s.risk_level}</strong>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {preview.passwordScans?.length > 0 && (
                    <section className="report-preview-section">
                      <h3>Password Analysis</h3>
                      <ul className="report-preview-list">
                        {preview.passwordScans.map((s, i) => (
                          <li key={i} className="report-preview-item">
                            Strength: <strong>{s.strength}</strong> · Entropy: {s.entropy}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {preview.phishingScans?.length > 0 && (
                    <section className="report-preview-section">
                      <h3>Phishing Detection</h3>
                      <ul className="report-preview-list">
                        {preview.phishingScans.map((s, i) => (
                          <li key={i} className="report-preview-item">
                            {s.url} — {s.prediction} ({s.confidence}%)
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {!preview.websiteScans?.length && !preview.portScans?.length && !preview.passwordScans?.length && !preview.phishingScans?.length && (
                    <p className="report-preview-empty">No scan data yet. Run some scans to see your report.</p>
                  )}
                </div>
              )}
            </div>
            {!loadingPreview && preview && !preview.error && (
              <div className="report-preview-footer">
                <button type="button" className="reports-btn reports-btn-download" onClick={() => { downloadReport(); setShowPreview(false); }}>
                  ⬇ Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Reports;
