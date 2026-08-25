import { ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/data-display/badge";
import { siteConfig } from "@/lib/site-config";

const metrics = [
  { value: "12", label: "Beauty houses" },
  { value: "48K", label: "SKUs managed" },
  { value: "99.9%", label: "Uptime SLA" },
];

export function LoginShowcase() {
  return (
    <aside className="auth-showcase relative hidden min-h-screen overflow-hidden bg-primary p-16 text-primary-foreground md:flex md:flex-col md:justify-between">
      <div className="auth-showcase-grain pointer-events-none absolute inset-0 opacity-60" />
      <div className="auth-showcase-orbit pointer-events-none absolute right-8 top-8" />
      <div className="auth-showcase-card pointer-events-none absolute right-12 top-32" />
      <div className="auth-glow-warm pointer-events-none absolute -right-16 -top-16" />
      <div className="auth-glow-cool pointer-events-none absolute -bottom-16 -left-16" />

      <Link href="/frontends/source-admin/public" className="relative flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
          <Image
            src={siteConfig.assets.logoSrc}
            alt={siteConfig.assets.logoAlt}
            width={32}
            height={32}
            className="shrink-0 object-contain"
          />
        </div>
        <div className="leading-tight">
          <p className="font-openrunde text-body-lg">{siteConfig.copy.showcaseTitle}</p>
          <p className="text-caption text-primary-foreground/60">Operations console</p>
        </div>
      </Link>

      <div className="relative max-w-md">
        <Badge
          variant="soft"
          color="overlay"
          shape="circle"
          size="lg"
          startIcon={<Sparkles />}
          className="backdrop-blur-sm"
        >
          Multi-brand beauty commerce
        </Badge>
        <h2 className="mt-6 font-openrunde text-heading-xl leading-tight">
          Run every brand from one calm, premium workspace.
        </h2>
        <p className="mt-4 text-body-lg text-primary-foreground/70">
          Catalogs, orders, promotions and insights — orchestrated with the clarity your team
          deserves.
        </p>
      </div>

      <div className="relative">
        <div className="flex items-center gap-6">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="flex items-center gap-6">
              {index > 0 && <div className="auth-metric-divider bg-primary-foreground/15" />}
              <div>
                <p className="font-openrunde text-heading-sm">{metric.value}</p>
                <p className="text-caption text-primary-foreground/60">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2 text-caption text-primary-foreground/60">
          <ShieldCheck className="h-4 w-4" />
          SOC 2 Type II compliant infrastructure
        </div>
      </div>
    </aside>
  );
}
