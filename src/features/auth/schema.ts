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

export const passwordResetTokenSchema = z.object({
  token: z.string().trim().min(43, "El enlace no es válido.").max(256).regex(/^[A-Za-z0-9_-]+$/),
});

export const confirmPasswordResetSchema = passwordResetTokenSchema.extend({
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
export type PasswordResetTokenSchema = z.infer<typeof passwordResetTokenSchema>;
export type ConfirmPasswordResetSchema = z.infer<typeof confirmPasswordResetSchema>;
