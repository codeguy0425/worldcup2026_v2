import { Link } from 'react-router-dom'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useLang } from '../hooks/LangProvider'

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, toggle } = useLang()

  const navLinks = [
    { to: '/schedule', label: t.nav.schedule },
    { to: '/teams', label: t.nav.teams },
    { to: '/groups', label: t.nav.groups },
    { to: '/third-placed', label: t.nav.thirdPlace },
    { to: '/scorers', label: t.nav.scorers },
    { to: '/bracket', label: t.nav.bracket },
    { to: '/stadiums', label: t.nav.stadiums },
  ]

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-dark)', color: 'var(--text-on-dark)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-lg)',
      }}>
        <div className="nav-wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <a href="/worldcup2026_v2/" className="nav-brand">WC2026</a>
          <div className="nav-links">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="nav-link">
                {link.label}
              </Link>
            ))}
          </div>
          <button onClick={toggle} style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.3px', padding: '4px 8px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-muted)',
            cursor: 'pointer', minWidth: '28px', textAlign: 'center',
          }}>
            {t.lang}
          </button>
          <ThemeSwitcher />
        </div>
      </nav>

      <main style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: 'var(--space-lg) var(--space-lg) var(--space-xl)',
      }}>
        {children}
      </main>
    </>
  )
}
