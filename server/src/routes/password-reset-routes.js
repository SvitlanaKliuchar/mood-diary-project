import { Router } from "express";
import { requestPasswordReset, validateResetToken, resetPassword } from "../controllers/password-reset-controller.js";

const passwordResetRouter = Router()

//client submits email
passwordResetRouter.post('/forgot-password', requestPasswordReset)

//could be used to render a reset form on the frontend
passwordResetRouter.get('/reset-password/:token', validateResetToken)

//submit new password using the token
passwordResetRouter.post('/reset-password/:token', resetPassword)

export default passwordResetRouter