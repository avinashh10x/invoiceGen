const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateInvoice, validateInvoiceUpdate } = require('../utils/validation');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  markAsPaid,
  sendInvoice,
  downloadInvoice,
  deleteInvoice,
  getDashboardStats
} = require('../controllers/invoiceController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/invoices/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/dashboard', getDashboardStats);

// @route   GET /api/invoices
// @desc    Get all invoices with pagination, filtering, and search
// @access  Private
router.get('/', getInvoices);

// @route   GET /api/invoices/:id
// @desc    Get single invoice with client details
// @access  Private
router.get('/:id', getInvoice);

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private
router.post('/', validateInvoice, createInvoice);

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', validateInvoiceUpdate, updateInvoice);

// @route   PATCH /api/invoices/:id/status
// @desc    Update invoice status
// @access  Private
router.patch('/:id/status', updateInvoiceStatus);

// @route   PATCH /api/invoices/:id/mark-paid
// @desc    Mark invoice as paid
// @access  Private
router.patch('/:id/mark-paid', markAsPaid);

// @route   GET /api/invoices/:id/download
// @desc    Download invoice as PDF
// @access  Private
router.get('/:id/download', downloadInvoice);

// @route   POST /api/invoices/:id/send-email
// @desc    Send invoice via email
// @access  Private
router.post('/:id/send-email', sendInvoice);

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice (only if not paid)
// @access  Private
router.delete('/:id', deleteInvoice);

module.exports = router;
