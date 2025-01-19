//Ensures the request is made by a logged-in user with a valid JWT token.
//Without it, anyone could submit a mood, even if they’re not authenticated.
import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/db.js";

const authenticate = async (req, res, next) => {
  try {
    //read the access token from cookies
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ error: "No access token provided." });
    }

    //verify the token with the helper function
    const payload = verifyAccessToken(token);

    //look up the user in db
    const user = await prisma.users.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: "User not found. Invalid token." });
    }
    //attach the user object to the request for downstream handlers
    req.user = user;

    //continue to the next middleware/route handler
    next();
  } catch (err) {
    console.error("Authentication error:", err);

    //distinguish between token expiration and other jwt errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }

    //fallback for other issues like db or network issues
    return res.status(500).json({ error: "Authentication failed." });
  }
};

export default authenticate;
