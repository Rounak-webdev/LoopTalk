import { Moon, Sparkles, SunMedium } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const icons = {
  "looptalk-night": Moon,
  "looptalk-light": SunMedium,
  "looptalk-aurora": Sparkles,
};

const labels = {
  "looptalk-night": "Night",
  "looptalk-light": "Light",
  "looptalk-aurora": "Aurora",
};

const cycle = ["looptalk-night", "looptalk-light", "looptalk-aurora"];

const ThemeToggle = ({ compact = false, binary = false }) => {
  const { theme, setTheme } = useThemeStore();
  const CurrentIcon = icons[theme] || Moon;

  const handleToggle = () => {
    const nextTheme = binary
      ? theme === "looptalk-light"
        ? "looptalk-night"
        : "looptalk-light"
      : cycle[(cycle.indexOf(theme) + 1) % cycle.length];
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--border-strong)] hover:bg-white/10 ${
        compact ? "px-2.5 py-2" : ""
      }`}
    >
      <CurrentIcon className="size-4" />
      {!compact && <span>{binary ? (theme === "looptalk-light" ? "Light" : "Dark") : labels[theme]}</span>}
    </button>
  );
};

export default ThemeToggle;
