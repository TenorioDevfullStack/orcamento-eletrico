import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils.js";

function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme : "dark";
  const isDark = (currentTheme || "dark") === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200/70 bg-white/80 text-slate-700 shadow-sm transition-colors hover:bg-emerald-100 focus-visible:ring-emerald-400/30",
        "dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
        className,
      )}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all",
          isDark ? "scale-100 opacity-100 rotate-0 text-amber-400" : "-rotate-90 scale-0 opacity-0",
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-slate-700 dark:text-emerald-200",
        )}
        aria-hidden="true"
      />
      <span className="sr-only">Alternar modo de cor</span>
    </Button>
  );
}

export default ThemeToggle;
