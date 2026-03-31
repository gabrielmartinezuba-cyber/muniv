import { z } from "zod";

export const BookingSubmitSchema = z.object({
  experienceId: z.string().nullable(),
  experienceTitle: z.string().nullable(),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "El horario es requerido"),
  guests: z.number().int().min(1).max(20),
  upSells: z.array(z.string()),
  guest_name: z.string().optional(),
  guest_email: z.string().email().optional().or(z.literal("")),
  final_price: z.number().optional(),
  selected_wines: z.array(z.string()).optional()
});

export const GiftingSubmitSchema = z.object({
  companyName: z.string().min(2, "Ingresá un nombre válido"),
  contactName: z.string().min(2, "Ingresá tu nombre"),
  email: z.string().email("Email corporativo inválido"),
  volume: z.string(),
  budget: z.string(),
  message: z.string().optional()
});

