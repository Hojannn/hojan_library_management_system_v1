import { Check } from "lucide-react";

import { applyTheme, type ThemePreference } from "../lib/theme";

interface ThemeChoiceProps {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
}

export function ThemeChoice({ theme, onChange }: ThemeChoiceProps) {
  const selectTheme = (nextTheme: ThemePreference) => {
    applyTheme(nextTheme);
    onChange(nextTheme);
  };

  return (
    <div role="radiogroup" aria-label="Color theme" className="grid gap-4 sm:grid-cols-2">
      {(["light", "dark"] as const).map((option) => {
        const selected = theme === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option === "light" ? "Light" : "Dark"}
            onClick={() => selectTheme(option)}
            className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${
              selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`mb-3 h-20 rounded-xl border p-2 ${option === "dark" ? "border-white/10 bg-[#23251f]" : "border-black/5 bg-[#f4f1e8]"}`}>
              <div className={`h-2 w-2/3 rounded-full ${option === "dark" ? "bg-white/20" : "bg-black/10"}`} />
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <div className={`col-span-1 h-10 rounded-md ${option === "dark" ? "bg-white/8" : "bg-white"}`} />
                <div className={`col-span-2 h-10 rounded-md ${option === "dark" ? "bg-white/8" : "bg-white"}`} />
              </div>
            </div>
            <span className="text-sm font-semibold capitalize sm:text-base">{option}</span>
            {selected && (
              <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
