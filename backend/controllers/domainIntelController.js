const { getVirusTotalReport } = require("./threatController");
const { runWebsiteScan } = require("./scanController");

/** Normalize domain for display (strip protocol, trailing slash) */
function normalizeDomain(input) {
  const s = (input || "").trim();
  if (!s) return "";
  try {
    const url = s.startsWith("http") ? s : `https://${s}`;
    const u = new URL(url);
    return u.hostname || s;
  } catch {
    return s.replace(/^https?:\/\//, "").split("/")[0] || s;
  }
}

function fullUrl(domain) {
  const d = (domain || "").trim();
  return d.startsWith("http") ? d : `https://${d}`;
}

exports.domainIntel = async (req, res) => {
  try {
    const domainOrUrl = req.body?.domain ?? req.body?.url ?? req.query?.domain ?? req.query?.url ?? "";
    if (!domainOrUrl.trim()) {
      return res.status(400).json({ message: "Domain or URL is required" });
    }
    const url = fullUrl(domainOrUrl);
    const domain = normalizeDomain(domainOrUrl);

    const [vtRes, scanRes] = await Promise.allSettled([
      getVirusTotalReport(url),
      runWebsiteScan(url, req.user._id)
    ]);

    const vt = vtRes.status === "fulfilled" ? vtRes.value : null;
    const scanOut = scanRes.status === "fulfilled" ? scanRes.value : null;
    const website = scanOut?.scan ?? null;
    const errors = [];
    if (vtRes.status === "rejected") errors.push({ source: "VirusTotal", message: vtRes.reason?.message || "Failed" });
    if (scanRes.status === "rejected") errors.push({ source: "Website scan", message: scanRes.reason?.message || "Failed" });
    if (scanOut?.error) errors.push({ source: "Website scan", message: scanOut.error.message, hint: scanOut.error.hint });

    return res.json({
      domain,
      url,
      vt,
      website,
      errors: errors.length ? errors : undefined
    });
  } catch (error) {
    console.error("Domain Intel error:", error);
    return res.status(500).json({ message: "Domain intelligence lookup failed" });
  }
};
