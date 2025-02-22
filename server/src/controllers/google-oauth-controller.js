import passport from "passport";
import prisma from "../config/db";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

//initialize google OAuth
export const googleOAuth = passport.authenticate('google', { scope: ['profile', 'email'] })

//Google OAuth Callback to handle user data and JWT token creation
export const googleOAuthCallback = async (req, res) => {
    try {
        const user = req.user

        //generate JWT tokens
        const accessToken = signAccessToken({ sub: user.id })
        const refreshToken = signRefreshToken({ sub: user.id })

        //store refresh token in db
        await prisma.refreshTokens.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })

        //set tokens in cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        res.redirect('/home')
    } catch (error) {
        console.error('Google Auth Callback Error:', error);
        res.status(500).json({ error: 'Internal server error during google authentication' });
    }
}

//handle google login failure
export const googleOAuthFailure = (req, res) => {
    res.status(401).json({ error: 'Google login failed, try again.'})
}