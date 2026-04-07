import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user',
  },
  avatar: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  stripeCustomerId: {
    type: String,
  },
  stripeAccountId: {
    type: String,
  },
  drivingLicense: {
    number: String,
    expiryDate: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  address: {
    line1: String,
    line2: String,
    city: String,
    postcode: String,
    country: {
      type: String,
      default: 'UK',
    },
  },
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
  preferredCurrency: {
    type: String,
    default: 'GBP',
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    push: {
      type: Boolean,
      default: true,
    },
  },
  referrerCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  discountCredits: {
    type: Number,
    default: 0,
  },
  firstRideDiscountUsed: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ referrerCode: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.stripeCustomerId;
  delete obj.stripeAccountId;
  return obj;
};

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('User', userSchema);