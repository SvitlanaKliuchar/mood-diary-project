import prisma from "../src/config/db.js";

const seedData = async () => {
  console.log("Seeding initial data...");

  //creating initial users with related moods
  const user1 = await prisma.users.create({
    data: {
      username: "svitlana",
      email: "sv1234@gmail.com",
      password_hash: "hashed_password_1",
      moods: {
        create: [
          {
            mood: "Happy",
            note: "Met with my friends, felt great!",
            date: new Date(),
          },
          {
            mood: "Anxious",
            note: "Stressed at work, too much responsibility",
            date: new Date(),
          },
        ],
      },
    },
  });
  const user2 = await prisma.users.create({
    data: {
      username: "Lara",
      email: "larainacio@gmail.com",
      password_hash: "hashed_password_2",
      moods: {
        create: [
          {
            mood: "Excited",
            note: "Started working on a new project",
            date: new Date(),
          },
          {
            mood: "Frustrated",
            note: "Had a meeting with my family, they were very toxic",
            date: new Date(),
          },
        ],
      },
    },
  });

  console.log(`Seeded users: ${user1}, ${user2}`);
};

//executing the seeding script
const main = async () => {
  try {
    await seedData();
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding, ", error);
    process.exit(1); //exiting with failure code
  } finally {
    await prisma.$disconnect(); //need to always close the database connection
    console.log("Database connection closed.");
  }
};
main();
