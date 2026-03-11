import { Link } from 'react-router-dom';

const categoryEmoji = {
  'Web Development': '🌐', 'Data Science': '📊', 'Design': '🎨',
  'Mobile': '📱', 'DevOps': '⚙️', 'Marketing': '📣',
  'Business': '💼', 'Photography': '📷', 'Music': '🎵',
  'Other': '📚',
};

export default function CourseCard({ course }) {
  const emoji = categoryEmoji[course.category] || '📚';
  const rating = parseFloat(course.avg_rating || 0).toFixed(1);
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
      <div className="card course-card">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="course-card-thumb" />
        ) : (
          <div className="course-card-thumb-placeholder">{emoji}</div>
        )}
        <div className="course-card-body">
          <span className="course-category">{course.category || 'General'}</span>
          <h3 className="course-title">{course.title}</h3>
          <p className="course-instructor">by {course.instructor_name || 'Instructor'}</p>

          <div className="course-meta">
            <span className="course-rating">
              <span className="stars" style={{ fontSize: '0.75rem' }}>{stars.slice(0,5)}</span>
              {rating}
            </span>
            <span>({course.review_count || 0})</span>
            <span>•</span>
            <span>👥 {course.enrollment_count || 0}</span>
            {course.lesson_count > 0 && <><span>•</span><span>📖 {course.lesson_count}</span></>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span className={`course-price ${!course.price || course.price == 0 ? 'course-price-free' : ''}`}>
              {!course.price || course.price == 0 ? '🆓 Free' : `$${parseFloat(course.price).toFixed(2)}`}
            </span>
            <span className={`badge badge-${course.level === 'Beginner' ? 'success' : course.level === 'Advanced' ? 'danger' : 'warning'}`}>
              {course.level || 'Beginner'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
