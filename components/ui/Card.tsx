import { cn } from "@/lib/utils/cn";

export type CardVariant = "light" | "dark";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
  light:
    "bg-white border border-ivory-400 shadow-card",
  dark:
    "bg-navy-900 border border-navy-700 shadow-elevated text-white",
};

const hoverVariantStyles: Record<CardVariant, string> = {
  light: "hover:shadow-card-hover hover:-translate-y-0.5",
  dark: "hover:shadow-modal hover:-translate-y-0.5 hover:border-navy-600",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  className,
  variant = "light",
  hoverable = false,
  padding = "none",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variantStyles[variant],
        hoverable && hoverVariantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: CardVariant;
}

export function CardHeader({
  className,
  title,
  description,
  action,
  variant = "light",
  children,
  ...props
}: CardHeaderProps) {
  const borderColor =
    variant === "dark" ? "border-navy-700" : "border-ivory-400";

  return (
    <div
      className={cn("border-b px-6 py-4", borderColor, className)}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3
                className={cn(
                  "font-serif text-heading",
                  variant === "dark" ? "text-white" : "text-navy-900"
                )}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                className={cn(
                  "mt-1 font-sans text-body-sm",
                  variant === "dark" ? "text-ivory-500" : "text-charcoal-400"
                )}
              >
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function CardFooter({
  className,
  variant = "light",
  children,
  ...props
}: CardFooterProps) {
  const borderColor =
    variant === "dark" ? "border-navy-700" : "border-ivory-400";

  return (
    <div
      className={cn("border-t px-6 py-4", borderColor, className)}
      {...props}
    >
      {children}
    </div>
  );
}
