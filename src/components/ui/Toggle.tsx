import React from "react";

type ToggleOption = { value: string; label: string };

type ToggleProps = {
  options: ToggleOption[];
  value: string;
  setValue: (v: string) => void;
  className?: string;
};

export function Toggle({ options, value, setValue, className = "" }: ToggleProps) {
  return (
    <div
      className={`inline-flex items-center rounded-lg bg-white/5 border border-white/10 p-1 ${className}`}
      role="tablist"
      aria-label="Toggle"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setValue(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              active ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            role="tab"
            aria-selected={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
