import prisma from "../config/db.js";
import { createMoodSchema, getMoodsQuerySchema } from '../validation/moods-validation.js'

export const createMood = async (req, res, next) => {
    try {
        //validate request payload 
        const { date, mood, note } = createMoodSchema.parse(req.body)

        //save the mood to the db
        const newMood = await prisma.mood.create({
            data: {date, mood, note, userId: req.user.id}
        })

        res.status(201).json({message: "Mood entry created successfully!", mood: newMood})
    } catch (err) {
        next(err)
    }
}

export const getMoods = async (req, res, next) => {
    try {
        //validate query parameters
        const { date } = getMoodsQuerySchema.parse(req.body)

        const userId = req.user.id
        let moods

        if (date) {
            //parse the date and set time to the start of the day
            const parsedDate = new Date(date)
            parsedDate.setHours(0,0,0,0)

            //calculate the end of the day
            const endOfDay = new Date(parsedDate)
            endOfDay.setDate(endOfDay.getDate() + 1)

            //retrieve moods for the specified date
            moods = await prisma.mood.findMany({
                where: {
                    userId, 
                    date: {
                        gte: parsedDate,
                        lt: endOfDay
                    }
                },
                orderBy: {date: 'asc'}
            })
        } else {
            //retrieve all moods for the user
            moods = await prisma.mood.findMany({
                where: { userId},
                orderBy: {date: 'asc'}
            })
        }

        res.status(200).json(moods)
    } catch (err) {
        next(err)
    }
}