const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate invoice email HTML
const generateInvoiceEmailHTML = (invoice) => {
  const client = invoice.clientId;
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .invoice-details { margin: 20px 0; }
            .client-info { background: #f8f9fa; padding: 15px; margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background: #f2f2f2; }
            .total-section { background: #f8f9fa; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; }
            .status { 
                display: inline-block; 
                padding: 5px 10px; 
                border-radius: 3px; 
                color: white;
                font-weight: bold;
            }
            .status.paid { background: #27ae60; }
            .status.unpaid { background: #e74c3c; }
            .status.draft { background: #f39c12; }
            .status.sent { background: #3498db; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Invoice ${invoice.invoiceNumber}</h1>
                <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span>
            </div>
            
            <div class="invoice-details">
                <p><strong>Invoice Date:</strong> ${formatDate(invoice.createdAt)}</p>
                <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                ${invoice.paidDate ? `<p><strong>Paid Date:</strong> ${formatDate(invoice.paidDate)}</p>` : ''}
            </div>
            
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${client.name}</strong></p>
                <p>${client.company}</p>
                <p>${client.email}</p>
                ${client.phone ? `<p>${client.phone}</p>` : ''}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
                ${invoice.taxRate > 0 ? `<p><strong>Tax (${invoice.taxRate}%):</strong> ${formatCurrency(invoice.taxAmount)}</p>` : ''}
                <p style="font-size: 1.2em;"><strong>Total Amount: ${formatCurrency(invoice.totalAmount)}</strong></p>
            </div>
            
            ${invoice.notes ? `
                <div style="margin: 20px 0;">
                    <h4>Notes:</h4>
                    <p>${invoice.notes}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>Please contact us if you have any questions about this invoice.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send invoice email
const sendInvoiceEmail = async (invoice) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email configuration not found. Skipping email send.');
      return false;
    }
 
    const transporter = createTransporter();
    const client = invoice.clientId;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: client.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${client.company || 'Your Company'}`,
      html: generateInvoiceEmailHTML(invoice)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Send test email
const sendTestEmail = async (toEmail) => {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration not found');
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Test Email - Invoice Billing System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email from your Invoice Billing System.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Test email error:', error);
    throw error;
  }
};

module.exports = {
  sendInvoiceEmail,
  sendTestEmail
};
