import * as z from "zod";

import { t } from "@/lib/admin/console-texts";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: t("console.login.email-required") })
    .email({ message: t("console.login.email-invalid") }),
  password: z.string().min(8, { message: t("console.login.password-min") }),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const defaultLoginFormValues: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: true,
};
