import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-page">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex-between mb-16">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem', padding: '4px 8px' }}>×</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {start > 1 && <><button className="page-btn" onClick={() => onPageChange(1)}>1</button>{start > 2 && <span style={{ color: 'var(--text-muted)' }}>…</span>}</>}
      {pages.map(p => <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>)}
      {end < totalPages && <><span style={{ color: 'var(--text-muted)' }}>…</span><button className="page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
      <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
    </div>
  );
}

export function ProgressBar({ progress, showLabel = false }) {
  return (
    <div>
      {showLabel && (
        <div className="flex-between mb-8" style={{ fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{progress}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function StarRating({ rating, onChange, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5];
  const fontSize = size === 'sm' ? '1rem' : size === 'lg' ? '1.8rem' : '1.3rem';
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {stars.map(s => (
        <span key={s} onClick={() => onChange && onChange(s)}
          style={{ fontSize, cursor: onChange ? 'pointer' : 'default', color: s <= rating ? 'var(--warning)' : 'var(--border)', transition: 'color 0.15s' }}>★</span>
      ))}
    </div>
  );
}

export function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div style={{ fontFamily: 'Syne', fontSize: '1.3rem', fontWeight: 800 }}>⚡ TrackLearns</div>
          <p className="footer-brand-desc">Empowering learners worldwide with high-quality courses. Learn at your own pace, track your progress, achieve your goals.</p>
        </div>
        <div>
          <div className="footer-heading">Platform</div>
          <ul className="footer-links">
            <li><Link to="/courses">Browse Courses</Link></li>
            <li><Link to="/register">Become a Student</Link></li>
            <li><Link to="/register?role=instructor">Become Instructor</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">Support</div>
          <ul className="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">Categories</div>
          <ul className="footer-links">
            <li><Link to="/courses?category=Web Development">Web Dev</Link></li>
            <li><Link to="/courses?category=Data Science">Data Science</Link></li>
            <li><Link to="/courses?category=Design">Design</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 TrackLearns. All rights reserved.</span>
        <span>Built with ❤️ for learners everywhere</span>
      </div>
    </footer>
  );
}
