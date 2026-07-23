import { Router } from "express";
import {
	getShoots,
	getPhotographerBookings,
	createShoot,
	updateShoot,
	deleteShoot,
} from "../controllers/shoots.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getShoots);
router.get("/photographer/bookings", getPhotographerBookings);
router.post("/", createShoot);
router.put("/:id", updateShoot);
router.delete("/:id", deleteShoot);

export default router;
