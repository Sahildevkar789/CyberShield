import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function History() {
  const [history, setHistory] = useState({
    websiteScans: [],
    portScans: [],
  });
  const [activeTab, setActiveTab] = useState("website");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const formatPorts = (openPorts) => {
    if (!openPorts) return "-";
    if (Array.isArray(openPorts) && openPorts.length > 0) {
      const first = openPorts[0];
      if (typeof first === "object" && first.port != null) {
        return openPorts.map((p) => `${p.port} (${p.description || "?"})`).join(", ");
      }
      return openPorts.join(", ");
    }
    return "-";
  };

  return (
    <Layout>
      <h1>History</h1>
      <p>All your past security scans</p>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("website")}
          style={{
            marginRight: "10px",
            background: activeTab === "website" ? "#00ffcc" : "#111827",
            color: activeTab === "website" ? "black" : "#00ffcc",
            border: "1px solid #00ffcc44",
          }}
        >
          Website Scans
        </button>
        <button
          onClick={() => setActiveTab("port")}
          style={{
            background: activeTab === "port" ? "#00ffcc" : "#111827",
            color: activeTab === "port" ? "black" : "#00ffcc",
            border: "1px solid #00ffcc44",
          }}
        >
          Port Scans
        </button>
      </div>

      {activeTab === "website" && (
        <div className="section">
          <h2>Website Scans</h2>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.websiteScans.length === 0 ? (
                <tr><td colSpan="4">No website scans yet</td></tr>
              ) : (
                history.websiteScans.map((s) => (
                  <tr key={s._id}>
                    <td>{s.url}</td>
                    <td>{s.status_code}</td>
                    <td><span className={`badge ${(s.risk_level || "").toLowerCase()}`}>{s.risk_level}</span></td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "port" && (
        <div className="section">
          <h2>Port Scans</h2>
          <table>
            <thead>
              <tr>
                <th>Host</th>
                <th>Open Ports</th>
                <th>Risk</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.portScans.length === 0 ? (
                <tr><td colSpan="4">No port scans yet</td></tr>
              ) : (
                history.portScans.map((s) => (
                  <tr key={s._id}>
                    <td>{s.host}</td>
                    <td>{formatPorts(s.open_ports)}</td>
                    <td><span className={`badge ${(s.risk_level || "").toLowerCase()}`}>{s.risk_level}</span></td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default History;
