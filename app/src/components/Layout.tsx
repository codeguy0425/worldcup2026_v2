import { Link } from 'react-router-dom'
import { ThemeSwitcher } from './ThemeSwitcher'

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/teams', label: 'Teams' },
  { to: '/groups', label: 'Groups' },
  { to: '/third-placed', label: '3rd Place' },
  { to: '/scorers', label: 'Scorers' },
  { to: '/bracket', label: 'Bracket' },
  { to: '/stadiums', label: 'Stadiums' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-lg)',
      }}>
        <div className="nav-wrap" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link to="/" className="nav-brand">WC2026</Link>
          <div className="nav-links">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="nav-link">
                {link.label}
              </Link>
            ))}
          </div>
          <ThemeSwitcher />
        </div>
      </nav>

      <main style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: 'var(--space-lg)',
        paddingBottom: '80px',
      }}>
        {children}
      </main>
    </div>
  )
}
