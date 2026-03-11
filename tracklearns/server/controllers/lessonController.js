const pool = require('../config/db');

const getLessons = async (req, res) => {
  const { course_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE course_id=$1 ORDER BY order_index ASC',
      [course_id]
    );
    res.json({ lessons: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lessons.' });
  }
};

const addLesson = async (req, res) => {
  const { course_id, title, video_url, content, duration, order_index } = req.body;

  try {
    const course = await pool.query('SELECT * FROM courses WHERE id=$1 AND instructor_id=$2', [course_id, req.user.id]);
    if (course.rows.length === 0) return res.status(403).json({ message: 'Not authorized.' });

    const result = await pool.query(
      'INSERT INTO lessons (course_id, title, video_url, content, duration, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [course_id, title, video_url, content, duration, order_index || 0]
    );

    res.status(201).json({ message: 'Lesson added!', lesson: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error adding lesson.' });
  }
};

const updateLesson = async (req, res) => {
  const { id } = req.params;
  const { title, video_url, content, duration, order_index } = req.body;

  try {
    const lesson = await pool.query(
      'SELECT l.* FROM lessons l JOIN courses c ON l.course_id=c.id WHERE l.id=$1 AND c.instructor_id=$2',
      [id, req.user.id]
    );
    if (lesson.rows.length === 0) return res.status(403).json({ message: 'Not authorized.' });

    const result = await pool.query(
      'UPDATE lessons SET title=$1, video_url=$2, content=$3, duration=$4, order_index=$5 WHERE id=$6 RETURNING *',
      [title, video_url, content, duration, order_index, id]
    );
    res.json({ message: 'Lesson updated!', lesson: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating lesson.' });
  }
};

const deleteLesson = async (req, res) => {
  const { id } = req.params;

  try {
    const lesson = await pool.query(
      'SELECT l.* FROM lessons l JOIN courses c ON l.course_id=c.id WHERE l.id=$1 AND c.instructor_id=$2',
      [id, req.user.id]
    );
    if (lesson.rows.length === 0) return res.status(403).json({ message: 'Not authorized.' });

    await pool.query('DELETE FROM lessons WHERE id=$1', [id]);
    res.json({ message: 'Lesson deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting lesson.' });
  }
};

module.exports = { getLessons, addLesson, updateLesson, deleteLesson };
