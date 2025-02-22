import passport from "passport";
import prisma from "../config/db.js";
import { signAccessToken, signRefreshToken } from '../utils/jwt.js'
import { CLIENT_URL } from "../config/index.js";

export const githubOAuth = passport.authenticate('github', { scope: ['user:email']})

export const githubOAuthCallback = async (req, res) => {
    try {
        const user = req.user

        //generate jwt tokens
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

        //set cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
            path: '/'
        })
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        res.redirect(`${CLIENT_URL}/home`)
    } catch (error) {
        console.error('Github Auth Callback Error:', error)
        res.status(500).json({ error: 'Internal server error during github authentication'})
    }
}

export const githubOAuthFailure = (req, res) => {
    res.status(401).json({ error: 'Github login failed, try again.'})
}