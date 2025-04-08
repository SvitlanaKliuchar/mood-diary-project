import { createMood, getMoods, updateMood, deleteMood } from "../controllers/mood-controller.js";
import authenticate from "../middleware/auth-middleware.js";
import { Router } from "express";
import upload from "../middleware/upload-middleware.js";

const moodsRouter = Router();

moodsRouter.post("/", authenticate, upload.single('photo'), createMood);

moodsRouter.get("/", authenticate, getMoods);

moodsRouter.put("/:id", authenticate, upload.single("photo"), updateMood)

moodsRouter.delete("/:id", authenticate, deleteMood)

export default moodsRouter;
