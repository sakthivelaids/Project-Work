const express = require('express');
const router = express.Router();
const { enrollCourse, getEnrolledCourses, updateProgress, getEnrolledStudents } = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, enrollCourse);
router.get('/', authenticate, getEnrolledCourses);
router.put('/progress', authenticate, updateProgress);
router.get('/students/:course_id', authenticate, getEnrolledStudents);

module.exports = router;
