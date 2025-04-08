import { Router } from 'express';
import { deleteUserProfile, updateUserProfile } from '../controllers/profile-controller.js';
import { authenticate } from "../middleware/auth-middleware.js";


const profileRouter = Router();

profileRouter.patch('/update/:userId', authenticate, updateUserProfile)
profileRouter.delete('/delete/:userId', authenticate, deleteUserProfile)

export default profileRouter