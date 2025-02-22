import { Router } from "express";
import passport from "passport";
import { googleOAuth, googleOAuthCallback, googleOAuthFailure } from "../controllers/google-oauth-controller.js";

const googleOAuthRouter = Router()

googleOAuthRouter.get('/google', googleOAuth)

googleOAuthRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/google/login-failed' }), googleOAuthCallback)

googleOAuthRouter.get('/google/login-failed', googleOAuthFailure)

export default googleOAuthRouter