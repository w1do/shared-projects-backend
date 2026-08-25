import type { LucideIcon } from "lucide-react";

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 text-foreground">
      <header className="flex items-start gap-4 border-b border-border/50 p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-openrunde text-subheading text-foreground">{title}</h2>
          <p className="mt-2 text-caption text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="flex flex-col gap-6 p-6">{children}</div>
      {footer ? (
        <footer className="flex items-center justify-end gap-4 border-t border-border/50 bg-muted/20 px-6 py-4">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
