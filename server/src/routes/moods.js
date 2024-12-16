import { createMood, getMoods } from "../controllers/mood-controller.js";
import authenticate from "../middleware/auth-middleware.js";
import express from 'express'

const moodRouter = express.Router()

moodRouter.post('/', authenticate, createMood)

moodRouter.get('/', authenticate, getMoods)

export default moodRouter