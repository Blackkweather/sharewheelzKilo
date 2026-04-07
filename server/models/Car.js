import mongoose from 'mongoose';

const carImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  isPrimary: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const carFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: String,
  category: {
    type: String,
    enum: ['comfort', 'safety', 'entertainment', 'convenience', 'other'],
    default: 'other',
  },
});

const availabilityRuleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  minAdvanceBookingDays: {
    type: Number,
    default: 0,
  },
  maxAdvanceBookingDays: {
    type: Number,
    default: 90,
  },
});

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  make: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1,
  },
  trim: String,
  variant: String,
  bodyType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'van', 'pickup', 'other'],
    required: true,
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual', 'semi-automatic'],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'other'],
    required: true,
  },
  colour: {
    type: String,
    required: true,
    trim: true,
  },
  numberOfSeats: {
    type: Number,
    required: true,
    min: 2,
    max: 9,
  },
  numberOfDoors: {
    type: Number,
    required: true,
    min: 2,
    max: 5,
  },
  registration: {
    type: String,
    required: true,
    trim: true,
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  mileage: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [carImageSchema],
  features: [carFeatureSchema],
  description: {
    type: String,
    maxlength: 2000,
  },
  rules: {
    type: String,
    maxlength: 1000,
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  pricing: {
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    weeklyRate: {
      type: Number,
      min: 0,
    },
    monthlyRate: {
      type: Number,
      min: 0,
    },
    weekendRate: {
      type: Number,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      default: 200,
    },
    minimumAge: {
      type: Number,
      default: 21,
    },
    pricePerExtraKm: {
      type: Number,
      default: 0.30,
    },
    included Mileage: {
      type: Number,
      default: 150,
    },
  },
  availability: {
    rules: [availabilityRuleSchema],
    blockedDates: [{
      start: Date,
      end: Date,
      reason: String,
    }],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'inactive'],
    default: 'pending',
  },
  rejectionReason: String,
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  totalTrips: {
    type: Number,
    default: 0,
  },
  instantBook: {
    type: Boolean,
    default: false,
  },
  deliveryAvailable: {
    type: Boolean,
    default: false,
  },
  deliveryRadius: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  termsAccepted: {
    type: Boolean,
    default: false,
  },
  insuranceExpiry: Date,
  motExpiry: Date,
  lastServiceDate: Date,
}, {
  timestamps: true,
});

carSchema.index({ owner: 1 });
carSchema.index({ 'location.city': 1 });
carSchema.index({ 'location.postcode': 1 });
carSchema.index({ 'location.coordinates': '2dsphere' });
carSchema.index({ make: 1, model: 1 });
carSchema.index({ bodyType: 1 });
carSchema.index({ transmission: 1 });
carSchema.index({ fuelType: 1 });
carSchema.index({ status: 1 });
carSchema.index({ 'pricing.dailyRate': 1 });
carSchema.index({ year: 1 });
carSchema.index({ numberOfSeats: 1 });
carSchema.index({ averageRating: -1 });

carSchema.virtual('displayName').get(function() {
  return `${this.year} ${this.make} ${this.model}${this.trim ? ' ' + this.trim : ''}`;
});

carSchema.set('toJSON', { virtuals: true });
carSchema.set('toObject', { virtuals: true });

export default mongoose.model('Car', carSchema);