import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRouter       from "./routes/auth.routes.js";
import conditionsRouter from "./routes/conditions.routes.js";
import shootsRouter     from "./routes/shoots.routes.js";
import locationsRouter  from "./routes/locations.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.use("/api", limiter);

// Routes
app.use("/api/auth",      authRouter);
app.use("/api",           conditionsRouter);
app.use("/api/shoots",    shootsRouter);
app.use("/api/locations", locationsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export { app };
