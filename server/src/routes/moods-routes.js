import { createMood, getMoods } from "../controllers/mood-controller.js";
import authenticate from "../middleware/auth-middleware.js";
import express from "express";

const moodsRouter = express.Router();

moodsRouter.post("/", authenticate, createMood);

moodsRouter.get("/", authenticate, getMoods);

export default moodsRouter;
