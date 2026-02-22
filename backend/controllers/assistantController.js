const Groq = require("groq-sdk");
const Scan = require("../models/Scan");
const PortScan = require("../models/PortScan");
const PasswordScan = require("../models/PasswordScan");
const PhishingScan = require("../models/PhishingScan");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ message: "Question required" });
    }

    // Simple greeting handling (avoid unnecessary AI call)
    const lowerQ = question.toLowerCase().trim();
    if (["hello", "hi", "hey"].includes(lowerQ)) {
      return res.json({
        answer:
          "Hello. I am CyberShield AI Security Analyst. How can I assist with your security analysis?"
      });
    }

    // Fetch latest scan data for context
    const websiteScans = await Scan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const portScans = await PortScan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const passwordScans = await PasswordScan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const phishingScans = await PhishingScan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const context = `
Website Scans:
${websiteScans.map(s =>
  `URL: ${s.url}, Status: ${s.status_code}, Risk: ${s.risk_level}`
).join("\n")}

Port Scans:
${portScans.map(p =>
  `Host: ${p.host}, Risk: ${p.risk_level}`
).join("\n")}

Password Checks:
${passwordScans.map(p =>
  `Strength: ${p.strength}, Entropy: ${p.entropy}`
).join("\n")}

Phishing Results:
${phishingScans.map(p =>
  `URL: ${p.url}, Prediction: ${p.prediction}`
).join("\n")}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are CyberShield AI SOC Analyst.

STRICT RULES:
- Only analyze information present in the provided scan context.
- Do NOT invent vulnerabilities.
- If insufficient data exists, say so clearly.
- Do not assume brand reputation.
- Keep responses professional and structured.
- Maximum 250 words unless detailed explanation requested.
- Always format response as:

--- Analysis ---
--- Technical Impact ---
--- Recommended Action ---

If risk level is Low:
State: "No significant risk detected based on available scan data."

Scan Context:
${context}
`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.2
    });

    const answer = response.choices[0].message.content;

    res.json({ answer });

  } catch (error) {
    console.error("AI Assistant Error:", error.response?.data || error.message);
    res.status(500).json({ message: "AI assistant failed" });
  }
};