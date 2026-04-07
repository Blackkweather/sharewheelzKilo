import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected', 'disputed'],
    default: 'pending',
  },
  tripDetails: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    pickupTime: String,
    dropoffTime: String,
    pickupLocation: {
      address: String,
      city: String,
      postcode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    dropoffLocation: {
      address: String,
      city: String,
      postcode: String,
    },
    deliveryRequested: {
      type: Boolean,
      default: false,
    },
    deliveryAddress: String,
  },
  pricing: {
    dailyRate: {
      type: Number,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    extraMileageFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountCode: String,
    securityDeposit: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'GBP',
    },
  },
  payment: {
    stripePaymentIntentId: String,
    stripePaymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
  },
  verification: {
    drivingLicenseVerified: {
      type: Boolean,
      default: false,
    },
    idVerified: {
      type: Boolean,
      default: false,
    },
  },
  carCondition: {
    pickup: {
      mileage: Number,
      fuelLevel: String,
      damageNotes: String,
      photos: [String],
    },
    dropoff: {
      mileage: Number,
      fuelLevel: String,
      damageNotes: String,
      photos: [String],
    },
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
  },
  dispute: {
    reason: String,
    resolvedAt: Date,
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  review: {
    posted: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    photos: [String],
    response: {
      comment: String,
      postedAt: Date,
    },
  },
  ownerReview: {
    posted: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
  },
  referralEarnings: {
    type: Number,
    default: 0,
  },
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ 'tripDetails.startDate': 1 });
bookingSchema.index({ 'tripDetails.endDate': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'payment.stripePaymentIntentId': 1 });

bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

bookingSchema.methods.calculateTotal = function() {
  const days = Math.ceil(
    (new Date(this.tripDetails.endDate) - new Date(this.tripDetails.startDate)) / (1000 * 60 * 60 * 24)
  ) || 1;
  
  const subtotal = this.pricing.dailyRate * days;
  const serviceFee = Math.round(subtotal * 0.10);
  const total = subtotal + serviceFee + this.pricing.deliveryFee - this.pricing.discount;
  
  this.pricing.numberOfDays = days;
  this.pricing.subtotal = subtotal;
  this.pricing.serviceFee = serviceFee;
  this.pricing.total = total;
  
  return total;
};

bookingSchema.methods.canTransitionTo = function(newStatus) {
  const validTransitions = {
    pending: ['confirmed', 'rejected', 'cancelled'],
    confirmed: ['active', 'cancelled'],
    active: ['completed', 'disputed'],
    completed: ['disputed'],
    cancelled: [],
    rejected: [],
    disputed: [],
  };
  
  return validTransitions[this.status]?.includes(newStatus);
};

export default mongoose.model('Booking', bookingSchema);