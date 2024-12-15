//Ensures the request is made by a logged-in user with a valid JWT token. 
//Without it, anyone could submit a mood, even if they’re not authenticated.
import { verifyJwt } from "../utils/jwt.js";
import prisma from '../config/db.js'

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Authorization header missing or invalid'})
    }
    const token = authHeader.split(' ')[1]
    try {
        const payload = verifyJwt(token)

        const user = await prisma.users.findUnique({ where: { id: payload.sub }})
        if (!user) {
            return res.status(401).json({error: 'User not found. Invalid token.'})
        }
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({error: 'Invalid token.'})
    }

}
export default authMiddleware