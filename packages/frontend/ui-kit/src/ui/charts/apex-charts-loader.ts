type ReactApexChartsModule = typeof import("react-apexcharts");

/** Shared promise so preload + dynamic() hit the same module cache. */
let apexChartsImport: Promise<ReactApexChartsModule> | null = null;

/**
 * Prefetch react-apexcharts while page skeleton is visible so the first
 * real paint already includes chart surfaces (no empty→chart pop-in).
 */
export function preloadApexCharts(): Promise<ReactApexChartsModule> {
  if (!apexChartsImport) {
    apexChartsImport = import("react-apexcharts");
  }
  return apexChartsImport;
}
