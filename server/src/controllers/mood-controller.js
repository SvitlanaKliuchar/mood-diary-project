import prisma from "../config/db.js";
import {
  createMoodSchema,
  getMoodsQuerySchema,
} from "../validation/moods/moods-validation.js";

export const createMood = async (req, res, next) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    //handle file upload if present 
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    //parse and validate the form data
    const { date, mood, emotions, sleep, productivity, note } = createMoodSchema.parse({
      ...req.body,
      emotions: req.body.emotions ? JSON.parse(req.body.emotions) : [],
      sleep: req.body.sleep ? JSON.parse(req.body.sleep) : [],
      productivity: req.body.productivity ? JSON.parse(req.body.productivity) : []
    });

    //save the mood entry to the db
    const newMood = await prisma.moods.create({
      data: { date, mood, emotions, sleep, productivity, note, photoUrl, user: { connect: { id: req.user.id } } },
    });

    res
      .status(201)
      .json({ message: "Mood entry created successfully!", mood: newMood });
  } catch (err) {
    next(err);
  }
};

export const getMoods = async (req, res, next) => {
  try {
    //validate query parameters
    const { start, end } = req.query;
    const userId = req.user.id;
    let moods;

    if (start && end) {
      //parse the dates for the month range
      const startDate = new Date(start);
      const endDate = new Date(end);

      //retrieve moods for the specified date
      moods = await prisma.moods.findMany({
        where: {
          user_id: userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      });
    } else {
      //if no date range provided, retrieve all moods for the user
      moods = await prisma.moods.findMany({
        where: { user_id: userId },
        orderBy: { date: "desc" },
      });
    }


    res.status(200).json(moods);
  } catch (err) {
    next(err);
  }
};
