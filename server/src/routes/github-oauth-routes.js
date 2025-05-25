import { Router } from "express";
import passport from "passport";
import {
  githubOAuth,
  githubOAuthCallback,
  githubOAuthFailure,
} from "../controllers/github-oauth-controller.js";

const githubOAuthRouter = Router();

githubOAuthRouter.get("/github", githubOAuth);

githubOAuthRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/auth/github/login-failed",
  }),
  githubOAuthCallback,
);

githubOAuthRouter.get("/github/login-failed", githubOAuthFailure);

export default githubOAuthRouter;
