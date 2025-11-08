import { Router } from "express";
import { getCompetitions } from "../../../controllers/admin/competition.controller.js";
import { getSeasons } from "../../../controllers/admin/season.controller.js";

const router = Router();

router.get("/", getCompetitions);
router.get("/season/", getSeasons);


export default router;