from flask import Flask, request, jsonify
import re
from urllib.parse import urlparse

app = Flask(__name__)

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "update",
    "bank", "free", "account", "confirm"
]

def has_ip_address(url):
    return re.match(r"http[s]?://\d+\.\d+\.\d+\.\d+", url) is not None

def count_subdomains(host):
    return host.count(".")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"prediction": "Error", "confidence": 0})

    parsed = urlparse(url)
    host = parsed.hostname or ""

    risk_score = 0
    reasons = []

    # Rule 1: IP Address
    if has_ip_address(url):
        risk_score += 40
        reasons.append("IP address used instead of domain")

    # Rule 2: HTTP instead of HTTPS
    if url.startswith("http://"):
        risk_score += 20
        reasons.append("Uses HTTP instead of HTTPS")

    # Rule 3: Suspicious keywords
    for word in SUSPICIOUS_KEYWORDS:
        if word in url.lower():
            risk_score += 10
            reasons.append(f"Contains suspicious keyword: {word}")

    # Rule 4: Too many subdomains
    if count_subdomains(host) > 3:
        risk_score += 15
        reasons.append("Too many subdomains")

    # Rule 5: Long URL
    if len(url) > 75:
        risk_score += 10
        reasons.append("Very long URL")

    # Final decision
    if risk_score >= 60:
        prediction = "Phishing"
    elif risk_score >= 30:
        prediction = "Suspicious"
    else:
        prediction = "Safe"

    confidence = min(risk_score, 100)

    return jsonify({
        "prediction": prediction,
        "confidence": confidence,
        "reasons": reasons
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=True)