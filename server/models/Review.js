import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
  },
  type: {
    type: String,
    enum: ['owner_to_renter', 'renter_to_owner'],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  categories: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
    },
    overall: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: String,
    maxlength: 1000,
  },
  photos: [String],
  isAdminReviewed: {
    type: Boolean,
    default: false,
  },
  flaggedForRemoval: {
    type: Boolean,
    default: false,
  },
  removalReason: String,
}, {
  timestamps: true,
});

reviewSchema.index({ booking: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ car: 1 });
reviewSchema.index({ type: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

reviewSchema.statics.calculateAverageRating = async function(revieweeId) {
  const result = await this.aggregate([
    { $match: { reviewee: revieweeId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);
  
  if (result.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(revieweeId, {
      averageRating: result[0].avgRating,
      totalReviews: result[0].totalReviews,
    });
  }
  
  return result[0] || { avgRating: 0, totalReviews: 0 };
};

export default mongoose.model('Review', reviewSchema);