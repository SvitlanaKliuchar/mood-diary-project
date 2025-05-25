import prisma from "../config/db.js";
import bcrypt from "bcrypt";

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { username, email, password } = req.body;

    //build the update data object only including fields if they're provided
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUserProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const password = req.headers["x-delete-password"] || req.body.password;
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const deletedUser = await prisma.users.delete({ where: { id: userId } });
    res.json(deletedUser);
  } catch (err) {
    next(err);
  }
  d;
};
// Security & Validation: Profile updates often need extra layers of
// validation (e.g., ensuring the new
//     email isn't already in use, verifying the current password
//     before a change, or hashing a new password).
