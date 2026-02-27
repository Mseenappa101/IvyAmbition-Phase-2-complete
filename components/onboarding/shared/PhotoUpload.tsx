"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

interface PhotoUploadProps {
  preview: string | null;
  name: string;
  onSelect: (file: File, preview: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUpload({ preview, name, onSelect }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image must be under 5 MB");
      return;
    }

    const url = URL.createObjectURL(file);
    onSelect(file, url);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200",
          "ring-4 ring-ivory-400 hover:ring-gold-400/40",
          preview ? "" : "bg-navy-900"
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-serif text-heading-lg text-gold-400">
            {initials || "?"}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="font-sans text-body-sm font-medium text-gold-600 transition-colors hover:text-gold-500"
      >
        {preview ? "Change photo" : "Upload photo"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
