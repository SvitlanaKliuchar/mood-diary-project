import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./middleware/logging-middleware.js";
import authRouter from "./routes/auth-routes.js";
import moodsRouter from "./routes/moods-routes.js";
import errorHandler from "./middleware/error-middleware.js";
import { fileURLToPath } from 'url'
import path from 'path'

const app = express();

//middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, //allow cookies
  }));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

//serve static files from the 'uploads' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

//routes
app.use("/auth", authRouter);
app.use("/moods", moodsRouter);

//error handling middlewares
app.use(errorHandler);

export default app;
