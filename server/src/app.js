import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./middleware/logging-middleware.js";
import authRouter from "./routes/auth-routes.js";
import moodsRouter from "./routes/moods-routes.js";
import errorHandler from "./middleware/error-middleware.js";

const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

//routes
app.use("/auth", authRouter);
app.use("/moods", moodsRouter);

//error handling middlewares
app.use(errorHandler);

export default app;
