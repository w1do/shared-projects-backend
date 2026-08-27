import { Switch } from "@/components/ui/inputs/switch";

interface SettingsToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
}

export function SettingsToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  leading,
  trailing,
  disabled,
}: SettingsToggleRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4 transition-colors duration-200 hover:border-border hover:bg-muted/30">
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-foreground">{title}</p>
        <p className="mt-2 text-caption text-muted-foreground">{description}</p>
      </div>
      {trailing}
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
