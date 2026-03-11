import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">⚡ TrackLearns</Link>

          <ul className="navbar-links">
            <li><NavLink to="/courses">Courses</NavLink></li>
            {isAuthenticated && user?.role === 'student' && <li><NavLink to="/dashboard">Dashboard</NavLink></li>}
            {isAuthenticated && user?.role === 'instructor' && <li><NavLink to="/instructor">Instructor</NavLink></li>}
          </ul>

          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <div className="avatar-sm" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user?.avatar ? <img src={user.avatar} alt={user.name} /> : getInitials(user?.name)}
                </div>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '44px', right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '8px', minWidth: '180px',
                    boxShadow: 'var(--shadow-md)', zIndex: 200
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span className={`badge badge-${user?.role === 'instructor' ? 'warning' : 'accent'}`}>{user?.role}</span>
                      </div>
                    </div>
                    {[
                      { label: '👤 Profile', to: '/profile' },
                      { label: user?.role === 'instructor' ? '📊 Dashboard' : '🎓 My Learning', to: user?.role === 'instructor' ? '/instructor' : '/dashboard' },
                    ].map(item => (
                      <Link key={item.to} to={item.to}
                        style={{ display: 'block', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                        onClick={() => setDropdownOpen(false)}
                        onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >{item.label}</Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                      <button onClick={handleLogout}
                        style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.target.style.background = 'var(--danger-dim)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >🚪 Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}

            <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <Link to="/courses" onClick={() => setMobileOpen(false)}>📚 Courses</Link>
        {isAuthenticated && user?.role === 'student' && <Link to="/dashboard" onClick={() => setMobileOpen(false)}>🎓 Dashboard</Link>}
        {isAuthenticated && user?.role === 'instructor' && <Link to="/instructor" onClick={() => setMobileOpen(false)}>📊 Instructor</Link>}
        {isAuthenticated && <Link to="/profile" onClick={() => setMobileOpen(false)}>👤 Profile</Link>}
        {!isAuthenticated && <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>}
        {!isAuthenticated && <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>}
        {isAuthenticated && <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ background: 'none', border: 'none', padding: '10px 14px', borderRadius: '10px', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem' }}>🚪 Sign Out</button>}
      </div>
    </>
  );
}
