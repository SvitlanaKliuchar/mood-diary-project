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
      data: { date, mood, emotions, sleep, productivity, note, photoUrl, user: { connect: { id: req.user.id } }  },
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
    const { date } = getMoodsQuerySchema.parse(req.query);

    const userId = req.user.id;
    let moods;

    if (date) {
      //parse the date and set time to the start of the day
      const parsedDate = new Date(date);
      parsedDate.setHours(0, 0, 0, 0);

      //calculate the end of the day
      const endOfDay = new Date(parsedDate);
      endOfDay.setDate(endOfDay.getDate() + 1);

      //retrieve moods for the specified date
      moods = await prisma.moods.findMany({
        where: {
          user_id: userId,
          date: {
            gte: parsedDate,
            lt: endOfDay,
          },
        },
        orderBy: { date: "asc" },
      });
    } else {
      //retrieve all moods for the user
      moods = await prisma.moods.findMany({
        where: { user_id: userId },
        orderBy: { date: "asc" },
      });
    }

    res.status(200).json(moods);
  } catch (err) {
    next(err);
  }
};
