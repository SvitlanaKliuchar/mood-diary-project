import express from "express";
import authenticate from "../middleware/auth-middleware.js";
import { getStats } from "../controllers/stats-controller.js";

const statsRouter = express.Router();

statsRouter.get("/:userId", authenticate, getStats);

export default statsRouter;
