import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  loginSchema,
  registerSchema,
} from "../validation/auth/auth-validation.js";

//handle user login
export const login = async (req, res, next) => {
  try {
    //validate request payload
    const { identifier, password } = loginSchema.parse(req.body);

    //determite if the identifier is username or email
    let user;
    if (identifier.includes("@")) {
      user = await prisma.users.findUnique({ where: { email: identifier } });
    } else {
      user = await prisma.users.findUnique({ where: { username: identifier } });
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
    const refreshToken = signRefreshToken({ sub: user.id });

    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);

    //store refresh token in the db
    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    //set cookies: access_token & refresh_token
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, //15min
      path: "/"
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
      path: "/"
    });

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

    console.log("Set Cookies:");
    console.log("Access Token:", req.cookies.access_token);
    console.log("Refresh Token:", req.cookies.refresh_token);

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
    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //save the new user to the db
    const newUser = await prisma.users.create({
      data: { username, email, password_hash: hashedPassword },
    });

    //generate tokens
    const accessToken = signAccessToken({ sub: newUser.id });
    const refreshToken = signRefreshToken({ sub: newUser.id });

    //store refresh token in the db
    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    //set cookies: access_token & refresh_token
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, //15min
      path: "/"
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7d
      path: "/"
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
    console.log("New user =>", newUser);
    console.log("Token =>", accessToken);
    console.log("Decoded =>", jwt.decode(accessToken));

    console.log("Set Cookies:");
    console.log("Access Token:", req.cookies.access_token);
    console.log("Refresh Token:", req.cookies.refresh_token);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    //read the refresh token from cookie
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    //verify refresh token exists in db and hasnt expired
    const storedToken = await prisma.refreshTokens.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })
    if (!storedToken) {
      return res.status(403).json({ error: "Invalid refresh token, not present in db" })
    }

    //verify jwt
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded.sub !== storedToken.userId) {
      return res.status(403).json({ error: "Token mismatch" });
    }


    //if all is good, generate new tokens
    const newAccessToken = signAccessToken({ sub: storedToken.userId });
    const newRefreshToken = signRefreshToken({ sub: storedToken.userId })

    //update token in db
    await prisma.refreshTokens.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });


    //set new cookies
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.json({
      message: "Access token refreshed successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    //remove token from database if it exists
    if (refreshToken) {
      await prisma.refreshTokens.deleteMany({
        where: { token: refreshToken }
      });
    }

    //clear cookies
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/"
    });
    
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/"
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    //read the access token gfrom cookie
    const accessToken = req.cookies.access_token
    if (!accessToken) {
      return res.status(401).json({ error: "Authentication token missing" });
    }
    //verify it
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (err) {
      return res
        .status(403)
        .json({ error: "Invalid or expired access token" });
    }
    //use decoded token to find user info in db
    const user = await prisma.users.findUnique({ where: { id: decoded.sub } })
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //send user info to client in response
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (err) {
    next(err)
  }

}