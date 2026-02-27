"use client";

import toast, { type ToastOptions } from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const baseStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#111114",
  border: "1px solid #f0ebe0",
  boxShadow:
    "0 10px 25px rgba(11,21,39,0.08), 0 4px 10px rgba(11,21,39,0.04)",
  borderRadius: "0.75rem",
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: "0.875rem",
  padding: "12px 16px",
  maxWidth: "420px",
};

const iconMap = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-burgundy-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
};

function showToast(
  type: keyof typeof iconMap,
  title: string,
  description?: string,
  options?: ToastOptions
) {
  return toast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 ${t.visible ? "animate-slide-up" : "animate-fade-in opacity-0"}`}
        style={baseStyle}
      >
        {iconMap[type]}
        <div className="min-w-0 flex-1">
          <p className="font-sans text-body-sm font-semibold text-navy-900">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 font-sans text-caption text-charcoal-400">
              {description}
            </p>
          )}
        </div>
      </div>
    ),
    { duration: 4000, position: "top-right", ...options }
  );
}

export const brandToast = {
  success: (title: string, description?: string, options?: ToastOptions) =>
    showToast("success", title, description, options),
  error: (title: string, description?: string, options?: ToastOptions) =>
    showToast("error", title, description, options),
  warning: (title: string, description?: string, options?: ToastOptions) =>
    showToast("warning", title, description, options),
  info: (title: string, description?: string, options?: ToastOptions) =>
    showToast("info", title, description, options),
};
