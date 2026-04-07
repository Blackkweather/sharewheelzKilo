import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const generateReferrerCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, referrerCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let referredBy = null;
    if (referrerCode) {
      referredBy = await User.findOne({ referrerCode });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      referrerCode: generateReferrerCode(),
      referredBy,
      role: 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: user.toPublicJSON(),
    });
  })
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      status: 'success',
      token,
      user: user.toPublicJSON(),
    });
  })
);

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    user: req.user.toPublicJSON(),
  });
}));

router.put('/profile', protect,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  asyncHandler(async (req, res) => {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'avatar'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.json({
      status: 'success',
      user: user.toPublicJSON(),
    });
  })
);

router.put('/password', protect,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      status: 'success',
      token,
      message: 'Password updated successfully',
    });
  })
);

router.post('/logout', (req, res) => {
  res.json({ status: 'success', message: 'Logged out successfully' });
});

export default router;