import { SettingsHeaderSkeleton } from "./header/SettingsHeaderSkeleton";
import { SettingsTabsSkeleton } from "./panel/SettingsTabsSkeleton";
import { SettingsGeneralSkeleton } from "./panel/SettingsGeneralSkeleton";

export function SettingsLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <SettingsHeaderSkeleton />
      <SettingsTabsSkeleton />
      <SettingsGeneralSkeleton />
    </div>
  );
}
