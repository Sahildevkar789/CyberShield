# CyberShield

AI-powered cybersecurity intelligence platform — threat scoring, website/port scans, password analysis, phishing detection, and an AI assistant. Built during internship at **Cyber Leelawat**.

## Structure

- **frontend/** — React web app (dashboard, reports, AI chatbot)
- **backend/** — Node.js/Express API (auth, scans, reports, PDF, AI assistant)
- **microservices/** — Optional Python services for scanning
  - **website_scanner/** — Website vulnerability scanning
  - **port_scanner/** — Network port scanning
  - **password_checker/** — Password strength checking
  - **phishing_model/** — Phishing detection

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Python 3 for microservices

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, and API keys (VirusTotal, NewsAPI, AbuseIPDB)
npm install
npm run dev
```

Runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:3000`.

**Production:** Set `REACT_APP_API_URL` to your backend URL (e.g. on Vercel). The frontend has a `src/config.js` that exports `API_BASE`; you can replace hardcoded `http://localhost:5000` with `API_BASE` in your API calls when deploying.

---

## Push to GitHub

1. **Create a new repo** on GitHub (e.g. `CyberShield`). Do not add README or .gitignore there.

2. **Initialize and push** from your project root:

```bash
cd c:\Users\Sahil\OneDrive\Desktop\CyberShield
git init
git add .
git status
# Ensure .env and node_modules are NOT listed (they are in .gitignore)
git commit -m "Initial commit: CyberShield platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/CyberShield.git
git push -u origin main
```

3. **Secrets:** Never commit `.env`. Use `.env.example` as a template; add real keys only in `.env` locally or in your host’s environment variables.

---

## Deployment

### Option A: Frontend (Vercel) + Backend (Render / Railway)

**Frontend (Vercel)**

1. Push code to GitHub (see above).
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Build command: `npm run build`. Output: `build`.
5. Add env: `REACT_APP_API_URL=https://your-backend-url.onrender.com` (or your backend URL).
6. In your frontend, replace `http://localhost:5000` with `process.env.REACT_APP_API_URL || 'http://localhost:5000'` for API calls, then redeploy.

**Backend (Render)**

1. [render.com](https://render.com) → New → Web Service.
2. Connect the same GitHub repo; set **Root Directory** to `backend`.
3. Build: `npm install`. Start: `npm start`.
4. Add **Environment Variables**: copy from `.env.example` and set real values (e.g. `MONGO_URI` for MongoDB Atlas, `JWT_SECRET`, API keys).
5. Use the provided URL (e.g. `https://cybershield-api.onrender.com`) as `REACT_APP_API_URL` in the frontend.

**MongoDB:** Use [MongoDB Atlas](https://www.mongodb.com/atlas) and set `MONGO_URI` in the backend env.

### Option B: Full-stack on Railway

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Add two services: one for `backend` (root `backend`), one for `frontend` (root `frontend`, build `npm run build`, static or Node serve).
3. Set env vars for backend (MONGO_URI, JWT_SECRET, API keys).
4. Set frontend env to point to the backend URL.

### After deployment

- Update CORS in `backend` to allow your frontend origin (e.g. `https://your-app.vercel.app`).
- Use HTTPS URLs in the frontend for API and WebSocket (e.g. `wss://` for socket.io if used).

---

## License

MIT (or as per your choice).
