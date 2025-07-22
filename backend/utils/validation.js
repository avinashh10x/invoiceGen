const { body } = require('express-validator');

// Admin validation rules
const validateAdminRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateAdminUpdate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

// Client validation rules
const validateClient = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Invoice validation rules
const validateInvoiceItem = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item description must be between 1 and 200 characters'),
  body('items.*.quantity')
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage('Quantity must be between 0.01 and 999,999'),
  body('items.*.price')
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be between 0 and 999,999.99')
];

const validateInvoice = [
  body('clientId')
    .isMongoId()
    .withMessage('Please provide a valid client ID'),
  ...validateInvoiceItem,
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('dueDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid due date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'RUB'])
    .withMessage('Currency must be one of: USD, EUR, GBP, CAD, AUD, RUB'),
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Status must be one of: draft, sent, paid, overdue, cancelled')
];

const validateInvoiceUpdate = [
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid client ID'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item is required if items are provided'),
  body('items.*.description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item description must be between 1 and 200 characters'),
  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage('Quantity must be between 0.01 and 999,999'),
  body('items.*.price')
    .optional()
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be between 0 and 999,999.99'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid due date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'RUB'])
    .withMessage('Currency must be one of: USD, EUR, GBP, CAD, AUD, RUB'),
  body('status')
    .optional()
    .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .withMessage('Status must be one of: draft, sent, paid, overdue, cancelled')
];

module.exports = {
  validateAdminRegistration,
  validateAdminLogin,
  validateAdminUpdate,
  validateClient,
  validateInvoice,
  validateInvoiceUpdate
};
