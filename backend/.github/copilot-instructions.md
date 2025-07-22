<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Invoice Billing System - Copilot Instructions

This is a Node.js/Express backend project for an Invoice Billing System with the following characteristics:

## Project Structure
- **Framework**: Express.js with MongoDB/Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Architecture**: RESTful API with MVC pattern
- **Validation**: express-validator for input validation
- **Email**: Nodemailer for invoice email functionality

## Key Components
- **Models**: Admin, Client, Invoice with Mongoose schemas
- **Controllers**: authController, clientController, invoiceController
- **Middleware**: JWT authentication middleware
- **Routes**: Organized by feature (auth, clients, invoices)
- **Utils**: Email service and validation helpers

## Code Style Guidelines
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Follow RESTful API conventions
- Include input validation for all endpoints
- Use environment variables for configuration
- Implement proper status codes and response formats

## Security Practices
- Hash passwords with bcrypt before saving
- Validate and sanitize all inputs
- Use JWT tokens for authentication
- Implement rate limiting and security headers
- Never expose sensitive data in responses

## Database Patterns
- Use Mongoose pre-save hooks for calculations
- Implement proper indexing for search performance
- Use populate for related data retrieval
- Handle unique constraints and validation errors

## API Response Format
Consistent JSON responses with:
```javascript
{
  message: "Success/Error message",
  data: {}, // Response data
  errors: [], // Validation errors if any
  pagination: {} // For paginated responses
}
```

## Testing Considerations
- All endpoints should include proper error handling
- Validate authentication on protected routes
- Test edge cases for business logic
- Ensure proper cleanup in delete operations
