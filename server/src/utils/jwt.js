import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config'

export const signJwt = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})
}

export const verifyJwt = (token) => {
    return jwt.verify(token, JWT_SECRET)
}
