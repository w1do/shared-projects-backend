import * as z from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your work email." })
    .email({ message: "Enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const defaultLoginFormValues: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: true,
};
