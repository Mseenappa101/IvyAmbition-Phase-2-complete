"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ─── Single Select ──────────────────────────────────────────────────────────

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  helperText,
  searchable = false,
  disabled = false,
  className,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange?.(optionValue);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
        >
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left font-sans text-body shadow-inner-soft transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-gold-400/20",
          error
            ? "border-burgundy-500 focus:border-burgundy-500"
            : open
              ? "border-gold-400 ring-2 ring-gold-400/20"
              : "border-ivory-400 hover:border-ivory-500",
          disabled && "cursor-not-allowed bg-ivory-200 text-charcoal-400",
          selected ? "text-charcoal-900" : "text-charcoal-300"
        )}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="relative z-10">
          <div className="absolute mt-1.5 w-full rounded-xl border border-ivory-400 bg-white py-1 shadow-elevated animate-fade-in">
            {searchable && (
              <div className="border-b border-ivory-400 px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-charcoal-300" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-md border-0 bg-ivory-200 py-1.5 pl-8 pr-3 font-sans text-body-sm text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:ring-1 focus:ring-gold-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-center font-sans text-body-sm text-charcoal-400">
                  No results found
                </p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left font-sans text-body-sm transition-colors",
                      option.value === value
                        ? "bg-gold-50 text-gold-800"
                        : "text-charcoal-700 hover:bg-ivory-200",
                      option.disabled &&
                        "cursor-not-allowed text-charcoal-300"
                    )}
                  >
                    {option.label}
                    {option.value === value && (
                      <Check className="h-4 w-4 text-gold-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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

// ─── Multi Select ───────────────────────────────────────────────────────────

export interface MultiSelectProps {
  options: SelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  label,
  error,
  helperText,
  searchable = false,
  disabled = false,
  className,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((o) => value.includes(o.value));
  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const toggleOption = useCallback(
    (optionValue: string) => {
      const next = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange?.(next);
    },
    [value, onChange]
  );

  const removeOption = useCallback(
    (optionValue: string) => {
      onChange?.(value.filter((v) => v !== optionValue));
    },
    [value, onChange]
  );

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
        >
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full min-h-[2.875rem] flex-wrap items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-left font-sans text-body shadow-inner-soft transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-gold-400/20",
          error
            ? "border-burgundy-500"
            : open
              ? "border-gold-400 ring-2 ring-gold-400/20"
              : "border-ivory-400 hover:border-ivory-500",
          disabled && "cursor-not-allowed bg-ivory-200"
        )}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded-md bg-gold-50 px-2 py-0.5 font-sans text-caption font-medium text-gold-800 border border-gold-200"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(opt.value);
                }}
                className="text-gold-600 hover:text-gold-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-charcoal-300 px-1">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="relative z-10">
          <div className="absolute mt-1.5 w-full rounded-xl border border-ivory-400 bg-white py-1 shadow-elevated animate-fade-in">
            {searchable && (
              <div className="border-b border-ivory-400 px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-charcoal-300" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-md border-0 bg-ivory-200 py-1.5 pl-8 pr-3 font-sans text-body-sm text-charcoal-900 placeholder:text-charcoal-300 focus:outline-none focus:ring-1 focus:ring-gold-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-center font-sans text-body-sm text-charcoal-400">
                  No results found
                </p>
              ) : (
                filtered.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left font-sans text-body-sm transition-colors",
                        isSelected
                          ? "bg-gold-50 text-gold-800"
                          : "text-charcoal-700 hover:bg-ivory-200",
                        option.disabled &&
                          "cursor-not-allowed text-charcoal-300"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-gold-500 bg-gold-500"
                            : "border-charcoal-300"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </span>
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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
