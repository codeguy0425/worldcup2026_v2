import { useTheme } from '../themes/ThemeProvider'

export function ThemeSwitcher() {
  const { themeName, setTheme, themeNames } = useTheme()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      fontSize: '12px',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>Theme:</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {themeNames.map(name => {
          const t = ({ sport: 'Sport', minimal: 'Minimal', dark: 'Dark' })[name]
          return (
            <button
              key={name}
              onClick={() => setTheme(name)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${name === themeName ? 'var(--accent)' : 'var(--border)'}`,
                background: name === themeName ? 'var(--accent)' : 'transparent',
                color: name === themeName ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}
