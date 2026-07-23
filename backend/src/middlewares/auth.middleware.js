import jwt from "jsonwebtoken";
import prisma from "../db/index.js";
import { toAuthUser } from "../utils/photographer-access.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // Support both cookie-based and Authorization header token
    const token =
      req.cookies?.token ||
      (req.headers["authorization"]?.startsWith("Bearer ")
        ? req.headers["authorization"].slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ message: "Access token required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, preferences: true, created_at: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = toAuthUser(user);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    next(err);
  }
};
