"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Label } from "@/components/ui/inputs/label";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { DemoAccountSelector } from "./DemoAccountSelector";
import {
  loginFormSchema,
  defaultLoginFormValues,
  type LoginFormValues,
} from "@/lib/admin/schemas/content/login-form-schema";
import { siteConfig } from "@/lib/site-config";
import { AdminAuthError, signInOperator } from "@/lib/admin/data-source/session";

interface LoginFormProps {
  showDemo?: boolean;
}

export function LoginForm({ showDemo = false }: LoginFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema) as Resolver<LoginFormValues>,
    defaultValues: defaultLoginFormValues,
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // Аутентификация выполняется слоем данных: режим api — auth-service, mock — данные вёрстки.
      // Сессия (cookies auth_token/auth_role и current_user) сохраняется там же.
      const user = await signInOperator(data.email, data.password, data.rememberMe);

      toast.success(`Welcome back, ${user.name}`);
      router.push("/admin");
    } catch (error) {
      toast.error(
        error instanceof AdminAuthError
          ? error.message
          : "Sign in failed. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <DemoAccountSelector
        showDemo={showDemo}
        onSelectUser={(user) => {
          setValue("email", user.email);
          setValue("password", "password");
          toast.success(`Selected profile: ${user.name} (${user.role})`);
        }}
      />

      <div className="flex flex-col gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary lg:hidden">
          <Image
            src={siteConfig.assets.logoSrc}
            alt={siteConfig.assets.logoAlt}
            width={32}
            height={32}
            className="shrink-0 object-contain"
          />
        </div>
        <h1 className="font-openrunde text-heading-lg text-foreground">
          {siteConfig.copy.signInTitle}
        </h1>
        <p className="text-body text-muted-foreground">
          Enter your credentials to access the operations console.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Input
          type="email"
          label="Work email"
          placeholder={siteConfig.urls.demoUserEmail}
          autoComplete="email"
          startIcon={<Mail />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          startIcon={<Lock />}
          endIcon={
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((prev) => !prev)}
              className="pointer-events-auto"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </IconButton>
          }
          labelRight={
            <a
              href="#"
              className="text-xs font-medium text-brand-accent transition-colors hover:text-brand-accent-hover"
            >
              Forgot password?
            </a>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox id="rememberMe" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="rememberMe" className="text-body text-muted-foreground">
                Keep me signed in for 30 days
              </Label>
            </div>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="lg"
          shape="circle"
          startIcon={<LogIn />}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-body text-muted-foreground">
        Need an account?{" "}
        <a
          href="#"
          className="font-medium text-foreground transition-colors hover:text-brand-accent"
        >
          Request access
        </a>
      </p>
    </div>
  );
}
