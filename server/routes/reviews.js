import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/car/:carId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ car: req.params.carId, type: 'owner_to_renter' })
    .populate('reviewer', 'firstName lastName')
    .sort({ createdAt: -1 });
  
  res.json({ status: 'success', data: reviews });
}));

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate('reviewer', 'firstName lastName')
    .sort({ createdAt: -1 });
  
  res.json({ status: 'success', data: reviews });
}));

router.post('/',
  protect,
  body('booking').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const Booking = (await import('../models/Booking.js')).default;
    const booking = await Booking.findById(req.body.booking);
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    if (booking.user.toString() !== req.user._id.toString() && 
        booking.owner.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized', 403);
    }
    
    if (booking.status !== 'completed') {
      throw new AppError('Can only review completed bookings', 400);
    }
    
    if (booking.review.posted) {
      throw new AppError('Review already posted', 400);
    }
    
    const type = booking.user.toString() === req.user._id.toString() 
      ? 'renter_to_owner' 
      : 'owner_to_renter';
    
    const reviewee = type === 'renter_to_owner' ? booking.owner : booking.user;
    
    const review = await Review.create({
      booking: booking._id,
      reviewer: req.user._id,
      reviewee,
      car: booking.car,
      type,
      rating: req.body.rating,
      categories: req.body.categories,
      comment: req.body.comment,
    });
    
    booking.review = {
      posted: true,
      rating: req.body.rating,
      comment: req.body.comment,
    };
    await booking.save();
    
    await Review.calculateAverageRating(reviewee);
    
    res.status(201).json({ status: 'success', data: review });
  })
);

export default router;