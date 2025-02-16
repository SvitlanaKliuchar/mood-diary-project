import { raw } from "@prisma/client/runtime/library";
import prisma from "../config/db.js";
import { createMoodSchema } from "../validation/moods/moods-validation.js";
import { me } from "./auth-controller.js";

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
    const parsedData = createMoodSchema.parse({
      ...req.body,
      emotions: req.body.emotions ? JSON.parse(req.body.emotions).map(String) : [],
      sleep: req.body.sleep ? JSON.parse(req.body.sleep).map(String) : [],
      productivity: req.body.productivity ? JSON.parse(req.body.productivity).map(String) : [],
    });

    const { date, mood, emotions, sleep, productivity, note } = parsedData;

    //normalize date to prevent duplicate entries
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    //check if an entry for the same day already exists
    const existingEntry = await prisma.moods.findFirst({
      where: {
        user_id: req.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingEntry) {
      return res.status(400).json({ error: "You already have a mood entry for this day." });
    }

    //create a new mood entry
    const newMood = await prisma.moods.create({
      data: {
        date,
        mood,
        emotions,
        sleep,
        productivity,
        note,
        photoUrl,
        user: { connect: { id: req.user.id } },
      },
    });

    res.status(201).json({ message: "Mood entry created successfully!", mood: newMood });
  } catch (err) {
    console.error("Error creating mood:", err);
    next(err);
  }
};


export const getMoods = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const userId = req.user.id;
    let moods;

    if (start && end) {
      const startDate = new Date(start);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(end);
      endDate.setUTCHours(23, 59, 59, 999);

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
      moods = await prisma.moods.findMany({
        where: { user_id: userId },
        orderBy: { date: "desc" },
      });
    }


    res.status(200).json(moods);
  } catch (err) {
    console.error("Error retrieving moods:", err);
    next(err);
  }
};

export const updateMood = async (req, res, next) => {
  try {
    const { id } = req.params

    //check if mood entry exists and belongs to the user
    const existingEntry= await prisma.moods.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.id
      }
    })
    
    if (!existingEntry) {
      return res.status(404).json({error: "Mood entry not found or unauthorized"})
    }

    let photoUrl = existingEntry.photoUrl
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`
    }

    //parse and validate form data 
    const parsedData = createMoodSchema.parse({
      ...req.body,
      emotions: req.body.emotions ? JSON.parse(req.body.emotions).map(String) : existingMood.emotions,
      sleep: req.body.sleep ? JSON.parse(req.body.sleep).map(String) : existingMood.sleep,
      productivity: req.body.productivity ? JSON.parse(req.body.productivity).map(String) : existingMood.productivity,
    });

    const { date, mood, emotions, sleep, productivity, note } = parsedData;

    //update the mood entry
    const updatedMood = await prisma.moods.update({
      where: {
        id: parseInt(id)
      },
      data: {
        date,
        mood,
        emotions,
        sleep,
        productivity,
        note,
        photoUrl
      }
    })

    res.status(200).json({
      message: "Mood entry updated successfully!",
      mood: updateMood
    })

  } catch (err) {
    console.error("Error updating mood", err)
    next(err)
  }
}  

export const deleteMood = async (req, res, next) => {
  try {
    const { id } = req.params

    //check if mood entry exists and belongs to the user
    const existingEntry = await prisma.moods.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.id
      }
    })

    if (!existingEntry) {
      return res.status(404).json({error: "Mood entry not found or unauthorized"})
    }

    //delete the mood entry
    await prisma.moods.delete({
      where: {
        id: parseInt(id)
      }
    })

   return res.status(200).json({message: "Mood entry deleted successfully!"})
    
  } catch (err) {
    console.error("Error deleting mood", err)
    next(err)
  }
}