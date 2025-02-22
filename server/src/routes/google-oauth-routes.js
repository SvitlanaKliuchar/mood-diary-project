import { Router } from "express";
import { googleOAuth, googleOAuthCallback, googleOAuthFailure } from "../controllers/google-oauth-controller";

const googleOAuthRouter = Router()

googleOAuthRouter.get('/google', googleOAuth)

googleOAuthRouter.get('/google/callback', googleOAuthCallback)

googleOAuthRouter.get('/google/login-failed', googleOAuthFailure)

export default googleOAuthRouter