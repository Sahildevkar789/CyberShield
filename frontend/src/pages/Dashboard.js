import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import Layout from "../components/Layout";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [newsError, setNewsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("newAlert", (alert) => {
      const item = {
        type: alert.type,
        target: alert.target,
        risk: alert.risk_level,
        date: alert.createdAt
      };
      setLiveAlerts((prev) => [item, ...prev].slice(0, 5));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          authorization: `Bearer ${userInfo?.token}`
        };

        const [statsRes, newsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/stats", { headers }),
          axios
            .get("http://localhost:5000/api/news", { headers })
            .catch((e) => ({
              data: [],
              error:
                e.response?.data?.message || "News unavailable"
            }))
        ]);

        setStats(statsRes.data);
        setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
        setNewsError(newsRes?.error || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
    const riskLevel = (stats?.riskScore ?? 0) > 70 ? "high" : (stats?.riskScore ?? 0) > 40 ? "medium" : "low";
    const totalScans = (stats?.threatStats?.totalWebsiteScans ?? 0) + (stats?.threatStats?.totalPortScans ?? 0);

    return (
      <Layout>
        <div className="dashboard-hero">
          <h1 className="dashboard-hero-title">
            <span className="dashboard-hero-icon">🛡️</span>
            Threat Intelligence Dashboard
          </h1>
          <p className="dashboard-hero-sub">Real-time risk score, scans & AI-powered insights</p>
        </div>

        {loading ? (
          <div className="page-loading">
            <span>Loading dashboard…</span>
            <div className="loader-dots"><span></span><span></span><span></span></div>
          </div>
        ) : (
          <>
            {/* ================= NEXT-LEVEL STATS ROW ================= */}
            <div className="dashboard-stats-row">
              {/* THREAT SCORE CARD */}
              <div className="dashboard-score-card">
                <div className="dashboard-score-card-glow" />
                <div className="dashboard-score-left">
                  <div className={`dashboard-gauge dashboard-gauge--${riskLevel}`}>
                    <span className="dashboard-gauge-value">{stats?.riskScore ?? 0}</span>
                    <span className="dashboard-gauge-label">SCORE</span>
                  </div>
                </div>
                <div className="dashboard-score-right">
                  <h2 className="dashboard-score-title">Overall Threat Score</h2>
                  <div className="dashboard-metrics">
                    <div className="dashboard-metric dashboard-metric--danger">
                      <span className="dashboard-metric-value">{stats?.threatStats?.highRiskWebsites ?? 0}</span>
                      <span className="dashboard-metric-label">High-Risk Sites</span>
                    </div>
                    <div className="dashboard-metric dashboard-metric--warning">
                      <span className="dashboard-metric-value">{stats?.threatStats?.highRiskPorts ?? 0}</span>
                      <span className="dashboard-metric-label">High-Risk Ports</span>
                    </div>
                    <div className="dashboard-metric dashboard-metric--accent">
                      <span className="dashboard-metric-value">{totalScans}</span>
                      <span className="dashboard-metric-label">Total Scans</span>
                    </div>
                    <div className="dashboard-metric dashboard-metric--info">
                      <span className="dashboard-metric-value">{stats?.alerts?.length ?? 0}</span>
                      <span className="dashboard-metric-label">Active Alerts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPANY / CREATOR CARD */}
              <div className="dashboard-company-card">
                <div className="dashboard-company-card-border" />
                <div className="dashboard-company-grid">
                  <div className="dashboard-company-logo" onClick={() => window.open("https://www.linkedin.com/company/cyberleelawat/", "_blank")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && window.open("https://www.linkedin.com/company/cyberleelawat/", "_blank")}>
                    <img src="/logo.png" alt="Cyber Leelawat" />
                  </div>
                  <div className="dashboard-company-details">
                    <h2 className="dashboard-company-name">Cyber Leelawat</h2>
                    <p className="dashboard-company-tagline">Cybersecurity Company · Internship Program</p>
                    <div className="dashboard-company-meta">
                      <span className="dashboard-company-badge">Sahil Devkar</span>
                      <span className="dashboard-company-badge">Intern · Cybersecurity</span>
                    </div>
                    <div className="dashboard-company-links">
                      <button type="button" className="dashboard-link-pill" onClick={() => window.open("https://www.linkedin.com/in/sahil-devkar-917906290/", "_blank")}>LinkedIn</button>
                      <button type="button" className="dashboard-link-pill" onClick={() => window.open("https://github.com/sahildevkar789", "_blank")}>GitHub</button>
                      <a href="mailto:Sahildevkar789@gmail.com" className="dashboard-link-pill">Email</a>
                    </div>
                    <p className="dashboard-company-desc">
                      Building this threat intelligence platform as part of my cybersecurity internship at Cyber Leelawat. 
                      Use the modules below to run website, port, and threat scans and get AI-powered security insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="dashboard-below-desc">
              This dashboard shows your overall threat score from recent scans and quick access to all tools. 
              Run website and port scans to populate metrics; high-risk findings appear in alerts. 
              Reports can be previewed and downloaded as PDF from the Reports page.
            </p>
    
            {/* ================= MODULE CARDS ================= */}
            <div className="card-grid">
              <div className="module-card" onClick={() => navigate("/website")}>
                <h3>Website Intelligence</h3>
                <p>Deep HTTP + SSL + Header Analysis</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/port")}>
                <h3>Port Intelligence</h3>
                <p>Nmap-style Service Detection</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/threat")}>
                <h3>Threat Intelligence</h3>
                <p>VirusTotal + Reputation APIs</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/domain")}>
                <h3>Domain Intel</h3>
                <p>VirusTotal-style Domain Analysis</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/password")}>
                <h3>Password Intelligence</h3>
                <p>Entropy · Crack Time · Secure Recommendations</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/ip")}>
                <h3>IP Intelligence</h3>
                <p>AbuseIPDB · GeoIP · Reputation</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/cve")}>
                <h3>CVE Search</h3>
                <p>NVD Vulnerability Database</p>
              </div>
    
              <div className="module-card" onClick={() => navigate("/assistant")}>
                <h3>Cyber AI Assistant</h3>
                <p>Security Q&A · Threat Explanation</p>
              </div>
            </div>
    
            {/* ================= NEWS + ALERTS ================= */}
            <div className="dashboard-section news-alert-row">
    
              <div className="news-card">
              <h1 className="section-title-1" style={{ color: "white" }}>
  Latest Cyber Threat News
  <br/>
</h1>
    
                {news.length === 0 ? (
                  <p>{newsError || "No cyber threat news available."}</p>
                ) : (
                  news.map((article, i) => (
                    <div key={i} className="news-item">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </a>
                    </div>
                  ))
                )}
              </div>
    
              <div className="alerts-card">
                <h2>
                  Last 5 Alerts
                  {liveAlerts.length > 0 && (
                    <span className="badge-live">LIVE</span>
                  )}
                </h2>
    
                {(stats?.alerts?.length === 0 &&
                  liveAlerts.length === 0) ? (
                  <p>No alerts yet. Run some scans.</p>
                ) : (
                  (liveAlerts.length > 0
                    ? liveAlerts
                    : stats?.alerts || []
                  )
                    .slice(0, 5)
                    .map((a, i) => (
                      <div
                        key={i}
                        className={`alert-item ${(a.risk || "").toLowerCase()}`}
                      >
                        <strong>{a.type}</strong>: {a.target}
                        <br />
                        <span className="alert-meta">
                          {a.risk} ·{" "}
                          {new Date(
                            a.date || a.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))
                )}
              </div>
    
            </div>
          </>
        )}
      </Layout>
    );

  }export default Dashboard;