const pool = require('../config/db');

const enrollCourse = async (req, res) => {
  const { course_id } = req.body;
  const user_id = req.user.id;

  try {
    const course = await pool.query('SELECT * FROM courses WHERE id = $1 AND is_published = true', [course_id]);
    if (course.rows.length === 0) return res.status(404).json({ message: 'Course not found.' });

    const existing = await pool.query('SELECT * FROM enrollments WHERE user_id=$1 AND course_id=$2', [user_id, course_id]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Already enrolled in this course.' });

    const result = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
      [user_id, course_id]
    );

    res.status(201).json({ message: 'Enrolled successfully!', enrollment: result.rows[0] });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ message: 'Error enrolling in course.' });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.progress, e.enrolled_at, e.id as enrollment_id,
       u.name as instructor_name,
       COUNT(DISTINCT l.id) as lesson_count
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN lessons l ON c.id = l.course_id
       WHERE e.user_id = $1
       GROUP BY c.id, e.id, u.name
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json({ courses: result.rows });
  } catch (err) {
    console.error('Get enrolled courses error:', err);
    res.status(500).json({ message: 'Error fetching enrolled courses.' });
  }
};

const updateProgress = async (req, res) => {
  const { course_id, progress } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE enrollments SET progress=$1 ${progress === 100 ? ', completed_at=NOW()' : ''}
       WHERE user_id=$2 AND course_id=$3 RETURNING *`,
      [progress, user_id, course_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Enrollment not found.' });
    res.json({ message: 'Progress updated!', enrollment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating progress.' });
  }
};

const getEnrolledStudents = async (req, res) => {
  const { course_id } = req.params;

  try {
    const course = await pool.query('SELECT * FROM courses WHERE id=$1 AND instructor_id=$2', [course_id, req.user.id]);
    if (course.rows.length === 0) return res.status(403).json({ message: 'Not authorized.' });

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, e.progress, e.enrolled_at
       FROM enrollments e JOIN users u ON e.user_id = u.id
       WHERE e.course_id = $1 ORDER BY e.enrolled_at DESC`,
      [course_id]
    );

    res.json({ students: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students.' });
  }
};

module.exports = { enrollCourse, getEnrolledCourses, updateProgress, getEnrolledStudents };
