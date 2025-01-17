import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { loginSchema, registerSchema } from '../validation/auth/auth-validation.js'


//handle user login
export const login = async (req, res, next) => {
  try {
    //validate request payload
    const { identifier, password } = loginSchema.parse(req.body);

    //determite if the identifier is username or email
    let user;
    if (identifier.includes('@')) {
      user = await prisma.users.findUnique({ where: { email: identifier } })
    } else {
      user = await prisma.users.findUnique({ where: { username: identifier } })
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //generate tokens
    const accessToken = signAccessToken({ sub: user.id });
    const refreshToken = signRefreshToken({ sub: user.id })

    //set cookies: access_token & refresh_token
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, //15min
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
    })

    res.status(200).json({
      message: "Login successful!", user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};


//handle user registration
export const register = async (req, res, next) => {
  try {
    //validate request payload
    const { username, email, password } = registerSchema.parse(req.body);

    //check if the username or email is already taken
    const existingUsername = await prisma.users.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const existingEmail = await prisma.users.findUnique({ where: { email } })
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" })
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //save the new user to the db
    const newUser = await prisma.users.create({
      data: { username, email, password_hash: hashedPassword },
    });

    //generate tokens
    const accessToken = signAccessToken({ sub: newUser.id });
    const refreshToken = signRefreshToken({ sub: newUser.id })

    //set cookies: access_token & refresh_token
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, //15min
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
    })

    res.status(201).json({
      message: "User registered successfully!",
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    //read the refresh token from cookie
    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    //verify refresh token
    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch (err) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    //check if user is still valid, not deleted etc
    const user = await prisma.users.findUnique({ where: { id: decoded.sub } })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    //if all is good, sign a new access token
    const newAccessToken = signAccessToken({ sub: user.id })

    //set it in cookie again (fresh 15min) 
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      message: "Access token refreshed successfully!"
      // no need to re-set refresh_token here since it's still valid 
    });
  } catch (err) {
    next(err)
  }
}