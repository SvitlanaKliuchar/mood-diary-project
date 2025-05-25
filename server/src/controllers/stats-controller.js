
import { calculateMoodStats } from "../services/stats-services.js";

export const getStats = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10)

        validateUserId(userId);
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const stats = await calculateMoodStats(userId)

        res.status(200).json(stats)
    } catch (err) {
        next(err)
    }
}