import { Construction } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function StubPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground-lighter">
          <span className="h-2 w-2 rounded-full bg-brand-accent" />
          <span className="uppercase tracking-widest">{siteConfig.copy.stubEyebrow}</span>
        </div>
        <h1 className="mt-4 font-openrunde text-display text-foreground">{title}</h1>
        <p className="mt-2 max-w-xl text-body-lg text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-h-24 flex-col items-center justify-center gap-4 rounded-3xl bg-muted p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-subtle-3">
          <Construction className="h-6 w-6 text-brand-accent" />
        </div>
        <div>
          <div className="font-openrunde text-heading text-foreground">Coming soon</div>
          <p className="mt-2 max-w-sm text-body text-muted-foreground">
            This workspace is being prepared. Manage everything from the Dashboard for now.
          </p>
        </div>
      </div>
    </div>
  );
}
