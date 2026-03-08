import { z } from 'zod';

export const heroSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  photo: z.string().min(1),
});

export const contactLinkSchema = z.object({
  name: z.string(),
  label: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
});

export const contactSchema = z.object({
  links: z.array(contactLinkSchema),
});

export const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().default(''),
  image: z.string().optional().default(''),
  order: z.number().int().default(0),
  boss: z.string().optional().default(''),
  bossPhone: z.string().optional().default(''),
});

export const formationSchema = z.object({
  degree: z.string().min(1),
  institute: z.string().min(1),
  location: z.string().optional().default('Bogotá'),
  startDate: z.string().min(1),
  endDate: z.string().optional().default(''),
  order: z.number().int().default(0),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  level: z.number().int().min(0).max(100).optional().default(0),
  icon: z.string().optional().default('fa-solid fa-star'),
  order: z.number().int().default(0),
});

export const schemas: Record<string, z.ZodObject<any>> = {
  experiences: experienceSchema,
  formations: formationSchema,
  skills: skillSchema,
};
