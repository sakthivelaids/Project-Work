const { validationResult } = require('express-validator');
const pool = require('../config/db');

const getAllCourses = async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ['c.is_published = true'];
    let params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    if (category) {
      conditions.push(`c.category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }
    if (level) {
      conditions.push(`c.level = $${paramCount}`);
      params.push(level);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar,
       COUNT(DISTINCT e.id) as enrollment_count,
       COALESCE(AVG(r.rating), 0) as avg_rating,
       COUNT(DISTINCT r.id) as review_count,
       COUNT(DISTINCT l.id) as lesson_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       LEFT JOIN lessons l ON c.id = l.course_id
       ${whereClause}
       GROUP BY c.id, u.name, u.avatar
       ORDER BY c.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.json({
      courses: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Error fetching courses.' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar, u.bio as instructor_bio,
       COUNT(DISTINCT e.id) as enrollment_count,
       COALESCE(AVG(r.rating), 0) as avg_rating,
       COUNT(DISTINCT r.id) as review_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.id = $1
       GROUP BY c.id, u.name, u.avatar, u.bio`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const lessons = await pool.query(
      'SELECT id, title, duration, order_index FROM lessons WHERE course_id = $1 ORDER BY order_index',
      [id]
    );

    const reviews = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.course_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );

    res.json({
      course: result.rows[0],
      lessons: lessons.rows,
      reviews: reviews.rows
    });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Error fetching course.' });
  }
};

const createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { title, description, category, thumbnail, price = 0, level = 'Beginner', duration } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, category, thumbnail, instructor_id, price, level, duration, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`,
      [title, description, category, thumbnail, req.user.id, price, level, duration]
    );

    res.status(201).json({ message: 'Course created successfully!', course: result.rows[0] });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ message: 'Error creating course.' });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Course not found.' });
    if (existing.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course.' });
    }

    const { title, description, category, thumbnail, price, level, duration, is_published } = req.body;

    const result = await pool.query(
      `UPDATE courses SET title=$1, description=$2, category=$3, thumbnail=$4, price=$5,
       level=$6, duration=$7, is_published=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [title, description, category, thumbnail, price, level, duration, is_published, id]
    );

    res.json({ message: 'Course updated!', course: result.rows[0] });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Error updating course.' });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Course not found.' });
    if (existing.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course.' });
    }

    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Error deleting course.' });
  }
};

const getInstructorCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT e.id) as enrollment_count, COALESCE(AVG(r.rating),0) as avg_rating
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.instructor_id = $1
       GROUP BY c.id ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ courses: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching instructor courses.' });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category, COUNT(*) as count FROM courses WHERE is_published=true AND category IS NOT NULL GROUP BY category ORDER BY count DESC'
    );
    res.json({ categories: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories.' });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getInstructorCourses, getCategories };
