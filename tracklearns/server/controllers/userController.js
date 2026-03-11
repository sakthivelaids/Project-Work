const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

const updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET name=$1, bio=$2, avatar=$3 WHERE id=$4 RETURNING id, name, email, role, avatar, bio',
      [name, bio, avatar, req.user.id]
    );
    res.json({ message: 'Profile updated!', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === 'instructor') {
      const courses = await pool.query('SELECT COUNT(*) FROM courses WHERE instructor_id=$1', [req.user.id]);
      const students = await pool.query(
        'SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN courses c ON e.course_id=c.id WHERE c.instructor_id=$1',
        [req.user.id]
      );
      const reviews = await pool.query(
        'SELECT COALESCE(AVG(r.rating),0) as avg_rating FROM reviews r JOIN courses c ON r.course_id=c.id WHERE c.instructor_id=$1',
        [req.user.id]
      );
      res.json({
        totalCourses: parseInt(courses.rows[0].count),
        totalStudents: parseInt(students.rows[0].count),
        avgRating: parseFloat(reviews.rows[0].avg_rating).toFixed(1)
      });
    } else {
      const enrolled = await pool.query('SELECT COUNT(*) FROM enrollments WHERE user_id=$1', [req.user.id]);
      const completed = await pool.query('SELECT COUNT(*) FROM enrollments WHERE user_id=$1 AND progress=100', [req.user.id]);
      const avgProgress = await pool.query('SELECT COALESCE(AVG(progress),0) as avg FROM enrollments WHERE user_id=$1', [req.user.id]);
      res.json({
        totalEnrolled: parseInt(enrolled.rows[0].count),
        completedCourses: parseInt(completed.rows[0].count),
        avgProgress: parseFloat(avgProgress.rows[0].avg).toFixed(0)
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getDashboardStats };
