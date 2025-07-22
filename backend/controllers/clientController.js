const { validationResult } = require('express-validator');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get clients with pagination
    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Client.countDocuments(filter);

    res.status(200).json({
      message: 'Clients retrieved successfully',
      clients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      message: 'Failed to retrieve clients',
      error: error.message
    });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    // Get client's invoice statistics
    const invoiceStats = await Invoice.aggregate([
      { $match: { clientId: client._id } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
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

    const stats = invoiceStats[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    };

    res.status(200).json({
      message: 'Client retrieved successfully',
      client,
      stats
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      message: 'Failed to retrieve client',
      error: error.message
    });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, company, phone, address, notes } = req.body;

    // Check if client with email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(409).json({
        message: 'Client with this email already exists'
      });
    }

    // Create client
    const client = new Client({
      name,
      email,
      company,
      phone,
      address,
      notes
    });

    await client.save();

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      message: 'Failed to create client',
      error: error.message
    });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, company, phone, address, notes, isActive } = req.body;

    // Find client
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    // Check if email is being changed and if it's already in use
    if (email !== client.email) {
      const existingClient = await Client.findOne({
        email,
        _id: { $ne: req.params.id }
      });
      if (existingClient) {
        return res.status(409).json({
          message: 'Email is already in use by another client'
        });
      }
    }

    // Update client
    client.name = name;
    client.email = email;
    client.company = company;
    client.phone = phone;
    client.address = address;
    client.notes = notes;
    if (isActive !== undefined) {
      client.isActive = isActive;
    }

    await client.save();

    res.status(200).json({
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      message: 'Failed to update client',
      error: error.message
    });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    // Check if client has any invoices
    const invoiceCount = await Invoice.countDocuments({ clientId: req.params.id });
    if (invoiceCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete client with existing invoices. Please archive the client instead.',
        invoiceCount
      });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      message: 'Failed to delete client',
      error: error.message
    });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};
