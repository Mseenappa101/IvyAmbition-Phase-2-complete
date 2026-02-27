import { cn } from "@/lib/utils/cn";
import { formatInitials } from "@/lib/utils/format";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-[0.625rem]",
  md: "h-10 w-10 text-body-sm",
  lg: "h-12 w-12 text-body",
  xl: "h-16 w-16 text-heading-sm",
};

const dotSizes: Record<AvatarSize, string> = {
  sm: "h-2 w-2 border",
  md: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-3.5 w-3.5 border-2",
};

export function Avatar({
  name,
  src,
  size = "md",
  online,
  className,
}: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover ring-2 ring-ivory-300",
            sizeStyles[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-navy-900 font-sans font-semibold text-gold-400 ring-2 ring-ivory-300",
            sizeStyles[size]
          )}
        >
          {formatInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white",
            online ? "bg-emerald-500" : "bg-charcoal-300",
            dotSizes[size]
          )}
        />
      )}
    </div>
  );
}
