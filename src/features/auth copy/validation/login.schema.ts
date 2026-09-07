import { z } from "zod";

export const loginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .min(1, "mobile_required")
    .regex(/^[0-9]{10}$/, "invalid_mobile"),

  password: z
    .string()
    .trim()
    .min(1, "password_required")
    .min(6, "password_min_length"),
});

export type LoginFormData = z.infer<typeof loginSchema>;