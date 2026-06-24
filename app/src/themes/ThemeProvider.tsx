import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { themes, type ThemeTokens, type ThemeName } from './tokens'

interface ThemeContextType {
  theme: ThemeTokens
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
  themeNames: ThemeName[]
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function applyTheme(theme: ThemeTokens) {
  const root = document.documentElement
  const c = theme.colors
  root.style.setProperty('--bg', c.bg)
  root.style.setProperty('--bg-alt', c.bgAlt)
  root.style.setProperty('--bg-dark', c.bgDark)
  root.style.setProperty('--text', c.text)
  root.style.setProperty('--text-muted', c.textMuted)
  root.style.setProperty('--text-on-dark', c.textOnDark)
  root.style.setProperty('--border', c.border)
  root.style.setProperty('--border-dark', c.borderDark)
  root.style.setProperty('--accent', c.accent)
  root.style.setProperty('--accent-secondary', c.accentSecondary)
  root.style.setProperty('--success', c.success)
  root.style.setProperty('--danger', c.danger)
  root.style.setProperty('--surface', c.surface)
  root.style.setProperty('--surface-alt', c.surfaceAlt)
  root.style.setProperty('--surface-dark', c.surfaceDark)
  root.style.setProperty('--badge-advance', c.badgeAdvance)
  root.style.setProperty('--badge-eliminate', c.badgeEliminate)
  root.style.setProperty('--flag-bg', c.flagBg)

  const t = theme.typography
  root.style.setProperty('--font-sans', t.sans)
  root.style.setProperty('--font-mono', t.mono)
  root.style.setProperty('--weight-display', t.displayWeight)
  root.style.setProperty('--weight-body', t.bodyWeight)

  const r = theme.radius
  root.style.setProperty('--radius-sm', r.sm)
  root.style.setProperty('--radius-md', r.md)
  root.style.setProperty('--radius-lg', r.lg)
  root.style.setProperty('--radius-full', r.full)

  const s = theme.spacing
  root.style.setProperty('--space-xs', s.xs)
  root.style.setProperty('--space-sm', s.sm)
  root.style.setProperty('--space-md', s.md)
  root.style.setProperty('--space-lg', s.lg)
  root.style.setProperty('--space-xl', s.xl)
}

const STORAGE_KEY = 'wc2026-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in themes) return saved as ThemeName
    return 'sport'
  })

  const theme = themes[themeName]
  const themeNames = Object.keys(themes) as ThemeName[]

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, themeName)
  }, [theme, themeName])

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName, themeNames }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
