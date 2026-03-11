const pool = require('../config/db');

const addReview = async (req, res) => {
  const { course_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    const enrolled = await pool.query('SELECT * FROM enrollments WHERE user_id=$1 AND course_id=$2', [user_id, course_id]);
    if (enrolled.rows.length === 0) return res.status(403).json({ message: 'You must be enrolled to review this course.' });

    const existing = await pool.query('SELECT * FROM reviews WHERE user_id=$1 AND course_id=$2', [user_id, course_id]);
    let result;

    if (existing.rows.length > 0) {
      result = await pool.query(
        'UPDATE reviews SET rating=$1, comment=$2 WHERE user_id=$3 AND course_id=$4 RETURNING *',
        [rating, comment, user_id, course_id]
      );
    } else {
      result = await pool.query(
        'INSERT INTO reviews (user_id, course_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
        [user_id, course_id, rating, comment]
      );
    }

    res.status(201).json({ message: 'Review submitted!', review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review.' });
  }
};

const getCourseReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.course_id = $1 ORDER BY r.created_at DESC`,
      [req.params.course_id]
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
};

module.exports = { addReview, getCourseReviews };
