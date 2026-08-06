import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo válido.")
    .max(320, "El correo es demasiado largo."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña es demasiado larga."),
});

export const recoverPasswordSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido.").max(320),
});

export const passwordResetCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo válido.")
    .max(320, "El correo es demasiado largo."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El código debe tener 6 dígitos."),
});

export const confirmPasswordResetSchema = passwordResetCodeSchema.extend({
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña es demasiado larga.")
    .regex(/[a-z]/, "Incluye una letra minúscula.")
    .regex(/[A-Z]/, "Incluye una letra mayúscula.")
    .regex(/[0-9]/, "Incluye un número."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RecoverPasswordSchema = z.infer<typeof recoverPasswordSchema>;
export type PasswordResetCodeSchema = z.infer<typeof passwordResetCodeSchema>;
export type ConfirmPasswordResetSchema = z.infer<typeof confirmPasswordResetSchema>;
