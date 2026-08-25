interface AdminGradientStyle {
  id: string;
  start: string;
  end: string;
  share?: number;
}

interface AdminToneStyle {
  id: string;
  color: string;
}

interface AdminProgressStyle {
  id: string;
  value: number;
}

interface AdminDynamicStylesProps {
  gradients?: AdminGradientStyle[];
  tones?: AdminToneStyle[];
  progress?: AdminProgressStyle[];
}

function escapeCssAttribute(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function buildGradientRules(gradients: AdminGradientStyle[]) {
  return gradients
    .map((gradient) => {
      const id = escapeCssAttribute(gradient.id);
      const share =
        gradient.share === undefined ? "" : `--admin-share: ${clampPercent(gradient.share)}%;`;

      return `
[data-admin-gradient="${id}"] {
  --admin-gradient-start: ${gradient.start};
  --admin-gradient-end: ${gradient.end};
  ${share}
}`;
    })
    .join("\n");
}

function buildToneRules(tones: AdminToneStyle[]) {
  return tones
    .map((tone) => {
      const id = escapeCssAttribute(tone.id);

      return `
[data-admin-tone="${id}"] {
  --admin-tone: ${tone.color};
}`;
    })
    .join("\n");
}

function buildProgressRules(progress: AdminProgressStyle[]) {
  return progress
    .map((item) => {
      const id = escapeCssAttribute(item.id);
      const value = clampPercent(item.value);
      const offset = 100 - value;

      return `
[data-admin-progress="${id}"] {
  --admin-progress: ${value}%;
  --admin-progress-offset: ${offset}%;
}`;
    })
    .join("\n");
}

export function AdminDynamicStyles({
  gradients = [],
  tones = [],
  progress = [],
}: AdminDynamicStylesProps) {
  const css = [buildGradientRules(gradients), buildToneRules(tones), buildProgressRules(progress)]
    .filter(Boolean)
    .join("\n");

  if (!css) {
    return null;
  }

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
