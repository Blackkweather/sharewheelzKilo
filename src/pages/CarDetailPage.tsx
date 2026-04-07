import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Car, Booking } from '@shared/types';
import { useAuth } from '../context/AuthContext';

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quote, setQuote] = useState<{ pricing: Booking['pricing'] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingQuote, setIsGettingQuote] = useState(false);

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    if (!id) return;
    try {
      const response = await api.get<{ status: string; data: Car }>(`/cars/${id}`);
      setCar(response.data);
    } catch (error) {
      console.error('Failed to load car:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!id || !startDate || !endDate) return;
    setIsGettingQuote(true);
    try {
      const response = await api.post<{ status: string; data: { pricing: Booking['pricing'] } }>('/bookings/quote', {
        carId: id,
        startDate,
        endDate,
      });
      setQuote(response.data.pricing);
    } catch (error) {
      console.error('Failed to get quote:', error);
    } finally {
      setIsGettingQuote(false);
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!id || !startDate || !endDate) return;
    navigate(`/checkout/${id}?startDate=${startDate}&endDate=${endDate}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-surface-900 mb-2">Car not found</h1>
          <Link to="/search" className="link">Browse cars</Link>
        </div>
      </div>
    );
  }

  const primaryImage = car.images?.[0];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-4">
          <Link to="/search" className="link text-sm">← Back to search</Link>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              {primaryImage ? (
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-100">
                  <img 
                    src={primaryImage.url} 
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] rounded-xl bg-surface-100 flex items-center justify-center">
                  <svg className="w-24 h-24 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-surface-900">
                    {car.year} {car.make} {car.model}
                    {car.trim && <span className="text-xl text-surface-500"> {car.trim}</span>}
                  </h1>
                  <p className="text-surface-500 mt-1">
                    {car.location.city} • {car.registration}
                  </p>
                </div>
                {car.averageRating > 0 && (
                  <div className="flex items-center gap-2 bg-primary-50 px-3 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{car.averageRating.toFixed(1)}</span>
                    <span className="text-surface-500 text-sm">({car.totalReviews} reviews)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-surface-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {car.numberOfSeats} seats
                </div>
                <div className="flex items-center gap-2 text-surface-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {car.transmission}
                </div>
                <div className="flex items-center gap-2 text-surface-600 capitalize">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {car.fuelType}
                </div>
                <div className="flex items-center gap-2 text-surface-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {car.mileage.toLocaleString()} miles
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-surface-900 mb-4">About this car</h2>
              {car.description ? (
                <p className="text-surface-600 whitespace-pre-wrap">{car.description}</p>
              ) : (
                <p className="text-surface-500">No description provided.</p>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-surface-900 mb-4">Features</h2>
              {car.features && car.features.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-surface-600">
                      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500">No additional features listed.</p>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-surface-900 mb-4">House Rules</h2>
              {car.rules ? (
                <p className="text-surface-600 whitespace-pre-wrap">{car.rules}</p>
              ) : (
                <p className="text-surface-500">No specific rules.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-surface-900 mb-4">Owner</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary-700">
                    {car.owner.firstName?.[0]}{car.owner.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-surface-900">
                    {car.owner.firstName} {car.owner.lastName}
                  </p>
                  <p className="text-surface-500 text-sm">
                    {car.owner.totalTrips || 0} trips • Member since {new Date(car.owner.createdAt || Date.now()).getFullYear()}
                  </p>
                  {car.owner.averageRating > 0 && (
                    <p className="text-surface-500 text-sm">
                      ★ {car.owner.averageRating.toFixed(1)} ({car.owner.totalReviews} reviews)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24">
              <div className="card p-6">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-surface-900">£{car.pricing.dailyRate}</span>
                  <span className="text-surface-500"> /day</span>
                  {car.pricing.weeklyRate && (
                    <span className="text-surface-500 text-sm ml-2">
                      (£{Math.round(car.pricing.weeklyRate / 7)}/day weekly)
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input"
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <button
                    onClick={handleGetQuote}
                    disabled={isGettingQuote}
                    className="btn btn-secondary w-full mb-4"
                  >
                    {isGettingQuote ? 'Calculating...' : 'Get Quote'}
                  </button>
                )}

                {quote && (
                  <div className="bg-surface-50 rounded-lg p-4 mb-4 animate-fade-in">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-surface-600">£{quote.pricing.dailyRate} x {quote.pricing.numberOfDays} days</span>
                      <span>£{quote.pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-surface-600">Service fee</span>
                      <span>£{quote.pricing.serviceFee}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-surface-600">Security deposit (refundable)</span>
                      <span>£{quote.pricing.securityDeposit}</span>
                    </div>
                    <div className="border-t border-surface-200 mt-3 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>£{quote.pricing.total}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!startDate || !endDate}
                  className="btn btn-primary w-full"
                >
                  {car.instantBook ? 'Book Now' : 'Request to Book'}
                </button>

                {car.instantBook && (
                  <p className="text-center text-sm text-surface-500 mt-3">
                    <svg className="w-4 h-4 inline mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Instant Book - confirmed immediately
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-surface-200">
                  <div className="flex items-center gap-2 text-sm text-surface-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Fully insured
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-500 mt-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    £{car.pricing.securityDeposit} security deposit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}