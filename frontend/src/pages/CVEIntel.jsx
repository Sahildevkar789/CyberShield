import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function CVEIntel() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const searchCVE = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/cve/search",
        { keyword: keyword.trim() },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err.response?.data?.message || "CVE search failed");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ["nginx", "openssl", "apache", "wordpress", "log4j"];

  return (
    <Layout>
      <h1>CVE Vulnerability Search</h1>
      <p>Search NVD database for known vulnerabilities</p>

      <div className="intel-card" style={{ marginTop: "20px" }}>
        <div className="section-title">Search CVEs</div>
        <div className="domain-search">
          <input
            placeholder="Keyword (e.g. nginx, openssl)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCVE()}
          />
          <button onClick={searchCVE} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Try: {suggestions.map((s, i) => (
            <span key={s} onClick={() => setKeyword(s)} style={{ cursor: "pointer", marginRight: "8px", textDecoration: "underline" }}>{s}</span>
          ))}
        </p>
      </div>

      {loading && (
        <div className="intel-card scan-loading-card">
          <p>Searching NVD database...</p>
          <div className="loader-bar"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="intel-card" style={{ marginTop: "20px" }}>
          <div className="section-title">Results ({results.length})</div>
          {results.map((item, i) => {
            const cve = item.cve || item;
            const id = cve.id || "CVE-????-?????";
            const desc = cve.descriptions?.find(d => d.lang === "en")?.value || "No description";
            const cvss = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];
            const score = cvss?.cvssData?.baseScore ?? "—";
            const severity = cvss?.cvssData?.baseSeverity ?? "—";
            return (
              <div key={i} className="alert-item" style={{ marginBottom: "12px" }}>
                <p style={{ margin: "0 0 8px" }}><strong>{id}</strong> · CVSS {score} ({severity})</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  {desc.length > 200 ? desc.slice(0, 200) + "…" : desc}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && keyword && (
        <div className="intel-card" style={{ marginTop: "20px" }}>
          <p>No vulnerabilities found for "{keyword}"</p>
        </div>
      )}
    </Layout>
  );
}

export default CVEIntel;
