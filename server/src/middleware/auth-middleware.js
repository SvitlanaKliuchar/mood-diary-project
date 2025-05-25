import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/db.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ error: "No access token provided." });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.users.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return res.status(401).json({ error: "User not found. Invalid token." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }

    return res.status(500).json({ error: "Authentication failed." });
  }
};

export default authenticate;
