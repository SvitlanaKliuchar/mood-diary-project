import crypto from 'crypto'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import prisma from '../config/db.js'
import { CLIENT_URL } from '../config'
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '../config/index.js'

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body
    try {
        //find the user by email
        const user = await prisma.users.findUnique({ where: { email } })
        if (!user) {
            return res.status(404).json({ error: 'No account with that email exists.' })
        }

        //generate a token (20 bytes - 40 hex characters)
        const token = crypto.randomBytes(20).toString('hex')
        //set token expiry
        const expires = new Date(Date.now() + 60 * 60 * 1000) //1h

        //save token and expiry in db
        await prisma.users.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires,
            }
        })

        //create reset link
        const resetLink = `${CLIENT_URL}/reset-password/${token}`

        //configure nodemailer transporter 
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        //email options
        const mailOptions = {
            from: '"No-Reply" <no-reply@mooddiary.com>',
            to: user.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) requested a password reset for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n`,
        }

        //send the email
        await transporter.sendMail(mailOptions)

        res.json({ message: 'An email has been sent with further instructions.' })
    } catch (error) {
        console.error('Password Reset Request Error:', error);
        res.status(500).json({ error: 'Internal server error during password reset request' });
    }
}

//reset password (get): validate token and render form on client side
export const validateResetToken = async (req, res) => {
    const { token } = req.params
    try {
        //find the user with matching token and unexpired token
        const user = await prisma.users.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        })

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' })
        }
        //otherwise token is valid so respond with a success message
        res.json({ message: 'Token is valid. You can now reset your password.' });
    } catch (error) {
        console.error('Validate Reset Token Error:', error);
        res.status(500).json({ error: 'Internal server error while validating token' });
    }
}

//reset password (post): update password
export const resetPassword = async (req, res) => {
    const { token } = req.params
    const { newPassword } = req.body
    try {
        //find the user with matching token and valid expiry
        const user = await prisma.users.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        })
        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        //hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        
        //update the user's password and clear the reset token fields
        await prisma.users.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        })
        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'Internal server error during password reset' });
    }
}