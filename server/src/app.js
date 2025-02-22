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
import { SESSION_SECRET } from "./config/index.js";
import session from "express-session";
import './config/passport.js'
import passport from "passport";


const app = express();

//middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, //allow cookies
  }));
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


//serve static files from the 'uploads' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

//routes
app.use("/auth", authRouter);
app.use("/auth", googleOAuthRouter);
app.use("/auth", githubOAuthRouter);
app.use("/moods", moodsRouter);
app.use("/stats", statsRouter)

//error handling middlewares
app.use(errorHandler);

export default app;
