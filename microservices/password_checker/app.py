from flask import Flask, request, jsonify
import math
import re
import random
import string
import os
app = Flask(__name__)

COMMON_PASSWORDS = ["123456", "password", "admin", "qwerty"]

def calculate_entropy(password):
    charset = 0
    if re.search(r"[a-z]", password): charset += 26
    if re.search(r"[A-Z]", password): charset += 26
    if re.search(r"[0-9]", password): charset += 10
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password): charset += 32
    if charset == 0: return 0
    return round(len(password) * math.log2(charset), 2)

def estimate_crack_time(entropy):
    guesses_per_sec = 10**10
    seconds = (2 ** entropy) / guesses_per_sec
    if seconds < 60:
        return "Instantly cracked"
    elif seconds < 3600:
        return "Minutes"
    elif seconds < 86400:
        return "Hours"
    elif seconds < 31536000:
        return "Days"
    else:
        return "Years"

def generate_strong_password(level="Strong"):
    length = 10 if level == "Medium" else 14
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(length))

@app.route("/check", methods=["POST"])
def check():
    data = request.json
    password = data.get("password")

    if not password:
        return jsonify({"error": "Password required"})

    entropy = calculate_entropy(password)
    crack_time = estimate_crack_time(entropy)

    suggestions = []
    score = 0

    if password in COMMON_PASSWORDS:
        suggestions.append("Avoid common passwords")
        score -= 20

    if len(password) < 8:
        suggestions.append("Use at least 8 characters")
        score -= 10

    if re.search(r"(.)\1\1", password):
        suggestions.append("Avoid repeated characters")
        score -= 10

    if not re.search(r"[A-Z]", password):
        suggestions.append("Add uppercase letters")
    if not re.search(r"[0-9]", password):
        suggestions.append("Add numbers")
    if not re.search(r"[!@#$%^&*]", password):
        suggestions.append("Add special characters")

    if entropy > 60:
        strength = "Strong"
        difficulty = "Hard"
    elif entropy > 40:
        strength = "Medium"
        difficulty = "Moderate"
    else:
        strength = "Weak"
        difficulty = "Easy"

    suggested = generate_strong_password(strength)

    return jsonify({
        "strength": strength,
        "difficulty": difficulty,
        "entropy": entropy,
        "crack_time_estimate": crack_time,
        "suggestions": suggestions,
        "recommended_password": suggested
    })



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    app.run(host="0.0.0.0", port=port)
