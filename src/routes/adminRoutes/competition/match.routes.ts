import { Router } from "express";
import { getMatches } from "../../../controllers/admin/match.controller.js";

const router = Router();

router.get("/", getMatches);

export default router;

