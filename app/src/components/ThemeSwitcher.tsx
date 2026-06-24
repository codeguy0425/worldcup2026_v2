import { useState } from 'react'
import { useTheme } from '../themes/ThemeProvider'

const labels: Record<string, string> = { sport: 'Sport', minimal: 'Minimal', dark: 'Dark' }

export function ThemeSwitcher() {
  const { themeName, setTheme, themeNames } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', fontSize: '12px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
          letterSpacing: '0.3px', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--surface)', color: 'var(--text-muted)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        🎨 {labels[themeName]}
        <span style={{ fontSize: '8px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 200,
          marginTop: '4px', minWidth: '120px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {themeNames.map(name => (
            <button
              key={name}
              onClick={() => { setTheme(name); setOpen(false) }}
              style={{
                display: 'block', width: '100%', padding: '6px 12px',
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
                letterSpacing: '0.3px', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: name === themeName ? 'var(--accent)' : 'transparent',
                color: name === themeName ? '#fff' : 'var(--text-muted)',
              }}
            >
              {labels[name]}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
    </div>
  )
}
