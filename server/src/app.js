import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./middleware/logging-middleware.js";
import authRouter from "./routes/auth-routes.js";
import moodsRouter from "./routes/moods-routes.js";
import errorHandler from "./middleware/error-middleware.js";
import { fileURLToPath } from 'url'
import path from 'path'
import statsRouter from "./routes/stats-routes.js";
import googleOAuthRouter from "./routes/google-oauth-routes.js";
import githubOAuthRouter from "./routes/github-oauth-routes.js";
import './config/passport.js'
import passport from "passport";
import passwordResetRouter from "./routes/password-reset-routes.js";
import settingsRouter from "./routes/settings-routes.js";
import profileRouter from "./routes/profile-routes.js"

const app = express();

//middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, //allow cookies
  }));
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(passport.initialize());



//serve static files from the 'uploads' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

//routes
app.use("/auth", authRouter);
app.use("/auth", googleOAuthRouter);
app.use("/auth", githubOAuthRouter);
app.use("/auth", passwordResetRouter)
app.use("/moods", moodsRouter);
app.use("/stats", statsRouter);
app.use("/settings", settingsRouter);
app.use("/profile", profileRouter)

//error handling middlewares
app.use(errorHandler);

export default app;
