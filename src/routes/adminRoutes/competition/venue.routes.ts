
import { Router } from "express";
import { getVenues } from "../../../controllers/admin/venue.controller.js";

const router = Router();

router.get("/", getVenues);

export default router;
