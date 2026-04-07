import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Car, SearchFilters, CarBodyType, CarTransmission, CarFuelType } from '@shared/types';

const BODY_TYPES: { value: CarBodyType; label: string }[] = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'wagon', label: 'Wagon' },
];

const TRANSMISSIONS: { value: CarTransmission; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'semi-automatic', label: 'Semi-Auto' },
];

const FUEL_TYPES: { value: CarFuelType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function CarSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    bodyType: searchParams.get('bodyType') as CarBodyType,
    transmission: searchParams.get('transmission') as CarTransmission,
    fuelType: searchParams.get('fuelType') as CarFuelType,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    sort: (searchParams.get('sort') as SearchFilters['sort']) || 'newest',
  });

  useEffect(() => {
    loadCars();
  }, [searchParams]);

  const loadCars = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const response = await api.get<{ status: string; data: Car[]; pagination: typeof pagination }>(
        `/cars?${params.toString()}`
      );
      setCars(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load cars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-4">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="input"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
              className="input"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
              className="input"
            />
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value as SearchFilters['sort'] })}
              className="input"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              Filters
            </button>
          </form>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-surface-200 animate-fade-in">
          <div className="container-main py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Body Type</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateFilters({ bodyType: filters.bodyType === type.value ? undefined : type.value })}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        filters.bodyType === type.value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Transmission</label>
                <div className="flex flex-wrap gap-2">
                  {TRANSMISSIONS.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateFilters({ transmission: filters.transmission === type.value ? undefined : type.value })}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        filters.transmission === type.value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {FUEL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateFilters({ fuelType: filters.fuelType === type.value ? undefined : type.value })}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        filters.fuelType === type.value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilters({ minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="input w-20"
                  />
                  <span className="text-surface-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="input w-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-main py-8">
        <div className="mb-4">
          <p className="text-surface-600">
            {pagination.total} cars available
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-72 animate-pulse" />
            ))}
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No cars found</h3>
            <p className="text-surface-500 mb-6">Try adjusting your filters or search in a different location.</p>
            <button onClick={() => setSearchParams(new URLSearchParams())} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateFilters({ location: String(page) })}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  pagination.page === page
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-surface-600 border border-surface-300 hover:border-surface-400'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
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