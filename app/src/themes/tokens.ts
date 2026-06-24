// Theme token type definitions
export interface ThemeTokens {
  name: string
  colors: {
    bg: string
    bgAlt: string
    bgDark: string
    text: string
    textMuted: string
    textOnDark: string
    border: string
    borderDark: string
    accent: string
    accentSecondary: string
    success: string
    danger: string
    surface: string
    surfaceAlt: string
    surfaceDark: string
    badgeAdvance: string
    badgeEliminate: string
    flagBg: string
  }
  typography: {
    sans: string
    mono: string
    displayWeight: string
    bodyWeight: string
  }
  radius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export type ThemeName = 'sport' | 'minimal' | 'dark'

export const themes: Record<ThemeName, ThemeTokens> = {
  sport: {
    name: '⚽ Sport',
    colors: {
      bg: '#f8f8f8',
      bgAlt: '#ffffff',
      bgDark: '#111111',
      text: '#111111',
      textMuted: '#888888',
      textOnDark: '#ffffff',
      border: '#e0e0e0',
      borderDark: '#2a2a2a',
      accent: '#e31b23',
      accentSecondary: '#fc4c02',
      success: '#0a7e3d',
      danger: '#d32f2f',
      surface: '#ffffff',
      surfaceAlt: '#f0f0f0',
      surfaceDark: '#1a1a1a',
      badgeAdvance: '#0a7e3d',
      badgeEliminate: '#d32f2f',
      flagBg: '#f0f0f0',
    },
    typography: {
      sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', monospace",
      displayWeight: '700',
      bodyWeight: '400',
    },
    radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  },

  minimal: {
    name: '📄 Minimal',
    colors: {
      bg: '#ffffff',
      bgAlt: '#fafafa',
      bgDark: '#1a1a2e',
      text: '#1a1a2e',
      textMuted: '#a0a0b0',
      textOnDark: '#ffffff',
      border: '#e8e8ee',
      borderDark: '#2d2d44',
      accent: '#4a6cf7',
      accentSecondary: '#6c5ce7',
      success: '#10b981',
      danger: '#ef4444',
      surface: '#ffffff',
      surfaceAlt: '#f5f5f8',
      surfaceDark: '#1e1e36',
      badgeAdvance: '#10b981',
      badgeEliminate: '#ef4444',
      flagBg: '#f0f0f5',
    },
    typography: {
      sans: "'Inter', -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
      displayWeight: '600',
      bodyWeight: '400',
    },
    radius: { sm: '6px', md: '10px', lg: '16px', full: '9999px' },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px' },
  },

  dark: {
    name: '🌙 Dark',
    colors: {
      bg: '#0c0c1a',
      bgAlt: '#14142a',
      bgDark: '#060610',
      text: '#e8e8f0',
      textMuted: '#8888a0',
      textOnDark: '#ffffff',
      border: '#1e1e3a',
      borderDark: '#2a2a4a',
      accent: '#7c3aed',
      accentSecondary: '#f59e0b',
      success: '#34d399',
      danger: '#f87171',
      surface: '#14142a',
      surfaceAlt: '#1a1a34',
      surfaceDark: '#0a0a18',
      badgeAdvance: '#34d399',
      badgeEliminate: '#f87171',
      flagBg: '#1a1a34',
    },
    typography: {
      sans: "'Inter', -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
      displayWeight: '600',
      bodyWeight: '400',
    },
    radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  },
}
