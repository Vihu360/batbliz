import { Router } from "express";
import {
  getMatches,
  getMatchById,
  getMatchInnings,
  getMatchBallEvents,
  getMatchSquads,
  getMatchSquadsByMatchIdAndTeamId,
} from "../../../controllers/admin/match.controller.js";

const router = Router();

router.get("/", getMatches);
// Squads routes must come before /:matchId to avoid route conflicts
router.get("/squads", getMatchSquads);
router.get("/squads/:matchId/:teamId", getMatchSquadsByMatchIdAndTeamId);
router.get("/:matchId/ball-events", getMatchBallEvents);
router.get("/:matchId/innings", getMatchInnings);
router.get("/:matchId", getMatchById);

export default router;

