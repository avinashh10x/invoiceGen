const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-billing');

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'Admin123!', // This will be hashed automatically
      role: 'super_admin'
    });

    await admin.save();
    console.log('✅ Default admin created successfully');
    console.log('📧 Email: admin@example.com');
    console.log('🔐 Password: Admin123!');
    console.log('⚠️  Please change the default password after first login');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
