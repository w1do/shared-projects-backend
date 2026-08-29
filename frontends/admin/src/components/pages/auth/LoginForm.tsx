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
import {
  loginFormSchema,
  defaultLoginFormValues,
  type LoginFormValues,
} from "@/lib/admin/schemas/content/login-form-schema";
import { siteConfig } from "@/lib/site-config";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  AdminAuthError,
  signInOperator,
} from "@/lib/admin/data-source/session";

export function LoginForm() {
  const router = useRouter();
  const t = useConsoleText();
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
      const user = await signInOperator(
        data.email,
        data.password,
        data.rememberMe,
      );

      toast.success(tf("console.login.welcome", { name: user.name }));
      router.push("/admin");
    } catch (error) {
      toast.error(
        error instanceof AdminAuthError
          ? error.message
          : t("console.login.failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
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
          {t("console.login.title")}
        </h1>
        <p className="text-body text-muted-foreground">
          {t("console.login.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Input
          type="email"
          label={t("console.login.email-label")}
          placeholder={siteConfig.urls.demoUserEmail}
          autoComplete="email"
          startIcon={<Mail />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          type={showPassword ? "text" : "password"}
          label={t("console.login.password-label")}
          placeholder={t("console.login.password-placeholder")}
          autoComplete="current-password"
          startIcon={<Lock />}
          endIcon={
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((prev) => !prev)}
              className="pointer-events-auto"
              aria-label={
                showPassword
                  ? t("console.login.hide-password")
                  : t("console.login.show-password")
              }
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </IconButton>
          }
          labelRight={
            <a
              href="#"
              className="text-xs font-medium text-brand-accent transition-colors hover:text-brand-accent-hover"
            >
              {t("console.login.forgot-password")}
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
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label
                htmlFor="rememberMe"
                className="text-body text-muted-foreground"
              >
                {t("console.login.remember-me")}
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
          {isSubmitting
            ? t("console.login.submitting")
            : t("console.login.submit")}
        </Button>
      </form>

      <p className="text-center text-body text-muted-foreground">
        {t("console.login.need-account")}{" "}
        <a
          href="#"
          className="font-medium text-foreground transition-colors hover:text-brand-accent"
        >
          {t("console.login.request-access")}
        </a>
      </p>
    </div>
  );
}
