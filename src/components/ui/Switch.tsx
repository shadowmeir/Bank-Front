import React from "react";

type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

export function Switch({ label, description, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
    >
      <div>
        <div className="font-medium text-white">{label}</div>
        {description ? <div className="text-sm text-gray-400">{description}</div> : null}
      </div>

      <div
        className={`w-12 h-6 rounded-full p-1 transition-colors ${
          checked ? "bg-emerald-500" : "bg-white/10"
        }`}
        aria-checked={checked}
        role="switch"
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
