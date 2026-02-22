const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Client connected to SOC");
});

app.set("io", io);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later."
});
app.use(limiter);
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const protect = require("./middleware/authMiddleware");

const scanRoutes = require("./routes/scanRoutes");
app.use("/api/scan", scanRoutes);

const portScanRoutes = require("./routes/portScanRoutes");
app.use("/api/portscan", portScanRoutes);

const passwordRoutes = require("./routes/passwordRoutes");
app.use("/api/password", passwordRoutes);

const phishingRoutes = require("./routes/phishingRoutes");
app.use("/api/phishing", phishingRoutes);

const threatRoutes = require("./routes/threatRoutes");
app.use("/api/threat", threatRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/report", reportRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);


app.use("/api/assistant", require("./routes/assistantRoutes"));


const historyRoutes = require("./routes/historyRoutes");
app.use("/api/history", historyRoutes);

const newsRoutes = require("./routes/newsRoutes");
app.use("/api/news", newsRoutes);

const ipRoutes = require("./routes/ipRoutes");
app.use("/api/ip", ipRoutes);

const cveRoutes = require("./routes/cveRoutes");
app.use("/api/cve", cveRoutes);

const assistantRoutes = require("./routes/assistantRoutes");
app.use("/api/assistant", assistantRoutes);

const dashboardController = require("./controllers/dashboardController");
app.get("/api/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to CyberShield Dashboard",
    user: req.user
  });
});
app.get("/api/dashboard/stats", protect, dashboardController.getDashboardStats);
app.get("/", (req, res) => {
  res.send("CyberShield API Running...");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));