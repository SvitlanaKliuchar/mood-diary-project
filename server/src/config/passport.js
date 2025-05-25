import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import prisma from "./db.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "./index.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //check if the user with this google id already exists
        const googleId = profile.id;
        let user = await prisma.users.findUnique({
          where: { googleId },
        });

        if (!user) {
          //check by email to merge accounts
          const email = profile.emails?.[0]?.value;
          let userByEmail = null;

          if (email) {
            userByEmail = await prisma.users.findUnique({
              where: { email },
            });
          }

          //if a user with the same email exists, link them
          if (userByEmail) {
            user = await prisma.users.update({
              where: { id: userByEmail.id },
              data: { googleId },
            });
          } else {
            //otherwise, create a new user
            user = await prisma.users.create({
              data: {
                googleId,
                username: profile.displayName || email,
                email: email || "",
                password_hash: "",
              },
            });
          }

          //if we got here, user is defined
          return done(null, user);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //check if the user with this github id already exists
        const githubId = profile.id;
        let user = await prisma.users.findUnique({
          where: { githubId },
        });

        if (!user) {
          //check by email to merge accounts
          const email = profile.emails?.[0]?.value;
          let userByEmail = null;

          if (email) {
            userByEmail = await prisma.users.findUnique({
              where: { email },
            });
          }

          //if a user with the same email exists, link them
          if (userByEmail) {
            user = await prisma.users.update({
              where: { id: userByEmail.id },
              data: { githubId },
            });
          } else {
            //otherwise, create a new user
            user = await prisma.users.create({
              data: {
                githubId,
                username: profile.username || email,
                email: profile.emails?.[0]?.value || "",
                password_hash: "",
              },
            });
          }

          //if we got here, user is defined
          return done(null, user);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);
