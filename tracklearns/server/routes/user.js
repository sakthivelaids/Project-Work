const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getDashboardStats } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.get('/dashboard-stats', authenticate, getDashboardStats);

module.exports = router;
