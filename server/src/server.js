import app from "./app.js";
import prisma from "./config/db.js";
import { PORT } from "./config/index.js";

//start the server
const startServer = async () => {
  try {
    //ensure the db is connected
    await prisma.$connect();
    console.log("Connected to the database!");

    //start the express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start the server: ", err.message);
    process.exit(1);
  }
};

startServer();
