import { z } from "zod";

export const ExperienceTypeEnum = z.enum([
  "BOX",
  "TASTING_PRIVATE",
  "EVENT",
  "CORPORATE_B2B",
]);

export const ExperienceStatusEnum = z.enum(["ACTIVE", "SOLD_OUT", "DRAFT"]);

export const ExperienceSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string().min(3),
  tagline: z.string(),
  description: z.string(),
  type: ExperienceTypeEnum,
  status: ExperienceStatusEnum,
  basePrice: z.number().positive(),
  media: z.object({
    heroImage: z.string().url(),
    videoBackground: z.string().url().optional(),
  }),
  highlights: z.array(z.string()).max(5),
  capacity: z.object({
    minLimit: z.number().int().positive(),
    maxLimit: z.number().int().positive(),
  }),
  durationHours: z.number().positive(),
});

export type Experience = z.infer<typeof ExperienceSchema>;
