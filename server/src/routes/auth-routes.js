import { register, login, refresh } from "../controllers/auth-controller.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/refresh", refresh)

export default authRouter;
