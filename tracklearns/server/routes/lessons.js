const express = require('express');
const router = express.Router();
const { getLessons, addLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { addReview, getCourseReviews } = require('../controllers/reviewController');
const { authenticate, isInstructor } = require('../middleware/auth');

// Lessons
router.get('/course/:course_id', getLessons);
router.post('/', authenticate, isInstructor, addLesson);
router.put('/:id', authenticate, isInstructor, updateLesson);
router.delete('/:id', authenticate, isInstructor, deleteLesson);

module.exports = router;
