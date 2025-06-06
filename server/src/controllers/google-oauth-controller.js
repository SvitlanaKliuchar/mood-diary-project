import passport from "passport";
import prisma from "../config/db.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { CLIENT_URL } from "../config/index.js";

//initialize google OAuth
export const googleOAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

//Google OAuth Callback to handle user data and JWT token creation
export const googleOAuthCallback = async (req, res) => {
  try {
    console.log("User from Google OAuth:", req.user);
    const user = req.user;

    //generate JWT tokens
    const accessToken = signAccessToken({ sub: user.id });
    const refreshToken = signRefreshToken({ sub: user.id });

    //store refresh token in db
    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Log the stored token
    const storedToken = await prisma.refreshTokens.findFirst({
      where: { token: refreshToken },
    });
    console.log("Stored refresh token in DB:", storedToken);

    //set tokens in cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log("Cookies set:", req.cookies);
    res.redirect(`${CLIENT_URL}/home`);
  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during google authentication" });
  }
};

//handle google login failure
export const googleOAuthFailure = (req, res) => {
  res.status(401).json({ error: "Google login failed, try again." });
};
