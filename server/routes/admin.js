import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOwners,
    totalCars,
    approvedCars,
    pendingCars,
    totalBookings,
    completedBookings,
    totalRevenue,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'owner' }),
    Car.countDocuments(),
    Car.countDocuments({ status: 'approved' }),
    Car.countDocuments({ status: 'pending' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'completed' }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
  ]);

  const recentBookings = await Booking.find()
    .populate('car', 'make model')
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    status: 'success',
    data: {
      users: { total: totalUsers, owners: totalOwners },
      cars: { total: totalCars, approved: approvedCars, pending: pendingCars },
      bookings: { total: totalBookings, completed: completedBookings },
      revenue: totalRevenue[0]?.total || 0,
      recentBookings,
    },
  });
}));

router.get('/users', 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('role').optional().isIn(['user', 'owner', 'admin']),
  query('search').optional(),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: users.map(u => u.toPublicJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

router.put('/users/:id/verify',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ status: 'success', data: user.toPublicJSON() });
  })
);

router.delete('/users/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ status: 'success', message: 'User deleted' });
  })
);

router.get('/cars',
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'suspended']),
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const cars = await Car.find(query)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ status: 'success', data: cars });
  })
);

router.put('/cars/:id/approve',
  asyncHandler(async (req, res) => {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!car) {
      throw new AppError('Car not found', 404);
    }

    res.json({ status: 'success', data: car });
  })
);

router.put('/cars/:id/reject',
  body('reason').trim().notEmpty(),
  asyncHandler(async (req, res) => {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: req.body.reason },
      { new: true }
    );

    if (!car) {
      throw new AppError('Car not found', 404);
    }

    res.json({ status: 'success', data: car });
  })
);

router.get('/bookings',
  query('status').optional(),
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const bookings = await Booking.find(query)
      .populate('car', 'make model registration')
      .populate('user', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ status: 'success', data: bookings });
  })
);

router.get('/analytics', asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyBookings, dailyRevenue, topCars, topOwners] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.total' } } },
      { $sort: { _id: 1 } },
    ]),
    Car.aggregate([
      { $match: { status: 'approved' } },
      { $sort: { totalTrips: -1 } },
      { $limit: 10 },
      { $project: { make: 1, model: 1, totalTrips: 1, averageRating: 1 } },
    ]),
    User.aggregate([
      { $match: { role: 'owner' } },
      { $sort: { totalTrips: -1 } },
      { $limit: 10 },
      { $project: { firstName: 1, lastName: 1, totalTrips: 1 } },
    ]),
  ]);

  res.json({
    status: 'success',
    data: { dailyBookings, dailyRevenue, topCars, topOwners },
  });
}));

export default router;