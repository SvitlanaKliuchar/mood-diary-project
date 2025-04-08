import { authenticate } from "../middleware/auth-middleware.js";
import { getUserSettings, updateUserSettings } from "../controllers/settings-controller.js";
import { Router } from "express";

const settingsRouter = Router()

//get user settings
settingsRouter.get('/:userId', authenticate, getUserSettings)

//update user settings partially (patch)
settingsRouter.patch('/:userId', authenticate, updateUserSettings)

export default settingsRouter