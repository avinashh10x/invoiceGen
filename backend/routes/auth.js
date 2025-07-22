const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  validateAdminRegistration,
  validateAdminLogin,
  validateAdminUpdate
} = require('../utils/validation');
const {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new admin
// @access  Public (should be protected in production)
router.post('/register', validateAdminRegistration, registerAdmin);

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', validateAdminLogin, loginAdmin);

// @route   GET /api/auth/profile
// @desc    Get admin profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update admin profile
// @access  Private
router.put('/profile', authenticateToken, validateAdminUpdate, updateProfile);

module.exports = router;
