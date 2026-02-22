import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import API_BASE_URL from "../api";

function PortIntelligence() {
  const [hostInput, setHostInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setHistory(data.portScans || []);
    } catch (e) {
      console.error(e);
    }
  };

  const scanPorts = async () => {
    if (!hostInput.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/portscan`,
        { host: hostInput },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setResult(data);
      console.log(result);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Port scan failed");
    } finally {
      setLoading(false);
    }
  };

  const formatPorts = (openPorts) => {
    if (!openPorts) return "-";
    if (Array.isArray(openPorts) && openPorts.length > 0) {
      const first = openPorts[0];
      if (typeof first === "object" && first.port != null) {
        return openPorts.map((p) => `${p.port} (${p.description || "Unknown"})`).join(", ");
      }
      return openPorts.join(", ");
    }
    return "-";
  };

  return (
    <Layout>
      <h1>Port Intelligence</h1>
      <p>Nmap-style Service Detection</p>

      <div className="scan-input-section">
        <input
          type="text"
          placeholder="Enter host (example.com)"
          value={hostInput}
          onChange={(e) => setHostInput(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <button onClick={scanPorts} disabled={loading}>
          {loading ? "Scanning..." : "Scan Ports"}
        </button>
      </div>

      {loading && (
        <div className="intel-card scan-loading-card">
          <p>Scanning ports...</p>
          <div className="loader-bar"></div>
        </div>
      )}

      {result && (
       <div className="scan-result-card">
          <h2>Scan Result</h2>
          <p><strong>Host:</strong> {result.host}</p>
          <p><strong>Risk Level:</strong> <span className={`badge ${(result.risk_level || "").toLowerCase()}`}>{result.risk_level}</span></p>
          <p><strong>Open Ports:</strong></p>
          <ul>
            {result.open_ports?.map((p, i) => (
              <li key={i}>
                {typeof p === "object" ? `${p.port} - ${p.description}` : `${p} - Unknown Service`}
              </li>
            ))}
          </ul>
        </div>
      )}

<div className="history-section">
  <h2>Recent Scans</h2>
  <table className="history-table">
          <thead>
            <tr>
              <th>Host</th>
              <th>Open Ports</th>
              <th>Risk</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((s) => (
              <tr key={s._id}>
                <td>{s.host}</td>
                <td>{formatPorts(s.open_ports)}</td>
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

export default PortIntelligence;
