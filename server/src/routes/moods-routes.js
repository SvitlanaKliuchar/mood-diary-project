import { createMood, getMoods } from "../controllers/mood-controller.js";
import authenticate from "../middleware/auth-middleware.js";
import express from "express";
import upload from "../middleware/upload-middleware.js";

const moodsRouter = express.Router();

moodsRouter.post("/", authenticate, upload.single('photo'), createMood);

moodsRouter.get("/", authenticate, getMoods);

export default moodsRouter;
