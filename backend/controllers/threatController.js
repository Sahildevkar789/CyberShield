const axios = require("axios");

const headers = (apiKey) => ({ "x-apikey": apiKey });

/** Normalize VirusTotal analysis response to frontend shape */
function normalizeAnalysis(vtData) {
  const attrs = vtData?.data?.attributes || {};
  const stats = attrs.stats || {};
  const results = attrs.results || {};
  const malicious = stats.malicious ?? 0;
  const suspicious = stats.suspicious ?? 0;
  const harmless = stats.harmless ?? 0;
  const undetected = stats.undetected ?? 0;
  const total = malicious + suspicious + harmless + undetected;
  const engines = Object.entries(results).map(([name, r]) => ({
    name,
    result: r?.result ?? (r?.category || "unknown")
  }));
  return {
    status: attrs.status || "unknown",
    malicious,
    suspicious,
    harmless,
    undetected,
    total: total || Object.keys(results).length,
    last_analysis_date: attrs.date ? attrs.date * 1000 : null,
    engines
  };
}

/** Poll analysis until completed or max attempts */
async function getAnalysisWithPolling(analysisId, apiKey, maxAttempts = 5, delayMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: headers(apiKey) }
    );
    const status = data?.data?.attributes?.status;
    if (status === "completed") return data;
    if (i < maxAttempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  const { data } = await axios.get(
    `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
    { headers: headers(apiKey) }
  );
  return data;
}

/** Get VirusTotal report for a URL (normalized). For use by domain intel. */
async function getVirusTotalReport(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;
  const submit = await axios.post(
    "https://www.virustotal.com/api/v3/urls",
    new URLSearchParams({ url }),
    {
      headers: {
        "x-apikey": apiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  const analysisUrl = submit.data?.data?.links?.analysis;
  const analysisId = submit.data?.data?.id;
  let raw;
  if (analysisUrl) {
    const result = await axios.get(analysisUrl, { headers: headers(apiKey) });
    raw = result.data;
  } else if (analysisId) {
    raw = await getAnalysisWithPolling(analysisId, apiKey);
  } else {
    raw = submit.data;
  }
  return normalizeAnalysis(raw);
}

exports.getVirusTotalReport = getVirusTotalReport;

exports.checkVirusTotal = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message: "VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to .env"
      });
    }
    const normalized = await getVirusTotalReport(url);
    return res.json(normalized);
  } catch (error) {
    console.error("VirusTotal error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Invalid VirusTotal API key" });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ message: "VirusTotal rate limit exceeded" });
    }
    return res.status(500).json({
      message: error.response?.data?.error?.message || "VirusTotal error"
    });
  }
};
