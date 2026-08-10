require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await User.create({
    name: 'System Administrator Account',
    email,
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@1234',
    address: 'Head Office, Platform Administration',
    role: 'admin',
  });

  console.log(`Admin created: ${email} / password: ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
