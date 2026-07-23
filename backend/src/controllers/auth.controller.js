import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import prisma from "../db/index.js";
import { JWT_EXPIRY } from "../constant.js";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

const safeUser = ({ id, email, name, preferences, created_at }) => ({
  id,
  email,
  name,
  preferences,
  created_at,
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms, matches JWT_EXPIRY
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash,
      },
    });

    const token = signToken(user.id);

    res.cookie("token", token, COOKIE_OPTIONS);
    return res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user.id);

    res.cookie("token", token, COOKIE_OPTIONS);
    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  return res.status(200).json({ message: "Logged out successfully." });
};

export const getMe = (req, res) => {
  return res.status(200).json({ user: req.user });
};
