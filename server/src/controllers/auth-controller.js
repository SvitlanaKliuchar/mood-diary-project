import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { signJwt } from "../utils/jwt.js";
import { loginSchema, registerSchema } from '../validation/auth/auth-validation.js'

//handle user registration
export const register = async (req, res, next) => {
  try {
    //validate request payload
    const { username, password } = registerSchema.parse(req.body);

    //check if the username is already taken
    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //save the new user to the db
    const newUser = await prisma.users.create({
      data: { username, password_hash: hashedPassword },
    });

    //generate a JWT token
    const token = signJwt({ sub: newUser.id });

    res.status(201).json({
      message: "User registered successfully!",
      user: { id: newUser.id, username: newUser.username },
      token,
    });
  } catch (err) {
    next(err);
  }
};

//handle user login
export const login = async (req, res, next) => {
  try {
    //validate request payload
    const { username, password } = loginSchema.parse(req.body);

    //find the user in the db
    const user = await prisma.users.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //generate a JWT token
    const token = signJwt({ sub: user.id });

    res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    next(err);
  }
};
