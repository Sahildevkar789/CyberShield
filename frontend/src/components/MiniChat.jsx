import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QUICK_PROMPTS = [
  "Why is port 80 risky?",
  "What does missing CSP mean?",
  "How to fix high risk?",
  "Explain SSL best practices",
  "What is CVE?",
];

function MiniChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
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
          text: err.response?.data?.message || "Connection error. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const goToFullAssistant = () => {
    setOpen(false);
    navigate("/assistant");
  };

  return (
    <>
      <button
        type="button"
        className="mini-chat-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Assistant"
      >
        <span className="mini-chat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="8.5" cy="16" r="1" />
            <circle cx="15.5" cy="16" r="1" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
        <span className="mini-chat-badge">AI</span>
      </button>

      {open && (
        <div className="mini-chat-panel">
          <div className="mini-chat-header">
            <div className="mini-chat-title">
              <span className="mini-chat-title-icon">🛡️</span>
              <span>Cyber AI</span>
              <span className="mini-chat-live">LIVE</span>
            </div>
            <div className="mini-chat-actions">
              <button type="button" className="mini-chat-btn-expand" onClick={goToFullAssistant} title="Full screen">
                ⛶
              </button>
              <button type="button" className="mini-chat-btn-close" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
          </div>

          <div className="mini-chat-messages">
            {chat.length === 0 && (
              <div className="mini-chat-placeholder">
                <p>Ask anything about security, CVEs, ports, remediation...</p>
                <div className="mini-chat-quick">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button key={i} type="button" onClick={() => askAI(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((msg, index) => (
              <div key={index} className={msg.role === "user" ? "mini-chat-user" : "mini-chat-ai"}>
                <b>{msg.role === "user" ? "You" : "Cyber AI"}</b>
                <p>{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div className="mini-chat-ai">
                <b>Cyber AI</b>
                <p className="mini-chat-typing">Analyzing<span>.</span><span>.</span><span>.</span></p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="mini-chat-input-wrap">
            <input
              placeholder="Ask about vulnerabilities, risks..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askAI()}
              disabled={loading}
            />
            <button type="button" onClick={() => askAI()} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MiniChat;
