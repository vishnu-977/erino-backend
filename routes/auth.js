const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.COOKIE_SECURE === 'true'
    };

    res
      .status(201)
      .cookie('token', token, cookieOptions)
      .json({ id: user._id, name: user.name, email: user.email });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.COOKIE_SECURE === 'true'
    };

    res
      .status(200)
      .cookie('token', token, cookieOptions)
      .json({ id: user._id, name: user.name, email: user.email });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
