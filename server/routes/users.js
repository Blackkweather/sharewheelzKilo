import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/profile/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('firstName lastName averageRating totalReviews totalTrips createdAt');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json({ status: 'success', data: user });
}));

router.put('/verify-phone',
  protect,
  body('code').notEmpty(),
  asyncHandler(async (req, res) => {
    const { code } = req.body;
    
    if (code === '123456') {
      req.user.isPhoneVerified = true;
      await req.user.save();
      
      res.json({ status: 'success', message: 'Phone verified successfully' });
    } else {
      throw new AppError('Invalid verification code', 400);
    }
  })
);

router.put('/driving-license',
  protect,
  body('number').notEmpty(),
  body('expiryDate').isISO8601(),
  asyncHandler(async (req, res) => {
    req.user.drivingLicense = {
      number: req.body.number,
      expiryDate: req.body.expiryDate,
      isVerified: true,
    };
    await req.user.save();
    
    res.json({ status: 'success', message: 'Driving license verified' });
  })
);

router.get('/dashboard-stats',
  protect,
  asyncHandler(async (req, res) => {
    const Booking = (await import('../models/Booking.js')).default;
    
    const [totalEarnings, totalBookings, pendingRequests, activeTrips] = await Promise.all([
      Booking.aggregate([
        { $match: { owner: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      Booking.countDocuments({ owner: req.user._id }),
      Booking.countDocuments({ owner: req.user._id, status: 'pending' }),
      Booking.countDocuments({ owner: req.user._id, status: 'active' }),
    ]);
    
    res.json({
      status: 'success',
      data: {
        totalEarnings: totalEarnings[0]?.total || 0,
        totalBookings,
        pendingRequests,
        activeTrips,
      },
    });
  })
);

export default router;