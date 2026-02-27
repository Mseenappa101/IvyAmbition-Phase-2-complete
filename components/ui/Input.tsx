"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, icon, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={cn(
              "w-full rounded-lg border bg-white px-4 py-3 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200",
              "placeholder:text-charcoal-300",
              "focus:outline-none focus:ring-2 focus:ring-gold-400/20",
              error
                ? "border-burgundy-500 focus:border-burgundy-500 focus:ring-burgundy-500/20"
                : "border-ivory-400 focus:border-gold-400",
              icon && "pl-11",
              isPassword && "pr-12",
              "disabled:cursor-not-allowed disabled:bg-ivory-200 disabled:text-charcoal-400",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 transition-colors hover:text-charcoal-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1.5 font-sans text-caption",
              error ? "text-burgundy-500" : "text-charcoal-400"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Textarea ───────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxCharacters?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, helperText, error, maxCharacters, id, value, ...props },
    ref
  ) => {
    const charCount =
      typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          value={value}
          className={cn(
            "w-full resize-none rounded-lg border bg-white px-4 py-3 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200",
            "placeholder:text-charcoal-300",
            "focus:outline-none focus:ring-2 focus:ring-gold-400/20",
            error
              ? "border-burgundy-500 focus:border-burgundy-500 focus:ring-burgundy-500/20"
              : "border-ivory-400 focus:border-gold-400",
            "disabled:cursor-not-allowed disabled:bg-ivory-200 disabled:text-charcoal-400",
            className
          )}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between">
          {(error || helperText) && (
            <p
              className={cn(
                "font-sans text-caption",
                error ? "text-burgundy-500" : "text-charcoal-400"
              )}
            >
              {error || helperText}
            </p>
          )}
          {maxCharacters !== undefined && (
            <p
              className={cn(
                "ml-auto font-sans text-caption",
                charCount > maxCharacters
                  ? "text-burgundy-500"
                  : "text-charcoal-400"
              )}
            >
              {charCount}/{maxCharacters}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
