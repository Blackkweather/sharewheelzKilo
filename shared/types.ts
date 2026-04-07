export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'owner' | 'admin';
  avatar?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  drivingLicense?: {
    number: string;
    expiryDate: string;
    isVerified: boolean;
  };
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  averageRating: number;
  totalReviews: number;
  totalTrips: number;
  referrerCode: string;
  discountCredits: number;
  firstRideDiscountUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CarImage {
  url: string;
  publicId?: string;
  isPrimary: boolean;
  order: number;
}

export interface CarFeature {
  name: string;
  icon?: string;
  category: 'comfort' | 'safety' | 'entertainment' | 'convenience' | 'other';
}

export interface CarLocation {
  address: string;
  city: string;
  postcode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CarPricing {
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  weekendRate?: number;
  securityDeposit: number;
  minimumAge: number;
  pricePerExtraKm: number;
  includedMileage: number;
}

export interface Car {
  _id: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    averageRating: number;
    totalReviews: number;
    totalTrips?: number;
  };
  make: string;
  model: string;
  year: number;
  trim?: string;
  variant?: string;
  bodyType: CarBodyType;
  transmission: CarTransmission;
  fuelType: CarFuelType;
  colour: string;
  numberOfSeats: number;
  numberOfDoors: number;
  registration: string;
  vin: string;
  mileage: number;
  images: CarImage[];
  features: CarFeature[];
  description?: string;
  rules?: string;
  location: CarLocation;
  pricing: CarPricing;
  availability?: {
    blockedDates: Array<{ start: string; end: string; reason?: string }>;
  };
  status: CarStatus;
  averageRating: number;
  totalReviews: number;
  totalTrips: number;
  instantBook: boolean;
  deliveryAvailable: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export type CarBodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'van' | 'pickup' | 'other';
export type CarTransmission = 'automatic' | 'manual' | 'semi-automatic';
export type CarFuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid' | 'other';
export type CarStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive';

export interface BookingPricing {
  dailyRate: number;
  numberOfDays: number;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  discount: number;
  discountCode?: string;
  securityDeposit: number;
  total: number;
  currency: string;
}

export interface BookingTripDetails {
  startDate: string;
  endDate: string;
  pickupTime?: string;
  dropoffTime?: string;
  pickupLocation?: {
    address: string;
    city: string;
    postcode: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation?: {
    address: string;
    city: string;
    postcode: string;
  };
  deliveryRequested: boolean;
  deliveryAddress?: string;
}

export interface Booking {
  _id: string;
  user: User | string;
  car: Car | string;
  owner: User | string;
  status: BookingStatus;
  tripDetails: BookingTripDetails;
  pricing: BookingPricing;
  payment: {
    stripePaymentIntentId?: string;
    stripePaymentStatus: PaymentStatus;
    paidAt?: string;
    refundedAt?: string;
    refundAmount?: number;
  };
  verification: {
    drivingLicenseVerified: boolean;
    idVerified: boolean;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  review?: {
    posted: boolean;
    rating?: number;
    comment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected' | 'disputed';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';

export interface Review {
  _id: string;
  booking: string;
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  car?: Car;
  type: 'owner_to_renter' | 'renter_to_owner';
  rating: number;
  categories?: {
    cleanliness?: number;
    accuracy?: number;
    communication?: number;
    value?: number;
    overall?: number;
  };
  comment?: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchFilters {
  location?: string;
  startDate?: string;
  endDate?: string;
  make?: string;
  bodyType?: CarBodyType;
  transmission?: CarTransmission;
  fuelType?: CarFuelType;
  minSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}