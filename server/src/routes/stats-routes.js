import { Router } from "express";
import authenticate from "../middleware/auth-middleware.js";
import { getStats } from "../controllers/stats-controller.js";

const statsRouter = Router();

statsRouter.get("/:userId", authenticate, getStats);

export default statsRouter;
