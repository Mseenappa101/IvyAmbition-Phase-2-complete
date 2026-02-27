import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "premium";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-ivory-200 text-charcoal-600 border-ivory-400",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-burgundy-600 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  premium: "bg-gold-50 text-gold-800 border-gold-200",
};

const dotColors: Record<BadgeVariant, string> = {
  neutral: "bg-charcoal-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-burgundy-500",
  info: "bg-blue-500",
  premium: "bg-gold-500",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[0.6875rem]",
  md: "px-2.5 py-0.5 text-caption",
};

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-sans font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
