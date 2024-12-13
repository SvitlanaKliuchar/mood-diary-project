import { PrismaClient } from "@prisma/client";

//initializing prisma client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], //logs for debugging
});

//graceful shutdown to avoid connection  leaks
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

export default prisma;
