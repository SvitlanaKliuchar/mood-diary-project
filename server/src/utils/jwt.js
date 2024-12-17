import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/index.js";

export const signJwt = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options });
};

export const verifyJwt = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
