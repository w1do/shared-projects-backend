"use client";

import { useEffect, useState, type RefObject } from "react";
import { preloadApexCharts } from "@/components/ui/charts/apex-charts-loader";

type Options = {
  /** When false, stays unready and resets (e.g. still waiting for query data). */
  enabled: boolean;
  /** Minimum .apexcharts-canvas nodes expected in root before unlock. */
  minCount?: number;
  /** Safety unlock so a chart failure never blocks the page forever. */
  timeoutMs?: number;
};

/**
 * Preloads ApexCharts, then watches `rootRef` until enough chart canvases
 * have mounted. Used to keep a skeleton overlay until charts are already drawn.
 */
export function useApexChartsPainted(
  rootRef: RefObject<HTMLElement | null>,
  { enabled, minCount = 1, timeoutMs = 4000 }: Options,
) {
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPainted(false);
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let raf1 = 0;
    let raf2 = 0;

    const unlock = () => {
      if (cancelled) return;
      // Wait two frames so the browser has a chance to paint SVG paths.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (!cancelled) setPainted(true);
        });
      });
    };

    const countCanvases = () => rootRef.current?.querySelectorAll(".apexcharts-canvas").length ?? 0;

    const tryUnlock = () => {
      if (countCanvases() >= minCount) {
        observer?.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
        unlock();
        return true;
      }
      return false;
    };

    void preloadApexCharts().catch(() => {
      // Chunk failure still allows timeout unlock below.
    });

    // Root may mount one tick after enabled flips true.
    const startWatch = () => {
      if (cancelled) return;
      if (tryUnlock()) return;

      const root = rootRef.current;
      if (!root) {
        timeoutId = setTimeout(startWatch, 16);
        return;
      }

      observer = new MutationObserver(() => {
        tryUnlock();
      });
      observer.observe(root, { childList: true, subtree: true });

      timeoutId = setTimeout(() => {
        observer?.disconnect();
        unlock();
      }, timeoutMs);
    };

    startWatch();

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [enabled, minCount, timeoutMs, rootRef]);

  return painted;
}
