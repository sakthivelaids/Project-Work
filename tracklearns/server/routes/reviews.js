const express = require('express');
const router = express.Router();
const { addReview, getCourseReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, addReview);
router.get('/course/:course_id', getCourseReviews);

module.exports = router;
