import { Router } from "express";
import {
	register,
	registerPhotographer,
	login,
	logout,
	getMe,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/register/photographer", registerPhotographer);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);

export default router;
