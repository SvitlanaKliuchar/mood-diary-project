// src/config/db.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});

if (process.env.NODE_ENV !== "test") {
  process.on("SIGINT", async () => {
    console.log("Received SIGINT. Closing database connection...");
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM. Closing database connection...");
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;
