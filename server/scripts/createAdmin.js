require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Settings = require('../models/Settings');

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/social-media-downloader';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    let user = await User.findOne({ email });
    if (user) {
      console.log(`Admin user (${email}) already exists. Updating password...`);
      user.password = password;
      await user.save();
      console.log('Admin password updated successfully');
    } else {
      user = await User.create({ email, password, role: 'admin' });
      await Settings.create({ userId: user._id });
      console.log(`Admin user successfully created: ${email}`);
    }

    console.log('Default settings confirmed.');
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
