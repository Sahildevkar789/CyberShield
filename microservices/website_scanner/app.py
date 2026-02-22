from flask import Flask, request, jsonify
import requests
import ssl
import socket
from urllib.parse import urlparse

app = Flask(__name__)

REQUIRED_SECURITY_HEADERS = [
    "Content-Security-Policy",
    "X-Frame-Options",
    "Strict-Transport-Security",
    "X-Content-Type-Options"
]

def check_ssl(hostname):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                ssock.getpeercert()
                return True
    except:
        return False

def get_ssl_expiry(hostname):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                expiry_str = cert.get("notAfter")
                return expiry_str if expiry_str else None
    except:
        return None

def follow_redirect_chain(url, max_redirects=10):
    chain = []
    current = url
    session = requests.Session()
    session.max_redirects = 0
    for _ in range(max_redirects):
        try:
            r = session.get(
                current,
                timeout=5,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
                allow_redirects=False
            )
            chain.append({"url": current, "status": r.status_code})
            if r.status_code in (301, 302, 303, 307, 308) and "Location" in r.headers:
                location = r.headers["Location"]
                if not location.startswith(("http://", "https://")):
                    parsed = urlparse(current)
                    location = f"{parsed.scheme}://{parsed.netloc}{location}"
                current = location
            else:
                break
        except requests.exceptions.TooManyRedirects:
            break
        except Exception:
            break
    return chain

@app.route("/scan", methods=["POST"])
def scan():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"status": "error", "message": "URL is required"})

    try:
        response = requests.get(
            url,
            timeout=5,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
            allow_redirects=True
        )

        headers = response.headers
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname

        security_headers = {
            "Content-Security-Policy": headers.get("Content-Security-Policy"),
            "X-Frame-Options": headers.get("X-Frame-Options"),
            "Strict-Transport-Security": headers.get("Strict-Transport-Security"),
            "X-Content-Type-Options": headers.get("X-Content-Type-Options")
        }

        missing_headers = [h for h in REQUIRED_SECURITY_HEADERS if not security_headers.get(h)]

        ssl_status = check_ssl(hostname) if hostname and url.startswith("https") else False
        ssl_expiry = get_ssl_expiry(hostname) if hostname and url.startswith("https") else None
        redirect_chain = follow_redirect_chain(url) if url.startswith("http") else []

        server = headers.get("Server") or headers.get("server")
        x_powered_by = headers.get("X-Powered-By") or headers.get("x-powered-by")

        return jsonify({
            "status": "success",
            "status_code": response.status_code,
            "https": url.startswith("https"),
            "ssl_valid": ssl_status,
            "headers": security_headers,
            "missing_headers": missing_headers,
            "server": server,
            "technology": x_powered_by,
            "ssl_expiry": ssl_expiry,
            "redirect_chain": redirect_chain
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route("/")
def home():
    return "Website Scanner Running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)