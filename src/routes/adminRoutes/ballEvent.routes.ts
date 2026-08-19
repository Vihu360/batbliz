import { Router } from "express";
import {
  getBallEvents,
  getBallEventById,
  createBallEvent,
  updateBallEvent,
  deleteBallEvent,
  getBallEventsByMatch,
  getBallEventsByInnings,
} from "../../controllers/admin/ballEvent.controller.js";

const router = Router();

// Get all ball events with pagination and filtering
// Query params: page, limit, search, matchId, inningsId, batsmanId, bowlerId, wicket
router.get("/", getBallEvents);

// Get ball events by match ID
router.get("/match/:matchId", getBallEventsByMatch);

// Get ball events by innings ID
router.get("/innings/:inningsId", getBallEventsByInnings);

// Get single ball event by ID
router.get("/:id", getBallEventById);

// Create a new ball event (with real-time socket event)
router.post("/", createBallEvent);

// Update a ball event (with real-time socket event)
router.put("/:id", updateBallEvent);

// Delete a ball event (with real-time socket event)
router.delete("/:id", deleteBallEvent);

export default router;

