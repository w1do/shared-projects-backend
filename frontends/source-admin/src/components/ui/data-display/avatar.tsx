"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "default" | "lg" | "xl" | "full";
  shape?: "circle" | "rounded" | "square";
  fallbackClassName?: string;
  fallbackShadow?: "default" | "none";
  priority?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      fallback,
      children,
      size = "default",
      shape = "circle",
      fallbackClassName,
      fallbackShadow = "default",
      priority = false,
      ...props
    },
    ref,
  ) => {
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);
    const localRef = React.useRef<HTMLDivElement>(null);

    // Combine external ref with localRef
    React.useImperativeHandle(ref, () => localRef.current!);

    // Map size keys to corresponding layout classes and typography style
    const sizeClasses = {
      sm: "h-8 w-8 text-xs font-semibold",
      default: "h-10 w-10 text-sm font-semibold",
      lg: "h-12 w-12 text-base font-semibold",
      xl: "h-16 w-16 text-lg font-semibold",
      full: "h-full w-full text-heading font-semibold",
    };

    const shapeClasses = {
      circle: "rounded-full",
      rounded: "rounded-xl",
      square: "rounded-none",
    };

    const fallbackContent = children || fallback;
    const showFallback = !src || error || !loaded;

    // Check if the image has already completed loading (e.g., loaded from cache before hydration)
    React.useEffect(() => {
      setLoaded(false);
      setError(false);

      const img = localRef.current?.querySelector("img");
      if (img) {
        if (img.complete) {
          if (img.naturalWidth === 0) {
            setError(true);
          } else {
            setLoaded(true);
          }
        }
      }
    }, [src]);

    return (
      <div
        ref={localRef}
        className={cn(
          "relative flex shrink-0 overflow-hidden select-none bg-muted",
          sizeClasses[size],
          shapeClasses[shape],
          className,
        )}
        {...props}
      >
        {src && !error && (
          <Image
            src={src}
            alt={alt || ""}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className={cn(
              "object-cover h-full w-full transition-all duration-700 ease-out group-hover:scale-105",
              loaded ? "opacity-100" : "opacity-0",
            )}
            priority={priority}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        {showFallback && (
          <div
            className={cn(
              "absolute inset-0 flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-openrunde transition-transform duration-700 ease-out group-hover:scale-105 admin-gradient-swatch text-xs font-semibold text-primary-foreground",
              fallbackShadow === "default" && "ui-avatar-fallback-shadow",
              fallbackClassName,
            )}
          >
            {fallbackContent}
          </div>
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
