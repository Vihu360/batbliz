import { Router } from "express";
import { getTeams } from "../../../controllers/admin/team.controller.js";
import { getPlayers, createPlayer } from "../../../controllers/admin/player.controller.js";

const router = Router();

router.get("/team/", getTeams);
router.get("/player/", getPlayers);
router.post("/player/", createPlayer);

export default router;