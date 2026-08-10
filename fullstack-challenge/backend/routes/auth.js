const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register  -> public signup, always creates a Normal User
router.post('/register', async (req, res) => {
  try {
    console.log('POST /api/auth/register - body:', req.body);
    const { name, email, address, password } = req.body;

    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);

    if (errors.length) {
      console.log('Registration validation failed:', errors);
      return res.status(400).json({ message: errors[0], errors });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    console.log('Creating user in DB for email:', email && email.toLowerCase());
    const user = await User.create({ name, email, address, password, role: 'user' });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// POST /api/auth/login -> works for all roles
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// PUT /api/auth/update-password -> any authenticated user
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const error = validatePassword(newPassword);
    if (error) return res.status(400).json({ message: error });

    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update password.', error: err.message });
  }
});

// GET /api/auth/me -> current user profile
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
