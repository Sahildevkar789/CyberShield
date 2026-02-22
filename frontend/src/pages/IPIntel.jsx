import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function IPIntel() {
  const [ipInput, setIpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abuseData, setAbuseData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [error, setError] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const lookupIP = async () => {
    if (!ipInput.trim()) return;

    setLoading(true);
    setAbuseData(null);
    setGeoData(null);
    setError(null);

    const ip = ipInput.trim();

    try {
      const headers = { Authorization: `Bearer ${userInfo?.token}` };

      const [abuseRes, geoRes] = await Promise.allSettled([
        axios.post("http://localhost:5000/api/ip/reputation", { ip }, { headers }),
        axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 })
      ]);

      if (abuseRes.status === "fulfilled") setAbuseData(abuseRes.value.data);
      else setError(abuseRes.reason?.response?.data?.message || "AbuseIPDB lookup failed");

      if (geoRes.status === "fulfilled" && geoRes.value.data) {
        if (!geoRes.value.data.error) setGeoData(geoRes.value.data);
      }
    } catch (e) {
      setError(e.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const data = abuseData?.data || abuseData;

  return (
    <Layout>
      <h1>IP Intelligence</h1>
      <p>AbuseIPDB reputation + GeoIP location</p>

      <div className="intel-card" style={{ marginTop: "20px" }}>
        <div className="section-title">IP Lookup</div>
        <div className="domain-search">
          <input
            placeholder="Enter IP address (e.g. 8.8.8.8)"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupIP()}
          />
          <button onClick={lookupIP} disabled={loading}>
            {loading ? "Looking up..." : "Lookup"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="intel-card scan-loading-card">
          <p>Analyzing IP...</p>
          <div className="loader-bar"></div>
        </div>
      )}

      {error && (
        <div className="intel-card">
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {(data || geoData) && (
        <div className="intel-grid" style={{ marginTop: "20px" }}>
          {data && (
            <div className="intel-card">
              <div className="section-title">AbuseIPDB Reputation</div>
              <p><strong>Abuse Score:</strong> <span className={`badge ${data.abuseConfidenceScore > 75 ? "danger" : data.abuseConfidenceScore > 25 ? "warning" : "low"}`}>{data.abuseConfidenceScore}%</span></p>
              <p><strong>Total Reports:</strong> {data.totalReports ?? "—"}</p>
              <p><strong>Country:</strong> {data.countryName ?? "—"}</p>
              <p><strong>ISP:</strong> {data.isp ?? "—"}</p>
              <p><strong>Domain:</strong> {data.domain ?? "—"}</p>
              <p><strong>Usage Type:</strong> {data.usageType ?? "—"}</p>
            </div>
          )}
          {geoData && (
            <div className="intel-card">
              <div className="section-title">GeoIP Location</div>
              <p><strong>Country:</strong> {geoData.country_name}</p>
              <p><strong>City:</strong> {geoData.city}</p>
              <p><strong>Region:</strong> {geoData.region}</p>
              <p><strong>Latitude:</strong> {geoData.latitude}</p>
              <p><strong>Longitude:</strong> {geoData.longitude}</p>
              <p><strong>Timezone:</strong> {geoData.timezone}</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default IPIntel;
