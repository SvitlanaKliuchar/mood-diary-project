import {
  register,
  login,
  refresh,
  logout,
  me
} from "../controllers/auth-controller.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", logout);

authRouter.get("/me", me);

export default authRouter;
