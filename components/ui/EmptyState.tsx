import { cn } from "@/lib/utils/cn";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      {/* Illustration placeholder */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-ivory-200 ring-8 ring-ivory-200/50">
        {icon || <Inbox className="h-9 w-9 text-charcoal-300" />}
      </div>
      <h3 className="font-serif text-heading-lg text-navy-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm font-sans text-body text-charcoal-400">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
