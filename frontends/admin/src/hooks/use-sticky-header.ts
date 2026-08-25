"use client";

import * as React from "react";

/**
 * Track whether the page has scrolled past a threshold so a floating sticky
 * header can fade in. Canonical sticky hook for all admin form pages.
 */
export function useStickyHeader(threshold = 120) {
  const [isSticky, setIsSticky] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isSticky;
}

/** @deprecated Prefer useStickyHeader — alias kept for existing imports. */
export const useStickyThreshold = useStickyHeader;
