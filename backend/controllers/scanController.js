const axios = require("axios");
const Scan = require("../models/Scan");

function computeRisk(result) {
  let riskScore = 0;
  if (!result.ssl_valid) riskScore += 40;
  if (!result.https) riskScore += 30;
  (result.missing_headers || []).forEach(() => { riskScore += 8; });
  if (result.status_code >= 400) riskScore += 20;
  if (result.status_code >= 500) riskScore += 30;
  riskScore = Math.min(100, riskScore);
  let risk = "Low";
  if (riskScore > 50) risk = "High";
  else if (riskScore > 20) risk = "Medium";
  return { risk_score: riskScore, risk_level: risk };
}

/** Build user-friendly error from scanner/network failure. */
function scanError(err, scannerMessage) {
  if (scannerMessage) {
    return { message: scannerMessage, code: "SCANNER_ERROR", hint: "The scan service could not analyze this URL. Check the URL format and try again." };
  }
  const code = err.code || err.response?.status;
  if (err.code === "ECONNREFUSED") {
    return { message: "Website scanner service is not running.", code: "SERVICE_DOWN", hint: "Start the scanner microservice (e.g. on port 5001) or check WEBSITE_SCANNER_URL in server config." };
  }
  if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") {
    return { message: "Scan timed out. The target may be slow or unreachable.", code: "TIMEOUT", hint: "Try a different URL or try again later." };
  }
  if (err.code === "ENOTFOUND" || err.code === "ERR_NETWORK") {
    return { message: "Could not reach the target. Check the URL or your network.", code: "NETWORK", hint: "Ensure the URL is valid (e.g. https://example.com) and the host exists." };
  }
  if (err.response?.status >= 500) {
    return { message: "Scanner service error. Please try again later.", code: "SERVER_ERROR", hint: "The scan service may be overloaded or misconfigured." };
  }
  if (err.response?.data?.message) {
    return { message: err.response.data.message, code: "SCANNER_ERROR", hint: "Verify the URL and ensure the site is reachable." };
  }
  return { message: "Scan could not be completed. Please try again.", code: "UNKNOWN", hint: "If this persists, check that the scanner service is running and the URL is valid." };
}

/** Run website scan and save for user. Returns { scan } or { error }. */
async function runWebsiteScan(url, userId) {
  try {
    if (!process.env.WEBSITE_SCANNER_URL) {
      throw new Error("WEBSITE_SCANNER_URL not configured");
    }

    const response = await axios.post(
      `${process.env.WEBSITE_SCANNER_URL}/scan`,
      { url },
      { timeout: 30000 }
    );

    const result = response.data;
    if (result.status === "error") {
      return { error: scanError(null, result.message || "The scanner could not analyze this URL.") };
    }
    const { risk_score: riskScore, risk_level: risk } = computeRisk(result);
    const scan = await Scan.create({
      user: userId,
      url,
      status_code: result.status_code || 0,
      https: result.https || false,
      ssl_valid: result.ssl_valid || false,
      headers: result.headers || {},
      risk_level: risk,
      risk_score: riskScore,
      missing_headers: result.missing_headers || [],
      server: result.server || null,
      technology: result.technology || null,
      ssl_expiry: result.ssl_expiry || null,
      redirect_chain: result.redirect_chain || []
    });
    return { scan };
  } catch (err) {
    console.error("Website Scan Error:", err.message);
    return { error: scanError(err) };
  }
}

exports.runWebsiteScan = runWebsiteScan;

exports.websiteScan = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "URL is required", code: "MISSING_URL" });
    }
    const out = await runWebsiteScan(url, req.user._id);
    if (out.error) {
      return res.status(400).json({
        message: out.error.message,
        code: out.error.code,
        hint: out.error.hint
      });
    }
    res.json(out.scan);
  } catch (error) {
    console.error("Website Scan Error:", error.message);
    const err = scanError(error);
    return res.status(500).json({ message: err.message, code: err.code, hint: err.hint });
  }
};
