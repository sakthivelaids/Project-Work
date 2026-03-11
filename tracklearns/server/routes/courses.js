const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, getInstructorCourses, getCategories
} = require('../controllers/courseController');
const { authenticate, isInstructor } = require('../middleware/auth');

router.get('/', getAllCourses);
router.get('/categories', getCategories);
router.get('/instructor/my-courses', authenticate, isInstructor, getInstructorCourses);
router.get('/:id', getCourseById);

router.post('/', authenticate, isInstructor, [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('category').notEmpty().withMessage('Category is required')
], createCourse);

router.put('/:id', authenticate, isInstructor, updateCourse);
router.delete('/:id', authenticate, isInstructor, deleteCourse);

module.exports = router;
