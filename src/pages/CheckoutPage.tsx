import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Car, Booking } from '@shared/types';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { carId } = useParams<{ carId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [quote, setQuote] = useState<{ pricing: Booking['pricing'] } | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [carId, startDate, endDate]);

  const loadData = async () => {
    if (!carId || !startDate || !endDate) return;
    
    setIsLoading(true);
    try {
      const [carRes, quoteRes] = await Promise.all([
        api.get<{ status: string; data: Car }>(`/cars/${carId}`),
        api.post<{ status: string; data: { pricing: Booking['pricing'] } }>('/bookings/quote', {
          carId,
          startDate,
          endDate,
        }),
      ]);
      setCar(carRes.data);
      setQuote(quoteRes.data.pricing);
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!carId) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const { clientSecret } = await api.post<{ status: string; data: { clientSecret: string } }>(
        '/payments/create-payment-intent',
        { amount: quote?.pricing.total || 0, bookingId: carId }
      );
      
      const booking = await api.post<{ status: string; data: { _id: string } }>('/bookings', {
        car: carId,
        tripDetails: { startDate, endDate },
        paymentIntentId: clientSecret,
      });
      
      navigate(`/bookings`);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!car || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-surface-900 mb-2">Booking not available</h1>
          <Link to="/search" className="link">Browse cars</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main">
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-8">Complete Your Booking</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-primary-500">
                  1
                </div>
                <h2 className="text-lg font-semibold text-surface-900">Verify Your Account</h2>
              </div>
              
              {user?.isPhoneVerified && user?.drivingLicense?.isVerified ? (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your account is verified
                </div>
              ) : (
                <div className="space-y-4">
                  {!user?.isPhoneVerified && (
                    <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                      <div>
                        <p className="font-medium text-surface-900">Verify phone number</p>
                        <p className="text-sm text-surface-500">Required for booking</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">Verify</button>
                    </div>
                  )}
                  {!user?.drivingLicense?.isVerified && (
                    <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                      <div>
                        <p className="font-medium text-surface-900">Verify driving license</p>
                        <p className="text-sm text-surface-500">Required for booking</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">Upload</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-primary-500">
                  2
                </div>
                <h2 className="text-lg font-semibold text-surface-900">Trip Details</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-surface-500 mb-1">Pick-up</p>
                  <p className="font-medium text-surface-900">{startDate}</p>
                  <p className="text-sm text-surface-500">{car.location.city}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-500 mb-1">Drop-off</p>
                  <p className="font-medium text-surface-900">{endDate}</p>
                  <p className="text-sm text-surface-500">{car.location.city}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-primary-500">
                  3
                </div>
                <h2 className="text-lg font-semibold text-surface-900">Payment</h2>
              </div>
              
              <div className="bg-surface-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-surface-500 mb-2">Card details</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-surface-200 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="text-surface-900">•••• •••• •••• 4242</p>
                </div>
              </div>
              
              <button className="btn btn-ghost btn-sm text-primary-600">
                Add payment method
              </button>
              
              {error && (
                <p className="text-red-600 text-sm mt-4">{error}</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-surface-900 mb-4">Booking Summary</h3>
              
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-surface-200">
                <div className="w-20 h-16 bg-surface-100 rounded-lg overflow-hidden">
                  {car.images?.[0] && (
                    <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-surface-900">
                    {car.year} {car.make} {car.model}
                  </p>
                  <p className="text-sm text-surface-500">{car.location.city}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-surface-600">£{quote.pricing.dailyRate} x {quote.pricing.numberOfDays} days</span>
                  <span>£{quote.pricing.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Service fee</span>
                  <span>£{quote.pricing.serviceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Security deposit (refundable)</span>
                  <span>£{quote.pricing.securityDeposit}</span>
                </div>
                <div className="flex justify-between font-semibold text-surface-900 pt-3 border-t border-surface-200">
                  <span>Total</span>
                  <span>£{quote.pricing.total}</span>
                </div>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={isProcessing || !user?.isPhoneVerified || !user?.drivingLicense?.isVerified}
                className="btn btn-primary w-full"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Pay'}
              </button>
              
              <p className="text-xs text-surface-500 mt-4 text-center">
                By clicking, you agree to our Terms of Service and Cancellation Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}