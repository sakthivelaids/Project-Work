import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import { Pagination } from '../components/UI';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [searchInput, setSearchInput] = useState(search);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (level) params.level = level;
      const res = await courseAPI.getAll(params);
      setCourses(res.data.courses || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, level, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    courseAPI.getCategories().then(res => setCategories(res.data.categories || []));
  }, []);

  const setParam = (key, value) => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;
    if (value) params[key] = value;
    else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', searchInput.trim());
  };

  const handlePageChange = (p) => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;
    params.page = String(p);
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div className="container">
          <h1 className="page-title">Explore Courses</h1>
          <p className="page-subtitle">{total > 0 ? `${total} courses available` : 'Find your next learning adventure'}</p>

          <form onSubmit={handleSearch} style={{ maxWidth: '500px', marginTop: '24px' }}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search courses..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </div>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filters */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</span>
            <div className="filters" style={{ display: 'inline-flex' }}>
              <button className={`filter-btn ${!category ? 'active' : ''}`} onClick={() => setParam('category', '')}>All</button>
              {categories.map(c => (
                <button key={c.category} className={`filter-btn ${category === c.category ? 'active' : ''}`} onClick={() => setParam('category', c.category)}>
                  {c.category} <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({c.count})</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</span>
            <div className="filters" style={{ display: 'inline-flex' }}>
              {LEVELS.map(l => (
                <button key={l} className={`filter-btn ${(l === 'All' ? !level : level === l) ? 'active' : ''}`}
                  onClick={() => setParam('level', l === 'All' ? '' : l)}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(search || category || level) && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active filters:</span>
            {search && <span className="badge badge-accent">🔍 "{search}" <button onClick={() => { setSearchInput(''); setParam('search', ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginLeft: '4px' }}>×</button></span>}
            {category && <span className="badge badge-accent">{category} <button onClick={() => setParam('category', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginLeft: '4px' }}>×</button></span>}
            {level && <span className="badge badge-accent">{level} <button onClick={() => setParam('level', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginLeft: '4px' }}>×</button></span>}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-page"><div className="spinner" /><p>Loading courses...</p></div>
        ) : courses.length > 0 ? (
          <>
            <div className="courses-grid">
              {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No courses found</div>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Try adjusting your search or filters</p>
            <button className="btn btn-primary mt-16" onClick={() => { setSearchInput(''); setSearchParams({}); }}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
