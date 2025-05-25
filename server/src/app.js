import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./middleware/logging-middleware.js";
import authRouter from "./routes/auth-routes.js";
import moodsRouter from "./routes/moods-routes.js";
import errorHandler from "./middleware/error-middleware.js";
import { fileURLToPath } from "url";
import path from "path";
import statsRouter from "./routes/stats-routes.js";
import googleOAuthRouter from "./routes/google-oauth-routes.js";
import githubOAuthRouter from "./routes/github-oauth-routes.js";
import "./config/passport.js";
import passport from "passport";
import csurf from "csurf";
import passwordResetRouter from "./routes/password-reset-routes.js";
import settingsRouter from "./routes/settings-routes.js";
import profileRouter from "./routes/profile-routes.js";
import genArtRouter from "./routes/gen-art-routes.js";
import {
  envGeneralLimiter as generalLimiter,
  envAuthLimiter as authLimiter,
  envPasswordResetLimiter as passwordResetLimiter,
  envUploadLimiter as uploadLimiter,
} from "./config/rate-limits.js";

const app = express();
app.set("trust proxy", 1);  


//middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(generalLimiter); //general limiter applied to all requests
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(passport.initialize());
app.use(
  csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    },
  }),
);

//serve static files from the 'uploads' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads")),
);

//routes with specific rate limiting
app.use("/auth", authLimiter, authRouter);
app.use("/auth", authLimiter, googleOAuthRouter);
app.use("/auth", authLimiter, githubOAuthRouter);
app.use("/auth", passwordResetLimiter, passwordResetRouter);
app.use("/moods", uploadLimiter, moodsRouter);
app.use("/stats", statsRouter);
app.use("/settings", settingsRouter);
app.use("/profile", profileRouter);
app.use("/gen-art", genArtRouter);

//csrf error handling
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "invalid CSRF token" });
  }
  next(err);
});

//error handling middlewares
app.use(errorHandler);

export default app;
