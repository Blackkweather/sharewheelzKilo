import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import { protect, authorize, generateToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

const calculatePricing = (car, startDate, endDate, deliveryRequested = false, deliveryAddress = null) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  
  let dailyRate = car.pricing.dailyRate;
  const dayOfWeek = start.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    dailyRate = car.pricing.weekendRate || car.pricing.dailyRate * 1.2;
  } else if (days >= 7 && car.pricing.weeklyRate) {
    dailyRate = car.pricing.weeklyRate / 7;
  } else if (days >= 30 && car.pricing.monthlyRate) {
    dailyRate = car.pricing.monthlyRate / 30;
  }
  
  const subtotal = dailyRate * days;
  const serviceFee = Math.round(subtotal * 0.10);
  let deliveryFee = 0;
  
  if (deliveryRequested && car.deliveryAvailable) {
    deliveryFee = car.deliveryFee || 15;
  }
  
  return {
    dailyRate: Math.round(dailyRate * 100) / 100,
    numberOfDays: days,
    subtotal: Math.round(subtotal * 100) / 100,
    serviceFee,
    deliveryFee,
    securityDeposit: car.pricing.securityDeposit,
    total: subtotal + serviceFee + deliveryFee,
  };
};

const checkAvailability = async (carId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { 'tripDetails.startDate': { $lt: endDate }, 'tripDetails.endDate': { $gt: startDate } },
    ],
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflict = await Booking.findOne(query);
  return !conflict;
};

router.get('/',
  protect,
  asyncHandler(async (req, res) => {
    const { status, role } = req.query;
    const query = {};
    
    if (role === 'owner') {
      query.owner = req.user._id;
    } else if (role === 'user') {
      query.user = req.user._id;
    } else {
      query.$or = [{ user: req.user._id }, { owner: req.user._id }];
    }
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('car', 'make model year images')
      .populate('user', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ status: 'success', data: bookings });
  })
);

router.get('/upcoming',
  protect,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({
      $or: [
        { user: req.user._id, status: 'confirmed', 'tripDetails.startDate': { $gte: new Date() } },
        { owner: req.user._id, status: 'confirmed', 'tripDetails.startDate': { $gte: new Date() } },
      ],
    })
      .populate('car', 'make model year images location')
      .populate('user', 'firstName lastName phone')
      .populate('owner', 'firstName lastName phone')
      .sort({ 'tripDetails.startDate': 1 })
      .limit(10);
    
    res.json({ status: 'success', data: bookings });
  })
);

router.post('/quote',
  protect,
  body('carId').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('deliveryRequested').optional().isBoolean(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { carId, startDate, endDate, deliveryRequested } = req.body;
    
    const car = await Car.findById(carId);
    if (!car || car.status !== 'approved') {
      throw new AppError('Car not available', 404);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start < new Date()) {
      throw new AppError('Start date must be in the future', 400);
    }
    if (end <= start) {
      throw new AppError('End date must be after start date', 400);
    }
    
    const available = await checkAvailability(carId, startDate, endDate);
    if (!available) {
      throw new AppError('Car is not available for selected dates', 400);
    }
    
    const pricing = calculatePricing(car, startDate, endDate, deliveryRequested);
    
    res.json({
      status: 'success',
      data: {
        pricing,
        car: {
          id: car._id,
          make: car.make,
          model: car.model,
          location: car.location,
        },
      },
    });
  })
);

router.post('/',
  protect,
  body('car').notEmpty(),
  body('tripDetails.startDate').isISO8601(),
  body('tripDetails.endDate').isISO8601(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { car: carId, tripDetails, paymentIntentId } = req.body;
    
    const car = await Car.findById(carId);
    if (!car || car.status !== 'approved') {
      throw new AppError('Car not available', 404);
    }
    
    if (car.owner.toString() === req.user._id.toString()) {
      throw new AppError('You cannot book your own car', 400);
    }
    
    const available = await checkAvailability(carId, tripDetails.startDate, tripDetails.endDate);
    if (!available) {
      throw new AppError('Car is not available for selected dates', 400);
    }
    
    if (!car.instantBook && !car.deliveryAvailable) {
      throw new AppError('This car requires owner approval', 400);
    }
    
    const pricing = calculatePricing(
      car,
      tripDetails.startDate,
      tripDetails.endDate,
      tripDetails.deliveryRequested
    );
    
    let status = 'pending';
    if (car.instantBook && paymentIntentId) {
      status = 'confirmed';
    }
    
    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      owner: car.owner,
      status,
      tripDetails,
      pricing,
      payment: {
        stripePaymentIntentId: paymentIntentId,
        stripePaymentStatus: paymentIntentId ? 'authorized' : 'pending',
      },
    });
    
    await Car.findByIdAndUpdate(carId, {
      $inc: { totalTrips: 1 },
    });
    
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalTrips: 1 },
    });
    
    res.status(201).json({
      status: 'success',
      data: booking,
    });
  })
);

router.get('/:id', protect, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('car')
    .populate('user', 'firstName lastName email phone')
    .populate('owner', 'firstName lastName email phone');
  
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  
  if (booking.user.toString() !== req.user._id.toString() && 
      booking.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }
  
  res.json({ status: 'success', data: booking });
}));

router.put('/:id/confirm',
  protect,
  authorize('owner', 'admin'),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }
    
    if (!booking.canTransitionTo('confirmed')) {
      throw new AppError('Cannot confirm this booking', 400);
    }
    
    booking.status = 'confirmed';
    booking.timeline.push({ status: 'confirmed', timestamp: new Date() });
    await booking.save();
    
    res.json({ status: 'success', data: booking });
  })
);

router.put('/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isUser = booking.user.toString() === req.user._id.toString();
    
    if (!isOwner && !isUser && req.user.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }
    
    if (!booking.canTransitionTo('cancelled')) {
      throw new AppError('Cannot cancel this booking', 400);
    }
    
    const startDate = new Date(booking.tripDetails.startDate);
    const now = new Date();
    const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    
    let refundAmount = 0;
    if (daysUntilStart >= 7) {
      refundAmount = booking.pricing.total;
    } else if (daysUntilStart >= 3) {
      refundAmount = Math.round(booking.pricing.total * 0.5);
    }
    
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      reason: req.body.reason,
      refundAmount,
    };
    booking.timeline.push({ 
      status: 'cancelled', 
      timestamp: new Date(),
      note: req.body.reason,
    });
    await booking.save();
    
    res.json({ status: 'success', data: booking });
  })
);

router.put('/:id/complete',
  protect,
  authorize('owner', 'admin'),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }
    
    if (!booking.canTransitionTo('completed')) {
      throw new AppError('Cannot complete this booking', 400);
    }
    
    booking.status = 'completed';
    booking.timeline.push({ status: 'completed', timestamp: new Date() });
    await booking.save();
    
    await Car.findByIdAndUpdate(booking.car, {
      $inc: { totalTrips: 1 },
    });
    
    res.json({ status: 'success', data: booking });
  })
);

export default router;