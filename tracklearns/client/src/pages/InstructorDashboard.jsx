import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, userAPI, enrollAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loading, Modal } from '../components/UI';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [deleteModal, setDeleteModal] = useState(null);
  const [studentsModal, setStudentsModal] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    Promise.all([courseAPI.getInstructorCourses(), userAPI.getDashboardStats()]).then(([c, s]) => {
      setCourses(c.data.courses || []);
      setStats(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await courseAPI.delete(deleteModal);
      setCourses(prev => prev.filter(c => c.id !== deleteModal));
      addToast('Course deleted.', 'success');
      setDeleteModal(null);
    } catch (err) {
      addToast('Failed to delete course.', 'error');
    }
  };

  const handleViewStudents = async (courseId) => {
    try {
      const res = await enrollAPI.getStudents(courseId);
      setStudents(res.data.students || []);
      setStudentsModal(courseId);
    } catch (err) {
      addToast('Failed to load students.', 'error');
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '0 14px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Instructor</div>
          <div className="flex-center gap-8">
            <div className="avatar-sm" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{user?.name?.[0]}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name}</div>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Instructor</span>
            </div>
          </div>
        </div>

        {[
          { icon: '📊', label: 'Overview', tab: 'courses' },
          { icon: '📚', label: 'My Courses', tab: 'courses' },
          { icon: '👥', label: 'Students', tab: 'students' },
        ].map(item => (
          <button key={item.label} className={`sidebar-item ${activeTab === item.tab ? 'active' : ''}`} onClick={() => setActiveTab(item.tab)}>
            <span className="icon">{item.icon}</span>{item.label}
          </button>
        ))}

        <div className="sidebar-section-label">Actions</div>
        <Link to="/courses/add" className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)' }}>
          <span className="icon">➕</span> Add New Course
        </Link>
        <Link to="/profile" className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="icon">👤</span> Profile
        </Link>
      </aside>

      <main className="dashboard-content">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Instructor Dashboard 📊</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage your courses and track your students</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📚', value: stats.totalCourses || 0, label: 'Total Courses', color: 'var(--accent)' },
            { icon: '👥', value: stats.totalStudents || 0, label: 'Total Students', color: 'var(--success)' },
            { icon: '⭐', value: stats.avgRating || '0.0', label: 'Avg Rating', color: 'var(--warning)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
          <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-dim)', border: '1px dashed var(--accent)', cursor: 'pointer' }}>
            <Link to="/courses/add" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>➕</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>New Course</div>
            </Link>
          </div>
        </div>

        {/* Courses Table */}
        <div>
          <div className="flex-between mb-16">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>My Courses</h2>
            <Link to="/courses/add" className="btn btn-primary btn-sm">+ Add Course</Link>
          </div>

          {courses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.map(course => (
                <div key={course.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px', padding: '18px',
                  display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-accent">{course.category}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👥 {course.enrollment_count} students</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--warning)' }}>⭐ {parseFloat(course.avg_rating || 0).toFixed(1)}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewStudents(course.id)}>👥 Students</button>
                    <Link to={`/courses/${course.id}/edit`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(course.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">No courses yet</div>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Create your first course to start teaching</p>
              <Link to="/courses/add" className="btn btn-primary mt-16">Create Your First Course</Link>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Course"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete Course</button>
        </>}>
        <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this course? This action cannot be undone and all enrolled students will lose access.</p>
      </Modal>

      {/* Students Modal */}
      <Modal isOpen={!!studentsModal} onClose={() => setStudentsModal(null)} title={`Enrolled Students (${students.length})`}>
        {students.length > 0 ? students.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="avatar-sm">{s.name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>{s.progress}%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(s.enrolled_at).toLocaleDateString()}</div>
            </div>
          </div>
        )) : <p style={{ color: 'var(--text-muted)' }}>No students enrolled yet.</p>}
      </Modal>
    </div>
  );
}
