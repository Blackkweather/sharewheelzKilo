import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

const buildCarQuery = (filters) => {
  const query = { status: 'approved' };
  
  if (filters.location) {
    query['location.city'] = { $regex: filters.location, $options: 'i' };
  }
  if (filters.make) {
    query.make = { $regex: filters.make, $options: 'i' };
  }
  if (filters.bodyType) {
    query.bodyType = filters.bodyType;
  }
  if (filters.transmission) {
    query.transmission = filters.transmission;
  }
  if (filters.fuelType) {
    query.fuelType = filters.fuelType;
  }
  if (filters.minSeats) {
    query.numberOfSeats = { $gte: parseInt(filters.minSeats) };
  }
  if (filters.maxPrice) {
    query['pricing.dailyRate'] = { $lte: parseInt(filters.maxPrice) };
  }
  if (filters.minPrice) {
    query['pricing.dailyRate'] = { ...query['pricing.dailyRate'], $gte: parseInt(filters.minPrice) };
  }
  if (filters.features) {
    query['features.name'] = { $in: filters.features.split(',') };
  }
  
  return query;
};

router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('location').optional(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = buildCarQuery(req.query);
    
    let dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      
      const conflictingBookings = await Booking.find({
        status: { $in: ['confirmed', 'active'] },
        $or: [
          { 'tripDetails.startDate': { $lt: endDate }, 'tripDetails.endDate': { $gt: startDate } },
        ],
      }).select('car');
      
      const conflictingCarIds = conflictingBookings.map(b => b.car);
      query._id = { $nin: conflictingCarIds };
    }

    const [cars, total] = await Promise.all([
      Car.find(query)
        .populate('owner', 'firstName lastName averageRating totalReviews')
        .sort(req.query.sort === 'price_asc' ? { 'pricing.dailyRate': 1 } : req.query.sort === 'price_desc' ? { 'pricing.dailyRate': -1 } : req.query.sort === 'rating' ? { averageRating: -1 } : { createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Car.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

router.get('/featured', asyncHandler(async (req, res) => {
  const cars = await Car.find({ status: 'approved' })
    .populate('owner', 'firstName lastName averageRating')
    .sort({ averageRating: -1, totalTrips: -1 })
    .limit(6);

  res.json({ status: 'success', data: cars });
}));

router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ status: 'success', data: [] });
  }

  const cars = await Car.find({
    status: 'approved',
    $or: [
      { make: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { 'location.city': { $regex: q, $options: 'i' } },
    ],
  })
    .select('make model year location.city images')
    .limit(10);

  res.json({ status: 'success', data: cars });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id)
    .populate('owner', 'firstName lastName phone averageRating totalReviews totalTrips createdAt');

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  const bookings = await Booking.find({
    car: car._id,
    status: { $in: ['confirmed', 'active'] },
    'tripDetails.startDate': { $gte: new Date() },
  }).select('tripDetails.startDate tripDetails.endDate');

  res.json({
    status: 'success',
    data: car,
    unavailableDates: bookings,
  });
}));

router.post('/',
  protect,
  authorize('owner', 'admin'),
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 1990 }),
  body('bodyType').isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'van', 'pickup', 'other']),
  body('transmission').isIn(['automatic', 'manual', 'semi-automatic']),
  body('fuelType').isIn(['petrol', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'other']),
  body('colour').trim().notEmpty(),
  body('numberOfSeats').isInt({ min: 2, max: 9 }),
  body('numberOfDoors').isInt({ min: 2, max: 5 }),
  body('registration').trim().notEmpty(),
  body('vin').trim().notEmpty(),
  body('mileage').isInt({ min: 0 }),
  body('location.address').trim().notEmpty(),
  body('location.city').trim().notEmpty(),
  body('location.postcode').trim().notEmpty(),
  body('location.coordinates.lat').isFloat(),
  body('location.coordinates.lng').isFloat(),
  body('pricing.dailyRate').isFloat({ min: 0 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const carData = {
      ...req.body,
      owner: req.user._id,
      status: 'pending',
    };

    const car = await Car.create(carData);

    res.status(201).json({
      status: 'success',
      data: car,
    });
  })
);

router.put('/:id',
  protect,
  authorize('owner', 'admin'),
  asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
      throw new AppError('Car not found', 404));
    }

    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to update this car', 403));
    }

    const allowedUpdates = [
      'make', 'model', 'year', 'trim', 'variant', 'bodyType', 'transmission',
      'fuelType', 'colour', 'numberOfSeats', 'numberOfDoors', 'mileage',
      'images', 'features', 'description', 'rules', 'location', 'pricing',
      'instantBook', 'deliveryAvailable', 'deliveryRadius', 'deliveryFee'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.json({
      status: 'success',
      data: car,
    });
  })
);

router.delete('/:id',
  protect,
  authorize('owner', 'admin'),
  asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
      throw new AppError('Car not found', 404));
    }

    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete this car', 403));
    }

    const activeBookings = await Booking.findOne({
      car: car._id,
      status: { $in: ['pending', 'confirmed', 'active'] },
    });

    if (activeBookings) {
      throw new AppError('Cannot delete car with active bookings', 400));
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Car deleted successfully',
    });
  })
);

router.get('/owner/my-cars',
  protect,
  authorize('owner', 'admin'),
  asyncHandler(async (req, res) => {
    const cars = await Car.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: cars,
    });
  })
);

export default router;