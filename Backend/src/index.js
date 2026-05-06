import "dotenv/config";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import { getAllowedOrigins, isAllowedOrigin } from "./config/origins.js";
import { initializeSocket } from "./config/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const isDebugHttpEnabled = process.env.DEBUG_HTTP === "true";

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

if (isDebugHttpEnabled) {
  app.use((req, _res, next) => {
    console.log("HTTP REQUEST:", {
      method: req.method,
      url: req.originalUrl,
      origin: req.headers.origin || "unknown",
      body: req.body,
    });
    next();
  });
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use((error, _req, res, _next) => {
  console.error("ERROR:", error);

  if (error.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      message: error.message,
      allowedOrigins: getAllowedOrigins(),
    });
  }

  return res.status(500).json({ message: "Internal server error" });
});

initializeSocket(server);

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
