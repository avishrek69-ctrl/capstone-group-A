import { Router } from "express";
import {
  searchLocation,
  getFavourites,
  addFavourite,
  deleteFavourite,
} from "../controllers/locations.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public — no auth needed for search
router.get("/search", searchLocation);

// Protected — favourites require auth
router.get("/favourites", verifyJWT, getFavourites);
router.post("/favourites", verifyJWT, addFavourite);
router.delete("/favourites/:id", verifyJWT, deleteFavourite);

export default router;
