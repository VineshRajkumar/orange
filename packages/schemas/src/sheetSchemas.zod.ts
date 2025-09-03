import { z } from "zod";

const titleField = z
  .string()
  .min(1, { message: "Sheet title cannot be empty" })
  .max(100, { message: "Sheet title must be at most 100 characters long" })
  .regex(/^[a-zA-Z0-9 _-]+$/, {
    message:
      "Sheet title can only contain letters, numbers, spaces, hyphens, and underscores",
  });

export const drawElementSchema = z.object({
  id: z.string(),
  type: z.enum([
    "rectangle",
    "diamond",
    "circle",
    "line",
    "arrow",
    "text",
    "freeHand",
  ]),
  x1: z.number().optional(),
  y1: z.number().optional(),
  x2: z.number().optional(),
  y2: z.number().optional(),
  strokeColor: z.string(),  //border -> strokestyle
  fillStyle: z.string().optional(), //baclground
  strokeWidth: z.number(), //1.25,2.5,3.75 -> lineWidth 
  font: z.string(),
  fontSize: z.string(),
  text: z.string(),
  points: z.array(z.object({ x: z.number(), y: z.number() })),
});

export const sheetTitleSchema = z.object({
  title: titleField,
});

export const saveSheetDataSchema = z.object({
  sheetId: z.string().uuid({ message: "Invalid sheetId. Must be a UUID." }),
  data: z.array(drawElementSchema)
});

export const drawElementsSchema = z.array(drawElementSchema)