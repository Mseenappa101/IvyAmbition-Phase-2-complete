"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab: controlledActive,
  onChange,
  children,
  className,
}: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? "");
  const activeTab = controlledActive ?? internalActive;

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current[activeTab];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const handleTabClick = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalActive(id);
    }
  };

  return (
    <div className={className}>
      <div className="relative" ref={containerRef}>
        <div className="flex gap-1 border-b border-ivory-400">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 font-sans text-body-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-navy-900"
                  : "text-charcoal-400 hover:text-charcoal-700",
                tab.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
        {/* Gold underline indicator */}
        <div
          className="absolute bottom-0 h-0.5 rounded-full bg-gold-500 transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>
      {children && <div className="pt-5">{children}</div>}
    </div>
  );
}
