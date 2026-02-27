"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type ProgressBarSize = "sm" | "md" | "lg";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: ProgressBarSize;
  animated?: boolean;
  className?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  animated = true,
  className,
}: ProgressBarProps) {
  const [displayWidth, setDisplayWidth] = useState(animated ? 0 : value);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      const timer = requestAnimationFrame(() => setDisplayWidth(percentage));
      return () => cancelAnimationFrame(timer);
    }
    setDisplayWidth(percentage);
  }, [percentage, animated]);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <span className="font-sans text-body-sm font-medium text-charcoal-700">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-sans text-caption font-semibold text-gold-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-navy-900/10",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400",
            animated && "transition-all duration-700 ease-out"
          )}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
}
