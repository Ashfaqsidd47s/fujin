import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "theme"
const query = "(prefers-color-scheme: dark)"

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "light" || value === "dark" ? value : "system"
  } catch {
    return "system"
  }
}

function subscribeToSystem(callback: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

/**
 * Class-based theming (`.dark` on <html>). `index.html` applies the stored
 * theme before first paint; this provider keeps it in sync afterwards.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme)
  const systemDark = React.useSyncExternalStore(
    subscribeToSystem,
    () => window.matchMedia(query).matches,
    () => false
  )
  const resolvedTheme =
    theme === "system" ? (systemDark ? "dark" : "light") : theme

  React.useEffect(() => {
    const root = document.documentElement
    // Suppress transitions while the palette swaps.
    root.classList.add("[&_*]:!transition-none")
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
    const frame = requestAnimationFrame(() =>
      root.classList.remove("[&_*]:!transition-none")
    )
    return () => cancelAnimationFrame(frame)
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: Theme) => {
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the choice still applies.
    }
    setThemeState(next)
  }, [])

  // Press `d` to toggle dark mode.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return
      }
      if (event.key.toLowerCase() === "d") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>")
  return context
}
