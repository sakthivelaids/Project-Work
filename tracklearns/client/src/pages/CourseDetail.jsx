import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, enrollAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loading, Modal, StarRating } from '../components/UI';

export default function CourseDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    courseAPI.getById(id).then(res => {
      setCourse(res.data.course);
      setLessons(res.data.lessons || []);
      setReviews(res.data.reviews || []);
      setLoading(false);
    }).catch(() => { addToast('Course not found', 'error'); navigate('/courses'); });
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      enrollAPI.getEnrolled().then(res => {
        const ec = res.data.courses || [];
        setEnrolledCourses(ec);
        setEnrolled(ec.some(c => c.id == id));
      }).catch(() => {});
    }
  }, [isAuthenticated, id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate('/login');
    setEnrolling(true);
    try {
      await enrollAPI.enroll(parseInt(id));
      setEnrolled(true);
      addToast('Successfully enrolled! 🎉', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to enroll', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.add({ course_id: parseInt(id), rating: reviewRating, comment: reviewComment });
      addToast('Review submitted!', 'success');
      setReviewModal(false);
      setReviews(prev => [{ ...res.data.review, user_name: user.name }, ...prev.filter(r => r.user_id !== user.id)]);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading message="Loading course..." />;
  if (!course) return null;

  const rating = parseFloat(course.avg_rating || 0).toFixed(1);

  return (
    <div>
      {/* Hero */}
      <div className="course-hero">
        <div className="container">
          <div className="course-hero-grid">
            <div>
              <div className="course-breadcrumb">
                <Link to="/courses">Courses</Link> › <span>{course.category}</span>
              </div>
              <span className="course-category" style={{ marginBottom: '12px', display: 'inline-block' }}>{course.category}</span>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>{course.title}</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '1.02rem', lineHeight: 1.7 }}>{course.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StarRating rating={Math.round(parseFloat(rating))} size="sm" />
                  <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>({course.review_count} reviews)</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>👥 {course.enrollment_count} students</span>
                <span className={`badge badge-${course.level === 'Beginner' ? 'success' : course.level === 'Advanced' ? 'danger' : 'warning'}`}>{course.level}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {course.instructor_avatar ? (
                  <img src={course.instructor_avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="avatar-sm">{course.instructor_name?.[0] || '?'}</div>
                )}
                <div>
                  <div style={{ fontSize: '0.87rem', color: 'var(--text-muted)' }}>Instructor</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{course.instructor_name}</div>
                </div>
              </div>
            </div>

            {/* Enroll Card */}
            <div className="enroll-section">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', borderRadius: '12px', marginBottom: '16px', aspectRatio: '16/9', objectFit: 'cover' }} />
              )}
              <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: course.price > 0 ? 'var(--text-primary)' : 'var(--success)' }}>
                {course.price > 0 ? `$${parseFloat(course.price).toFixed(2)}` : '🆓 Free'}
              </div>

              {enrolled ? (
                <div>
                  <div style={{ background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '12px', color: 'var(--success)', fontWeight: 600 }}>
                    ✓ You are enrolled
                  </div>
                  <Link to="/dashboard" className="btn btn-secondary btn-block">Go to Dashboard</Link>
                </div>
              ) : (
                <button className="btn btn-primary btn-block btn-lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? <><div className="spinner spinner-sm" />Enrolling...</> : 'Enroll Now'}
                </button>
              )}

              <div className="divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                {[
                  ['📖', `${lessons.length} lessons`],
                  ['⏱️', course.duration || 'Self-paced'],
                  ['📶', course.level],
                  ['🔄', 'Lifetime access'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }} className="course-content-grid">
          <div>
            {/* Lessons */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>📚 Course Content</h2>
              {lessons.length > 0 ? (
                <div>
                  {lessons.map((lesson, i) => (
                    <div key={lesson.id} className="lesson-item">
                      <div className="lesson-num">{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{lesson.title}</div>
                        {lesson.duration && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>⏱️ {lesson.duration}</div>}
                      </div>
                      {enrolled ? <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>▶ Watch</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>🔒</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No lessons added yet
                </div>
              )}
            </div>

            {/* Instructor */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>👤 About the Instructor</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div className="profile-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                  {course.instructor_avatar ? <img src={course.instructor_avatar} alt="" /> : course.instructor_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{course.instructor_name}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginTop: '8px', lineHeight: 1.7 }}>{course.instructor_bio || 'Experienced instructor passionate about teaching.'}</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>⭐ Reviews ({reviews.length})</h2>
                {enrolled && <button className="btn btn-secondary btn-sm" onClick={() => setReviewModal(true)}>Write a Review</button>}
              </div>

              {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div className="avatar-sm" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{review.user_name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{review.user_name}</div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {review.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.6 }}>{review.comment}</p>}
                </div>
              )) : (
                <div style={{ padding: '24px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No reviews yet. {enrolled ? 'Be the first to review!' : 'Enroll to leave a review.'}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar (placeholder on larger screens already handled above) */}
          <div />
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setReviewModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmitReview} disabled={submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </>}>
        <div className="form-group mb-16">
          <label className="form-label">Rating</label>
          <StarRating rating={reviewRating} onChange={setReviewRating} size="lg" />
        </div>
        <div className="form-group">
          <label className="form-label">Comment (optional)</label>
          <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={4} style={{ resize: 'vertical' }} />
        </div>
      </Modal>
    </div>
  );
}
