import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const QUICK_PROMPTS = [
  "Why is port 80 risky?",
  "What does missing CSP mean?",
  "How to fix high risk?",
  "Explain SSL best practices",
  "What is CVE and how to use it?",
  "Best headers for security?",
  "Difference between HTTP and HTTPS?",
  "How to harden a web server?",
];

function Assistant() {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const askAI = async (q) => {
    const text = (typeof q === "string" ? q : question).trim();
    if (!text) return;

    setQuestion("");
    setLoading(true);
    setChat((prev) => [...prev, { role: "user", text }]);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/assistant",
        { question: text },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setChat((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: err.response?.data?.message || "Sorry, I couldn't process that. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="assistant-hero">
        <h1 className="page-title assistant-title">
          <span className="assistant-title-icon">🛡️</span> Cyber AI Assistant
        </h1>
        <p className="assistant-tagline">
          Next-level security Q&A · Threat explanation · Remediation guidance · CVE & best practices
        </p>
        <div className="assistant-badge-row">
          <span className="assistant-badge">LIVE</span>
          <span className="assistant-badge">AI Powered</span>
          <span className="assistant-badge">24/7</span>
        </div>
      </div>

      <div className="chat-container assistant-full">
        <div className="chat-messages">
          {chat.length === 0 && (
            <div className="chat-placeholder assistant-placeholder">
              <p className="assistant-placeholder-title">Ask anything about cybersecurity</p>
              <p className="assistant-placeholder-sub">Vulnerabilities, scan results, remediation, CVEs, headers, SSL...</p>
              <div className="assistant-quick-grid">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="assistant-quick-btn"
                    onClick={() => askAI(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((msg, index) => (
            <div key={index} className={msg.role === "user" ? "chat-user" : "chat-ai"}>
              <b>{msg.role === "user" ? "You" : "Cyber AI"}</b>
              <p>{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div className="chat-ai chat-ai-typing">
              <b>Cyber AI</b>
              <p className="typing">Analyzing<span>.</span><span>.</span><span>.</span></p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-card assistant-input-card">
          <input
            placeholder="Ask about vulnerabilities, risks, remediation, CVEs..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askAI()}
            disabled={loading}
          />
          <button onClick={() => askAI()} disabled={loading} className="assistant-send-btn">
            {loading ? "..." : "Ask AI"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Assistant;
