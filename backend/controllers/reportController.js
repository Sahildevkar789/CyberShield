const PDFDocument = require("pdfkit");
const Scan = require("../models/Scan");
const PortScan = require("../models/PortScan");
const PasswordScan = require("../models/PasswordScan");
const PhishingScan = require("../models/PhishingScan");

/** Get report data as JSON for preview */
exports.getReportPreview = async (req, res) => {
  try {
    const userId = req.user._id;
    const [websiteScans, portScans, passwordScans, phishingScans] = await Promise.all([
      Scan.find({ user: userId }).lean(),
      PortScan.find({ user: userId }).lean(),
      PasswordScan.find({ user: userId }).lean(),
      PhishingScan.find({ user: userId }).lean()
    ]);
    res.json({
      summary: {
        totalWebsiteScans: websiteScans.length,
        totalPortScans: portScans.length,
        totalPasswordChecks: passwordScans.length,
        totalPhishingChecks: phishingScans.length,
        generatedAt: new Date().toISOString()
      },
      websiteScans: websiteScans.map((s) => ({
        url: s.url,
        status_code: s.status_code,
        risk_level: s.risk_level,
        createdAt: s.createdAt
      })),
      portScans: portScans.map((s) => ({
        host: s.host,
        open_ports: s.open_ports,
        risk_level: s.risk_level,
        createdAt: s.createdAt
      })),
      passwordScans: passwordScans.map((s) => ({
        strength: s.strength,
        entropy: s.entropy,
        createdAt: s.createdAt
      })),
      phishingScans: phishingScans.map((s) => ({
        url: s.url,
        prediction: s.prediction,
        confidence: s.confidence,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error("Report Preview Error:", error.message);
    res.status(500).json({ message: "Failed to load report preview" });
  }
};

// Helper: format port for display (avoid "undefined (undefined)")
function formatPort(p) {
  if (p == null) return "?";
  if (typeof p === "number") return String(p);
  if (typeof p === "object") {
    const port = p.port != null ? p.port : "?";
    const desc = p.description != null && String(p.description).trim() ? p.description : "—";
    return `${port} (${desc})`;
  }
  return String(p);
}

// Helper: truncate long text for PDF
function truncate(str, max = 70) {
  const s = String(str || "").trim();
  return s.length <= max ? s : s.slice(0, max - 3) + "...";
}

exports.generateReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const websiteScans = await Scan.find({ user: userId });
    const portScans = await PortScan.find({ user: userId });
    const passwordScans = await PasswordScan.find({ user: userId });
    const phishingScans = await PhishingScan.find({ user: userId });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const pageW = doc.page.width - 100;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=CyberShield_Security_Report.pdf"
    );

    doc.pipe(res);

    // ---------- COLORS ----------
    const accent = "#0891b2";
    const dark = "#0f172a";
    const muted = "#64748b";
    const danger = "#dc2626";
    const warning = "#d97706";
    const success = "#059669";

    // ---------- HEADER BAR ----------
    doc.rect(0, 0, doc.page.width, 52).fill(dark);
    doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text("CyberShield Security Report", 50, 16, { width: doc.page.width - 100 });
    doc.fontSize(9).fillColor("#94a3b8").font("Helvetica").text(`Generated ${new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`, 50, 36);

    doc.y = 70;

    // ---------- SUMMARY BOX ----------
    doc.fontSize(14).fillColor(dark).font("Helvetica-Bold").text("Summary", 50, doc.y);
    doc.moveDown(0.6);
    const summaryY = doc.y;
    doc.roundedRect(50, summaryY, pageW, 58, 4).stroke(muted).fill("#f8fafc");
    doc.fillColor(dark).font("Helvetica").fontSize(10);
    const col1 = 70, col2 = 200, col3 = 330, col4 = 460;
    doc.text("Website Scans", col1, summaryY + 14); doc.text(String(websiteScans.length), col1, summaryY + 28);
    doc.text("Port Scans", col2, summaryY + 14); doc.text(String(portScans.length), col2, summaryY + 28);
    doc.text("Password Checks", col3, summaryY + 14); doc.text(String(passwordScans.length), col3, summaryY + 28);
    doc.text("Phishing Checks", col4, summaryY + 14); doc.text(String(phishingScans.length), col4, summaryY + 28);
    doc.y = summaryY + 68;

    const rowH = 14;

    // ---------- SECTION: WEBSITE SCANS ----------
    doc.moveDown(0.5);
    sectionHead(doc, "Website Scans", 50, pageW, accent);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor(muted);
    websiteScans.forEach((scan, index) => {
      const rowY = doc.y;
      const risk = String(scan.risk_level || "").toLowerCase();
      doc.fillColor(riskColor(risk, { danger, warning, success }));
      doc.text(`${index + 1}.`, 50, rowY, { width: 22 });
      doc.fillColor(dark);
      doc.text(truncate(scan.url, 55), 72, rowY, { width: pageW - 120 });
      doc.fillColor(muted);
      doc.text(`Status ${scan.status_code ?? "—"}`, pageW - 80, rowY, { width: 75, align: "right" });
      doc.y = rowY + rowH;
    });

    // ---------- SECTION: PORT SCANS ----------
    doc.moveDown(0.6);
    sectionHead(doc, "Port Scans", 50, pageW, accent);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor(muted);
    portScans.forEach((scan, index) => {
      const rowY = doc.y;
      const portsStr = (scan.open_ports || []).map(formatPort).join(", ");
      const displayPorts = portsStr || "none";
      const risk = String(scan.risk_level || "").toLowerCase();
      doc.fillColor(riskColor(risk, { danger, warning, success }));
      doc.text(`${index + 1}.`, 50, rowY, { width: 22 });
      doc.fillColor(dark);
      doc.text(truncate(scan.host, 40), 72, rowY, { width: 180 });
      doc.fillColor(muted).fontSize(8);
      doc.text(truncate(displayPorts, 42), 255, rowY, { width: 220 });
      doc.fontSize(9);
      doc.fillColor(riskColor(risk, { danger, warning, success }));
      doc.text(scan.risk_level || "—", pageW - 70, rowY, { width: 65, align: "right" });
      doc.y = rowY + rowH;
    });

    // ---------- SECTION: PASSWORD ANALYSIS ----------
    doc.moveDown(0.6);
    sectionHead(doc, "Password Analysis", 50, pageW, accent);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9);
    passwordScans.forEach((scan, index) => {
      const rowY = doc.y;
      doc.fillColor(muted).text(`${index + 1}.`, 50, rowY, { width: 22 });
      doc.fillColor(dark).text(`Strength: ${scan.strength || "—"}`, 72, rowY, { width: 120 });
      doc.fillColor(muted).text(`Entropy: ${scan.entropy != null ? Number(scan.entropy).toFixed(2) : "—"}`, 195, rowY);
      doc.y = rowY + rowH;
    });

    // ---------- SECTION: PHISHING DETECTION ----------
    doc.moveDown(0.6);
    sectionHead(doc, "Phishing Detection", 50, pageW, accent);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9);
    phishingScans.forEach((scan, index) => {
      const rowY = doc.y;
      doc.fillColor(muted).text(`${index + 1}.`, 50, rowY, { width: 22 });
      doc.fillColor(dark).text(truncate(scan.url, 45), 72, rowY, { width: 280 });
      doc.fillColor(dark).text(scan.prediction || "—", 355, rowY, { width: 60 });
      doc.fillColor(muted).text(`${scan.confidence != null ? scan.confidence : 0}%`, pageW - 60, rowY, { width: 55, align: "right" });
      doc.y = rowY + rowH;
    });

    // ---------- FOOTER ----------
    doc.moveDown(1.2);
    doc.font("Helvetica").fontSize(9).fillColor(muted);
    doc.text("Generated by CyberShield AI Security Platform · Cyber Leelawat", 50, doc.y, { width: pageW, align: "center" });

    doc.end();

  } catch (error) {
    console.error("Report Error:", error.message);
    res.status(500).json({ message: "Report generation failed" });
  }
};

function sectionHead(doc, title, x, width, accentColor) {
  doc.fontSize(12).fillColor(accentColor).font("Helvetica-Bold").text(title, x, doc.y);
  doc.moveDown(0.2);
  doc.strokeColor(accentColor).lineWidth(0.5).moveTo(x, doc.y).lineTo(x + Math.min(120, width * 0.3), doc.y).stroke();
  doc.moveDown(0.2);
}

function riskColor(risk, { danger, warning, success }) {
  if (risk === "high") return danger;
  if (risk === "medium") return warning;
  if (risk === "low") return success;
  return "#64748b";
}