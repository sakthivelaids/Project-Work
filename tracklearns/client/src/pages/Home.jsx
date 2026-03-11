import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import { Footer } from '../components/UI';

const FEATURES = [
  { icon: '🎯', title: 'Goal-Oriented Learning', desc: 'Set learning goals and track your progress with detailed analytics and milestone tracking.' },
  { icon: '👩‍🏫', title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience in their fields.' },
  { icon: '📱', title: 'Learn Anywhere', desc: 'Access your courses on any device — desktop, tablet, or mobile — anytime you want.' },
  { icon: '🏆', title: 'Earn Certificates', desc: 'Complete courses and earn certificates to showcase your new skills to employers.' },
  { icon: '💬', title: 'Community Support', desc: 'Join a community of learners, ask questions, and collaborate on projects.' },
  { icon: '🔄', title: 'Lifetime Access', desc: 'Enroll once and get lifetime access to course materials and future updates.' },
];

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Mobile', 'DevOps', 'Business', 'Marketing', 'Photography'];

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    courseAPI.getAll({ limit: 6 }).then(res => {
      setFeaturedCourses(res.data.courses || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/courses?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-tag">🚀 New Courses Added Weekly</div>
          <h1 className="hero-title">
            Learn Skills That<br />
            <span className="gradient-text">Shape Your Future</span>
          </h1>
          <p className="hero-subtitle">
            Join thousands of learners mastering in-demand skills with expert-led courses designed for real-world success.
          </p>

          <form onSubmit={handleSearch} style={{ maxWidth: '520px', margin: '0 auto 32px' }}>
            <div className="search-bar" style={{ borderRadius: '14px' }}>
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="What do you want to learn today?" value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </div>
          </form>

          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg">Explore Courses</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Start Teaching</Link>
          </div>

          <div className="hero-stats">
            {[['10K+', 'Students'], ['500+', 'Courses'], ['50+', 'Instructors'], ['95%', 'Satisfaction']].map(([num, label]) => (
              <div className="hero-stat" key={label}>
                <div className="hero-stat-num">{num}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Browse By Topic</div>
            <h2 className="section-title">Explore Categories</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/courses?category=${encodeURIComponent(cat)}`}
                className="filter-btn" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Top Picks</div>
            <h2 className="section-title">Featured Courses</h2>
            <p className="section-subtitle">Handpicked courses to kickstart your learning journey</p>
          </div>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : featuredCourses.length > 0 ? (
            <>
              <div className="courses-grid">
                {featuredCourses.map(course => <CourseCard key={course.id} course={course} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link to="/courses" className="btn btn-secondary btn-lg">View All Courses →</Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">No courses yet</div>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Be the first to add a course!</p>
              <Link to="/register?role=instructor" className="btn btn-primary mt-16">Start Teaching</Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Why TrackLearns</div>
            <h2 className="section-title">Everything You Need to Succeed</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: '24px', padding: '60px 40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Ready to Start Learning?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>Join thousands of students already learning on TrackLearns. It's free to get started.</p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
