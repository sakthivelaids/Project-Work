import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProgressBar, Loading } from '../components/UI';

const TABS = ['My Courses', 'In Progress', 'Completed'];

export default function Dashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('My Courses');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([enrollAPI.getEnrolled(), userAPI.getDashboardStats()]).then(([ec, st]) => {
      setEnrolledCourses(ec.data.courses || []);
      setStats(st.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = enrolledCourses.filter(c => {
    if (activeTab === 'In Progress') return c.progress > 0 && c.progress < 100;
    if (activeTab === 'Completed') return c.progress === 100;
    return true;
  });

  if (loading) return <Loading message="Loading your dashboard..." />;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 14px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Student Menu</div>
          <div className="flex-center gap-8">
            <div className="avatar-sm" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Student</div>
            </div>
          </div>
        </div>

        {[
          { icon: '🏠', label: 'Dashboard', tab: null },
          { icon: '📚', label: 'My Courses', tab: 'My Courses' },
          { icon: '▶️', label: 'In Progress', tab: 'In Progress' },
          { icon: '✅', label: 'Completed', tab: 'Completed' },
        ].map(item => (
          <button key={item.label} className={`sidebar-item ${(activeTab === item.tab || (!item.tab && activeTab === 'My Courses' && !item.tab)) ? '' : ''}`}
            onClick={() => { if (item.tab) setActiveTab(item.tab); }}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="sidebar-section-label">Quick Links</div>
        <Link to="/courses" className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="icon">🔍</span> Browse Courses
        </Link>
        <Link to="/profile" className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="icon">👤</span> Profile
        </Link>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📚', value: stats.totalEnrolled || 0, label: 'Enrolled Courses', color: 'var(--accent)' },
            { icon: '✅', value: stats.completedCourses || 0, label: 'Completed', color: 'var(--success)' },
            { icon: '📈', value: `${stats.avgProgress || 0}%`, label: 'Avg Progress', color: 'var(--warning)' },
            { icon: '🔥', value: enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length, label: 'In Progress', color: 'var(--info)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab} {tab !== 'My Courses' && <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>
                ({enrolledCourses.filter(c => tab === 'In Progress' ? c.progress > 0 && c.progress < 100 : c.progress === 100).length})
              </span>}
            </button>
          ))}
        </div>

        {/* Course List */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map(course => (
              <Link key={course.id} to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ width: 80, height: 60, borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                    📚
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>by {course.instructor_name}</div>
                    <ProgressBar progress={course.progress || 0} showLabel />
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {course.progress === 100 ? (
                      <span className="badge badge-success">✓ Completed</span>
                    ) : course.progress > 0 ? (
                      <span className="badge badge-warning">In Progress</span>
                    ) : (
                      <span className="badge badge-accent">Not Started</span>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {new Date(course.enrolled_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">{activeTab === 'My Courses' ? "You haven't enrolled in any courses yet" : `No ${activeTab.toLowerCase()} courses`}</div>
            {activeTab === 'My Courses' && (
              <Link to="/courses" className="btn btn-primary mt-16">Browse Courses</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
