import { Router } from "express";
import { getTeams } from "../../../controllers/admin/team.controller.js";
import { getPlayers } from "../../../controllers/admin/player.controller.js";

const router = Router();

router.get("/team/", getTeams);
router.get("/player/", getPlayers);

export default router;