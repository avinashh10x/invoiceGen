# ✅ Invoice Billing System - Setup Checklist

Use this checklist to ensure your Invoice Billing System is properly configured and ready to use.

## 📋 Pre-Setup Checklist

### System Requirements
- [ ] Node.js installed (v14+) - Run: `node --version`
- [ ] MongoDB installed OR MongoDB Atlas account created
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

### Email Service (Optional but Recommended)
- [ ] Gmail account with 2FA enabled
- [ ] App-specific password generated
- [ ] OR other SMTP service credentials ready

## 🔧 Configuration Checklist

### 1. Environment Variables (.env file)
Check that your `.env` file contains:

```env
# Database - Choose ONE option
[ ] MONGODB_URI=mongodb://localhost:27017/invoice-billing  # Local
[ ] MONGODB_URI=mongodb+srv://user:pass@cluster.net/db     # Atlas

# Security (REQUIRED)
[ ] JWT_SECRET=your-long-secret-key-here  # Min 32 characters
[ ] JWT_EXPIRES_IN=7d

# Server
[ ] PORT=5000
[ ] NODE_ENV=development

# Email (Optional - for invoice sending)
[ ] EMAIL_HOST=smtp.gmail.com
[ ] EMAIL_PORT=587
[ ] EMAIL_USER=your-email@gmail.com
[ ] EMAIL_PASS=your-16-char-app-password
[ ] EMAIL_FROM=your-email@gmail.com

# Invoice Settings
[ ] INVOICE_PREFIX=INV
[ ] CURRENCY=USD
```

### 2. Dependencies Installation
- [ ] Run `npm install` successfully
- [ ] No error messages during installation
- [ ] `node_modules` folder created

### 3. Database Setup
- [ ] MongoDB service running (if local)
- [ ] OR MongoDB Atlas cluster accessible
- [ ] Connection string is correct in `.env`

### 4. Admin Account Creation
- [ ] Run `npm run seed:admin` successfully
- [ ] See "✅ Default admin created successfully" message
- [ ] Note: Email is `admin@example.com`, Password is `Admin123!`

## 🚀 Testing Checklist

### 1. Server Startup
- [ ] Run `npm run dev`
- [ ] See "🚀 Server running on port 5000"
- [ ] See "✅ Connected to MongoDB"
- [ ] No error messages in console

### 2. Health Check
- [ ] Server responds to: `http://localhost:5000/health`
- [ ] Returns JSON with status "OK"

### 3. Admin Login Test
**Test endpoint:** `POST http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Expected result:**
- [ ] Status 200
- [ ] Returns admin object
- [ ] Returns JWT token
- [ ] Save the token for next tests

### 4. Protected Route Test
**Test endpoint:** `GET http://localhost:5000/api/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected result:**
- [ ] Status 200
- [ ] Returns admin profile information

### 5. Client Creation Test
**Test endpoint:** `POST http://localhost:5000/api/clients`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Test Client",
  "email": "test@example.com",
  "company": "Test Company"
}
```

**Expected result:**
- [ ] Status 201
- [ ] Returns created client object
- [ ] Client has unique ID

### 6. Invoice Creation Test
**Test endpoint:** `POST http://localhost:5000/api/invoices`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "clientId": "CLIENT_ID_FROM_PREVIOUS_TEST",
  "items": [
    {
      "description": "Test Service",
      "quantity": 1,
      "price": 100.00
    }
  ],
  "dueDate": "2025-08-01"
}
```

**Expected result:**
- [ ] Status 201
- [ ] Returns created invoice object
- [ ] Invoice has auto-generated invoice number
- [ ] Calculations are correct (subtotal, tax, total)

## 📧 Email Testing (Optional)

### 7. Email Configuration Test
If you configured email settings:

**Test endpoint:** `POST http://localhost:5000/api/invoices/INVOICE_ID/send-email`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected result:**
- [ ] Status 200
- [ ] "Invoice sent successfully" message
- [ ] Email received in client's inbox
- [ ] Email contains invoice details

## 🐛 Troubleshooting

### Common Issues & Solutions

**❌ Server won't start**
- [ ] Check if port 5000 is free
- [ ] Verify MongoDB is running
- [ ] Check `.env` file exists and is properly formatted

**❌ Database connection failed**
- [ ] Verify MONGODB_URI in `.env`
- [ ] Check MongoDB service status
- [ ] For Atlas: Check network access and credentials

**❌ JWT errors**
- [ ] Ensure JWT_SECRET is set in `.env`
- [ ] Token format: `Bearer TOKEN` (with space)
- [ ] Check token expiration

**❌ Email not sending**
- [ ] Verify email credentials in `.env`
- [ ] Use app password, not regular Gmail password
- [ ] Check Gmail 2FA is enabled

**❌ Validation errors**
- [ ] Check request body format (JSON)
- [ ] Verify required fields are included
- [ ] Check data types match schema

## 🎯 Success Indicators

Your system is working correctly if:
- [ ] Server starts without errors
- [ ] Database connection is established
- [ ] Admin login works and returns token
- [ ] Protected routes work with token
- [ ] Can create clients and invoices
- [ ] Email sending works (if configured)
- [ ] All calculations are accurate

## 📝 Notes

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `Admin123!`

**⚠️ Important:**
- Change default admin password after first login
- Use strong JWT secret in production
- Keep `.env` file secure and never commit it to version control

## 🎉 Ready to Use!

Once all checkboxes are marked, your Invoice Billing System is ready for use!

**Next Steps:**
1. Change default admin password
2. Create your first real client
3. Generate your first invoice
4. Test the complete workflow

---

**📞 Need Help?**
If any step fails, check the SETUP_GUIDE.md file for detailed troubleshooting steps.
