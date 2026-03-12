import { Router } from "express";
import { getConditions, getForecast } from "../controllers/conditions.controller.js";

const router = Router();

router.get("/conditions", getConditions);
router.get("/forecast", getForecast);

export default router;
