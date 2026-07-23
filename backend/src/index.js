import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (configuredOrigins.length === 0) {
  console.log("CORS: FRONTEND_URL not set. Allowing all origins.");
} else {
  console.log(`CORS: Allowed origins -> ${configuredOrigins.join(", ")}`);
}

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running at PORT: ${process.env.PORT || 8000}`);
});
