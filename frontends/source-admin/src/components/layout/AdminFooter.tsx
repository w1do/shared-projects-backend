import { StatusDot } from "@/components/ui/feedback/status-dot";
import { t } from "@/lib/admin/console-texts";
import { siteConfig } from "@/lib/site-config";

export function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground-lighter select-none">
      <div className="flex items-center gap-2">
        <span>
          © {year} {siteConfig.brand.legalName}.
        </span>
        <span className="hidden sm:inline text-border/60">•</span>
        <span className="hidden sm:inline">{siteConfig.brand.tagline}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono">{siteConfig.admin.version}</span>
        <span className="text-border/60">•</span>
        <div className="flex items-center gap-2">
          <StatusDot color="success" ping />
          <span>{t("console.footer.system-healthy")}</span>
        </div>
      </div>
    </footer>
  );
}
