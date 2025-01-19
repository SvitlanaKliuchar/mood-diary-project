import {
  register,
  login,
  refresh,
  logout,
  me
} from "../controllers/auth-controller.js";
import express from "express";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", logout);

authRouter.get("/me", me);

export default authRouter;
