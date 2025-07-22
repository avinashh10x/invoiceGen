# Invoice Generator Frontend

A modern React frontend for the Invoice Billing System built with Vite, React Router, and Tailwind CSS.

## Features

### 🔐 Authentication
- Admin login and registration
- JWT token-based authentication
- Protected routes
- Automatic token refresh handling

### 📊 Dashboard
- Overview of business metrics
- Total revenue, invoices, and clients
- Recent invoices and clients
- Quick action buttons

### 👥 Client Management
- View all clients with pagination and search
- Add new clients with complete information
- Edit existing client details
- Delete clients (with validation for existing invoices)
- Client profiles with address and contact information

### 📄 Invoice Management
- Create professional invoices
- View invoice details with client information
- Edit existing invoices
- Mark invoices as paid
- Send invoices via email
- Filter invoices by status (pending, paid, overdue)
- Pagination and search functionality

### 💼 Professional Features
- Responsive design for all devices
- Real-time toast notifications
- Loading states and error handling
- Modern UI with Tailwind CSS
- Form validation and user feedback

## Prerequisites

Before running the frontend, make sure you have:

1. **Backend Server Running**: The backend should be running on `http://localhost:5000`
2. **Node.js**: Version 16 or higher
3. **npm**: Latest version

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Usage Guide

### First Time Setup

1. **Start the Backend**: Make sure your backend server is running on port 5000
2. **Start the Frontend**: Run `npm run dev` and navigate to `http://localhost:5173`
3. **Create Admin Account**: Register your first admin account
4. **Add Clients**: Start by adding your clients
5. **Create Invoices**: Generate invoices for your clients

### Daily Workflow

1. **Login**: Use your admin credentials to access the dashboard
2. **View Dashboard**: Check your business metrics and recent activity
3. **Manage Clients**: Add new clients or update existing ones
4. **Create Invoices**: Generate invoices with line items and tax calculations
5. **Track Payments**: Mark invoices as paid when payments are received
6. **Send Invoices**: Email invoices directly to clients

### Key Features Explained

#### Dashboard
- **Revenue Tracking**: See total revenue and pending amounts
- **Invoice Status**: Monitor paid vs pending invoices
- **Client Overview**: Track total number of clients
- **Quick Actions**: Fast access to create clients and invoices

#### Client Management
- **Complete Profiles**: Store full contact information and addresses
- **Search & Filter**: Find clients quickly with search functionality
- **Status Management**: Activate/deactivate clients as needed
- **Data Validation**: Ensure all required information is captured

#### Invoice Management
- **Dynamic Line Items**: Add multiple items with automatic calculations
- **Tax Management**: Configure tax rates for accurate billing
- **Status Tracking**: Monitor invoice status from creation to payment
- **Email Integration**: Send professional invoices via email
- **Professional Layout**: Clean, printable invoice format

## API Integration

The frontend integrates with all backend endpoints:

- **Authentication**: `/api/auth/*`
- **Clients**: `/api/clients/*`
- **Invoices**: `/api/invoices/*`
- **Dashboard Stats**: `/api/invoices/stats/dashboard`

## Environment Variables

Create a `.env` file if you need to customize the API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## File Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main navigation layout
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state management
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Login.jsx       # Authentication
│   ├── Register.jsx    # Admin registration
│   ├── ClientsList.jsx # Client management
│   ├── ClientForm.jsx  # Add/edit clients
│   ├── InvoicesList.jsx# Invoice management
│   ├── InvoiceForm.jsx # Create/edit invoices
│   └── InvoiceDetail.jsx# View invoice details
├── services/           # API integration
│   └── api.js         # Axios configuration and API calls
└── App.jsx            # Main app component
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **React Router 6**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Hot Toast**: Beautiful toast notifications
- **Lucide React**: Modern icon library
- **Date-fns**: Date formatting utilities

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Code Structure
- Components use functional components with hooks
- Context API for global state management
- Custom hooks for reusable logic
- Consistent error handling and loading states

### Styling
- Tailwind CSS for all styling
- Consistent design system
- Responsive utilities
- Dark mode ready (can be easily implemented)

## Troubleshooting

### Common Issues

1. **API Connection Failed**:
   - Ensure backend is running on port 5000
   - Check CORS configuration in backend
   - Verify API endpoints are accessible

2. **Authentication Issues**:
   - Clear localStorage to reset auth state
   - Check token expiration
   - Verify backend JWT configuration

3. **Build Issues**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are properly installed

### Support

For issues or questions:
1. Check the browser console for errors
2. Verify backend API is responding
3. Check network tab for failed requests
4. Ensure all environment variables are set correctly

## Production Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Deploy dist/ folder** to your web server

3. **Configure Environment**:
   - Update API URLs for production
   - Ensure HTTPS for production deployment
   - Configure proper error boundaries

The frontend is now ready to use with your Invoice Generator backend!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
