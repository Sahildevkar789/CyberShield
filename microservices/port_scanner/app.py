from flask import Flask, request, jsonify
import socket

app = Flask(__name__)

COMMON_PORTS = [21, 22, 25, 53, 80, 443, 3306]

def scan_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

@app.route("/scan", methods=["POST"])
def scan():
    data = request.json
    host = data.get("host")

    if not host:
        return jsonify({
            "status": "error",
            "message": "Host is required"
        })

    open_ports = []

    for port in COMMON_PORTS:
        if scan_port(host, port):
            open_ports.append(port)

    return jsonify({
        "status": "success",
        "host": host,
        "open_ports": open_ports,
        "total_open": len(open_ports)
    })

@app.route("/")
def home():
    return "Port Scanner Running"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)