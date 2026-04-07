import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Car } from '@shared/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const loadFeaturedCars = async () => {
    try {
      const response = await api.get<{ status: string; data: Car[] }>('/cars/featured');
      setFeaturedCars(response.data);
    } catch (error) {
      console.error('Failed to load featured cars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative bg-surface-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-surface-900" />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-surface-700" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative container-main py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 animate-slide-up">
              Rent a car from
              <span className="block text-primary-400">local owners</span>
            </h1>
            <p className="text-xl text-surface-300 mb-10 animate-slide-up animate-delay-100">
              Premium peer-to-peer car rental in the UK. Save money, drive better cars, and support your community.
            </p>
            
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-hover animate-slide-up animate-delay-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-surface-500 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="City or postcode"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input border-0 focus:ring-0 px-0"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-surface-500 mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input border-0 focus:ring-0 px-0"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-surface-500 mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input border-0 focus:ring-0 px-0"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-surface-500 mb-1">&nbsp;</label>
                  <button type="submit" className="btn btn-primary w-full h-11">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-semibold text-surface-900">
              Featured Cars
            </h2>
            <Link to="/search" className="link">
              View all →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-72 animate-pulse" />
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-surface-500">
              No cars available yet. Be the first to list!
            </div>
          )}
        </div>
      </section>

      <section className="section bg-surface-50">
        <div className="container-main">
          <h2 className="text-2xl font-display font-semibold text-surface-900 mb-8 text-center">
            Why Choose ShareWheelz?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">Fully Insured</h3>
              <p className="text-surface-600 text-sm">
                Every booking is covered by our comprehensive insurance policy. Drive with complete peace of mind.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">Save Up to 40%</h3>
              <p className="text-surface-600 text-sm">
                Peer-to-peer pricing means better deals for you. No middleman markup, no hidden fees.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">Verified Reviews</h3>
              <p className="text-surface-600 text-sm">
                Every review is from a real booking. See honest feedback from real customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-primary-500">
        <div className="container-main text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Got a car? Earn extra income
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            List your car on ShareWheelz and earn up to £1,000/month. We handle insurance, verification, and payments.
          </p>
          <Link to="/owner/add-car" className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50">
            List Your Car
          </Link>
        </div>
      </section>
    </div>
  );
}

function CarCard({ car }: { car: Car }) {
  const primaryImage = car.images?.find(img => img.isPrimary) || car.images?.[0];
  
  return (
    <Link to={`/car/${car._id}`} className="card card-hover group">
      <div className="aspect-[4/3] relative overflow-hidden rounded-t-xl bg-surface-100">
        {primaryImage ? (
          <img 
            src={primaryImage.url} 
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/90 backdrop-blur-sm text-surface-700">
            {car.transmission === 'automatic' ? 'Auto' : 'Manual'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-surface-900">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="text-sm text-surface-500">{car.location.city}</p>
          </div>
          {car.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">{car.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm text-surface-500 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {car.numberOfSeats} seats
          </span>
          <span>•</span>
          <span className="capitalize">{car.fuelType}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-surface-900">£{car.pricing.dailyRate}</span>
            <span className="text-sm text-surface-500">/day</span>
          </div>
          <span className="badge badge-primary">
            {car.instantBook ? 'Instant Book' : 'Request'}
          </span>
        </div>
      </div>
    </Link>
  );
}