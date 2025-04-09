import { authenticate } from "../middleware/auth-middleware.js";
import { getUserSettings, updateUserSettings } from "../controllers/settings-controller.js";
import { Router } from "express";

const settingsRouter = Router()

//get user settings
settingsRouter.get('/:userId', getUserSettings)

//update user settings partially (patch)
settingsRouter.patch('/:userId', updateUserSettings)

export default settingsRouter