const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateClient } = require('../utils/validation');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/clients
// @desc    Get all clients with pagination and search
// @access  Private
router.get('/', getClients);

// @route   GET /api/clients/:id
// @desc    Get single client with statistics
// @access  Private
router.get('/:id', getClient);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', validateClient, createClient);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', validateClient, updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client (only if no invoices exist)
// @access  Private
router.delete('/:id', deleteClient);

module.exports = router;
