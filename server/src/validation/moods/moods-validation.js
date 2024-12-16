import { z } from "zod";

export const createMoodSchema = z.object({
  date: z.preprocess(
    (str) => (typeof str === "string" ? new Date(str) : str), //transform string to date
    z.date().refine((d) => !isNaN(d.getTime())),
    {
      message:
        "Invalid date. Use a valid date string (YYYY-MM-DD or ISO format)",
    },
  ),
  mood: z.string().min(1, "Mood cannot be empty"),
  note: z.string().optional(),
});

export const getMoodsQuerySchema = z.object({
  date: z.preprocess(
    (str) => (typeof str === "string" && str ? new Date(str) : undefined),
    z
      .date()
      .optional()
      .refine((d) => d === undefined || !isNaN(d.getTime()), {
        message:
          "Invalid date. Use a valid date string (YYYY-MM-DD or ISO format).",
      }),
  ),
});
