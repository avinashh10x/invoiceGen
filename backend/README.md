# 🧾 Invoice Billing System Backend

A comprehensive backend system for managing clients and creating/sending invoices with payment tracking and automated billing organization.

## 🚀 Features

- **🔐 JWT Authentication** - Secure admin login with bcrypt password hashing
- **👥 Client Management** - Add, update, and manage client information
- **📦 Invoice Creation** - Create detailed invoices with automatic calculations
- **📤 Email Integration** - Send invoices via email using Nodemailer
- **✅ Payment Tracking** - Mark invoices as paid and track payment status
- **📊 Dashboard Statistics** - View business insights and revenue tracking
- **🔍 Search & Filter** - Advanced filtering for clients and invoices
- **📱 RESTful API** - Well-structured API endpoints with validation

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

## 📁 Project Structure

```
backend/
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── clientController.js
│   └── invoiceController.js
├── middleware/           # Custom middleware
│   └── auth.js
├── models/              # Database schemas
│   ├── Admin.js
│   ├── Client.js
│   └── Invoice.js
├── routes/              # API routes
│   ├── auth.js
│   ├── clients.js
│   └── invoices.js
├── scripts/             # Utility scripts
│   └── seedAdmin.js
├── utils/               # Helper functions
│   ├── emailService.js
│   └── validation.js
├── .env                 # Environment variables
├── server.js            # Main application file
└── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone & Install
```bash
# Navigate to the project directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration
Update the `.env` file with your settings:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/invoice-billing

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Invoice Configuration
INVOICE_PREFIX=INV
CURRENCY=USD
```

### 3. Database Setup
```bash
# Create default admin account
npm run seed:admin
```

This creates an admin with:
- **Email:** admin@example.com
- **Password:** Admin123!

⚠️ **Important:** Change the default password after first login!

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile
- `PUT /api/auth/profile` - Update admin profile

### Client Management
- `GET /api/clients` - Get all clients (with pagination/search)
- `GET /api/clients/:id` - Get single client with stats
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Invoice Management
- `GET /api/invoices` - Get all invoices (with filtering)
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/mark-paid` - Mark as paid
- `POST /api/invoices/:id/send-email` - Send invoice via email
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/stats/dashboard` - Get dashboard statistics

### Health Check
- `GET /health` - API health status

## 📧 Email Configuration

To enable email functionality:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an app password
   - Use app password in `EMAIL_PASS`

2. **Other SMTP Providers:**
   - Update `EMAIL_HOST` and `EMAIL_PORT`
   - Provide credentials in `EMAIL_USER` and `EMAIL_PASS`

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Data Models

### Admin
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Client
```javascript
{
  name: String,
  email: String (unique),
  company: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: Boolean,
  notes: String
}
```

### Invoice
```javascript
{
  invoiceNumber: String (auto-generated),
  clientId: ObjectId,
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: Number,
  taxRate: Number,
  taxAmount: Number,
  totalAmount: Number,
  status: String, // draft, sent, paid, overdue, cancelled
  dueDate: Date,
  paidDate: Date,
  notes: String,
  currency: String,
  emailSent: Boolean,
  emailSentDate: Date
}
```

## 🚦 Example Usage

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

### 2. Create Client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Doe Enterprises"
  }'
```

### 3. Create Invoice
```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "clientId": "CLIENT_ID",
    "items": [
      {
        "description": "Web Development",
        "quantity": 10,
        "price": 100
      }
    ],
    "dueDate": "2024-02-01",
    "taxRate": 10
  }'
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation and sanitization
- CORS protection
- Error handling middleware

## 📊 Business Features

- **Automatic Calculations** - Subtotal, tax, and total amounts
- **Invoice Numbering** - Auto-generated unique invoice numbers
- **Payment Tracking** - Mark invoices as paid with timestamps
- **Client Statistics** - Track total invoices and amounts per client
- **Dashboard Analytics** - Revenue tracking and business insights
- **Email Notifications** - Send professional invoice emails

## 🔄 Development

### Available Scripts
- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server
- `npm run seed:admin` - Create default admin account

### Environment Modes
- **Development:** Detailed error messages
- **Production:** Minimal error exposure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation above
- Review error messages in the response
- Ensure all required environment variables are set
- Verify MongoDB connection

---

**Made with ❤️ for efficient invoice management**
