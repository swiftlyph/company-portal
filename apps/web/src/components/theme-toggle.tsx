import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useTheme } from "@/components/theme-provider"

function resolveIsDark(theme: "dark" | "light" | "system"): boolean {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  return theme === "dark"
}

/**
 * Flips between light and dark through the scaffold's ThemeProvider (the
 * same store the no-flash script in index.html reads), so the toggle, the
 * `d` shortcut and the first paint can never disagree.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = resolveIsDark(theme)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle dark theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  )
}
