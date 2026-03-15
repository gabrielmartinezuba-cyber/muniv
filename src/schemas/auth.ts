import { z } from "zod";
import { differenceInYears, parseISO, isValid } from "date-fns";

export const SignUpSchema = z.object({
  firstName: z.string().min(2, "Ingresá tu nombre real"),
  lastName: z.string().min(2, "Ingresá tu apellido"),
  email: z.string().email("El formato del email no es válido"),
  password: z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  dob: z.string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((dateString) => {
      // 1. Parsing y validación estricta de la fecha
      const dobDate = parseISO(dateString);
      if (!isValid(dobDate)) return false;
      
      // 2. Cálculo matemático exacto de la edad (+18)
      const age = differenceInYears(new Date(), dobDate);
      return age >= 18;
    }, {
      message: "Debes ser mayor de 18 años para unirte a MUNIV.",
    })
});

export type SignUpFormData = z.infer<typeof SignUpSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
