const { validationResult } = require('express-validator');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const { sendInvoiceEmail } = require('../utils/emailService');

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const prefix = process.env.INVOICE_PREFIX || 'INV';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  // Find the latest invoice for the current month
  const latestInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}${year}${month}` }
  }).sort({ invoiceNumber: -1 });

  let sequence = 1;
  if (latestInvoice) {
    const lastSequence = parseInt(latestInvoice.invoiceNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      clientId,
      search,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (search && search.trim().length > 0) {
      try {
        // Search in invoice fields and client fields using aggregation
        const searchFilter = [
          { invoiceNumber: { $regex: search.trim(), $options: 'i' } },
          { notes: { $regex: search.trim(), $options: 'i' } }
        ];

        // Find clients that match the search term
        const matchingClients = await Client.find({
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { company: { $regex: search.trim(), $options: 'i' } },
            { email: { $regex: search.trim(), $options: 'i' } }
          ]
        }).select('_id');

        // Add client IDs to search filter
        if (matchingClients.length > 0) {
          searchFilter.push({ clientId: { $in: matchingClients.map(client => client._id) } });
        }

        filter.$or = searchFilter;
        console.log('Search filter applied:', JSON.stringify(filter.$or, null, 2));
      } catch (searchError) {
        console.error('Search error:', searchError);
        // If search fails, fall back to basic search
        filter.$or = [
          { invoiceNumber: { $regex: search.trim(), $options: 'i' } },
          { notes: { $regex: search.trim(), $options: 'i' } }
        ];
      }
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get invoices with pagination and populate client info
    const invoices = await Invoice.find(filter)
      .populate('clientId', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invoice.countDocuments(filter);

    // Get summary statistics
    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $ne: ['$status', 'paid'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      message: 'Invoices retrieved successfully',
      invoices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || { totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      message: 'Failed to retrieve invoices',
      error: error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'name email company phone address');

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      message: 'Invoice retrieved successfully',
      invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      message: 'Failed to retrieve invoice',
      error: error.message
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      clientId,
      items,
      taxRate = 0,
      dueDate,
      notes,
      currency = 'USD',
      status = 'draft',
      paidDate
    } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals before creating the invoice
    const processedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));

    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Create invoice object
    const invoiceData = {
      invoiceNumber,
      clientId,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      dueDate: new Date(dueDate),
      notes,
      currency,
      status
    };

    // If creating as paid invoice, add paid date
    if (status === 'paid') {
      invoiceData.paidDate = paidDate ? new Date(paidDate) : new Date();
    }

    // Create invoice with calculated values
    const invoice = new Invoice(invoiceData);

    await invoice.save();

    // Populate client info for response
    await invoice.populate('clientId', 'name email company');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      clientId,
      items,
      taxRate,
      dueDate,
      notes,
      currency,
      status
    } = req.body;

    // Find invoice
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    // Check if invoice can be updated
    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: 'Cannot update a paid invoice'
      });
    }

    // Verify client exists if clientId is being changed
    if (clientId && clientId !== invoice.clientId.toString()) {
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }
      invoice.clientId = clientId;
    }

    // Update invoice fields
    if (items) {
      // Calculate totals when items are updated
      const processedItems = items.map(item => ({
        ...item,
        total: item.quantity * item.price
      }));

      const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
      const currentTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;
      const taxAmount = (subtotal * currentTaxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      invoice.items = processedItems;
      invoice.subtotal = Math.round(subtotal * 100) / 100;
      invoice.taxAmount = Math.round(taxAmount * 100) / 100;
      invoice.totalAmount = Math.round(totalAmount * 100) / 100;
    }

    if (taxRate !== undefined) {
      invoice.taxRate = taxRate;
      // Recalculate if tax rate changed but items didn't
      if (!items) {
        const subtotal = invoice.subtotal;
        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        invoice.taxAmount = Math.round(taxAmount * 100) / 100;
        invoice.totalAmount = Math.round(totalAmount * 100) / 100;
      }
    }
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (notes !== undefined) invoice.notes = notes;
    if (currency) invoice.currency = currency;
    if (status) invoice.status = status;

    await invoice.save();

    // Populate client info for response
    await invoice.populate('clientId', 'name email company');

    res.status(200).json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// @desc    Update invoice status
// @route   PATCH /api/invoices/:id/status
// @access  Private
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status, paidDate } = req.body;

    if (!status || !['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: draft, sent, paid, overdue, cancelled'
      });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    // Update invoice status
    invoice.status = status;

    // If marking as paid, set paid date
    if (status === 'paid') {
      invoice.paidDate = paidDate ? new Date(paidDate) : new Date();
    } else if (status !== 'paid' && invoice.paidDate) {
      // If changing from paid to another status, remove paid date
      invoice.paidDate = undefined;
    }

    await invoice.save();

    // Populate client info for response
    await invoice.populate('clientId', 'name email company');

    res.status(200).json({
      message: `Invoice status updated to ${status} successfully`,
      invoice
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({
      message: 'Failed to update invoice status',
      error: error.message
    });
  }
};

// @desc    Mark invoice as paid
// @route   PATCH /api/invoices/:id/mark-paid
// @access  Private
const markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: 'Invoice is already marked as paid'
      });
    }

    // Update invoice status
    invoice.status = 'paid';
    invoice.paidDate = new Date();
    await invoice.save();

    // Populate client info for response
    await invoice.populate('clientId', 'name email company');

    res.status(200).json({
      message: 'Invoice marked as paid successfully',
      invoice
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({
      message: 'Failed to mark invoice as paid',
      error: error.message
    });
  }
};

// @desc    Download invoice as PDF
// @route   GET /api/invoices/:id/download
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'name email company phone address');

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    // Generate PDF content
    const pdfContent = generateInvoicePDF(invoice);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);

    // Send PDF content
    res.send(pdfContent);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      message: 'Failed to download invoice',
      error: error.message
    });
  }
};

// Helper function to generate PDF content (basic implementation)
const generateInvoicePDF = (invoice) => {
  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'RUB': '₽'
    };
    return symbols[currency] || currency;
  };

  const currencySymbol = getCurrencySymbol(invoice.currency);
  const companyName = process.env.COMPANY_NAME || 'Your Company Name';
  const companyAddress = process.env.COMPANY_ADDRESS || 'Your Company Address';
  const companyEmail = process.env.COMPANY_EMAIL || 'contact@yourcompany.com';
  const companyPhone = process.env.COMPANY_PHONE || '+1 (555) 123-4567';

  // This is a basic implementation - for production, consider using libraries like pdfkit or puppeteer
  const content = `
${'='.repeat(80)}
                              ${companyName.toUpperCase()}
                            ${companyAddress}
                         Email: ${companyEmail}
                         Phone: ${companyPhone}
${'='.repeat(80)}

                                   INVOICE

Invoice Number: ${invoice.invoiceNumber}
Invoice Date: ${invoice.createdAt.toDateString()}
Due Date: ${invoice.dueDate.toDateString()}
Status: ${invoice.status.toUpperCase()}
Currency: ${invoice.currency} (${currencySymbol})

BILL TO:
${invoice.clientId.name}
${invoice.clientId.company}
${invoice.clientId.email}
${invoice.clientId.phone || ''}
${invoice.clientId.address ? `
${invoice.clientId.address.street || ''}
${invoice.clientId.address.city || ''}, ${invoice.clientId.address.state || ''} ${invoice.clientId.address.zipCode || ''}
${invoice.clientId.address.country || ''}
` : ''}

ITEMS:
${'='.repeat(80)}
${'DESCRIPTION'.padEnd(35)} ${'QTY'.padEnd(8)} ${'PRICE'.padEnd(15)} ${'TOTAL'.padEnd(15)}
${'='.repeat(80)}
${invoice.items.map(item =>
    `${item.description.padEnd(35)} ${String(item.quantity).padEnd(8)} ${currencySymbol}${item.price.toFixed(2).padEnd(14)} ${currencySymbol}${item.total.toFixed(2)}`
  ).join('\n')}
${'='.repeat(80)}

Subtotal: ${currencySymbol}${invoice.subtotal.toFixed(2)}
Tax (${invoice.taxRate}%): ${currencySymbol}${invoice.taxAmount.toFixed(2)}
TOTAL: ${currencySymbol}${invoice.totalAmount.toFixed(2)}

${invoice.status === 'paid' ? `Paid Date: ${invoice.paidDate ? invoice.paidDate.toDateString() : 'N/A'}` : ''}

${invoice.notes ? `\nNotes:\n${invoice.notes}` : ''}

${'='.repeat(80)}
Thank you for your business!
${'='.repeat(80)}
  `.trim();

  return Buffer.from(content, 'utf8');
};

// @desc    Send invoice via email
// @route   POST /api/invoices/:id/send-email
// @access  Private
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'name email company');

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    // Send email
    const emailSent = await sendInvoiceEmail(invoice);

    if (emailSent) {
      // Update invoice email status
      invoice.emailSent = true;
      invoice.emailSentDate = new Date();
      if (invoice.status === 'draft') {
        invoice.status = 'sent';
      }
      await invoice.save();

      res.status(200).json({
        message: 'Invoice sent successfully',
        invoice
      });
    } else {
      res.status(500).json({
        message: 'Failed to send invoice email'
      });
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({
      message: 'Failed to send invoice',
      error: error.message
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    // Check if invoice can be deleted
    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: 'Cannot delete a paid invoice'
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/invoices/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalClients = await Client.countDocuments({ isActive: true });
    const totalInvoices = await Invoice.countDocuments();

    // Recent invoices
    const recentInvoices = await Invoice.find()
      .populate('clientId', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          paidDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      message: 'Dashboard statistics retrieved successfully',
      stats: {
        invoiceStats: stats,
        totalClients,
        totalInvoices,
        recentInvoices,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};

module.exports = {
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
};
