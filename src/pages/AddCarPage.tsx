import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function AddCarPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    bodyType: 'sedan' as const,
    transmission: 'automatic' as const,
    fuelType: 'petrol' as const,
    colour: '',
    numberOfSeats: 5,
    numberOfDoors: 4,
    registration: '',
    vin: '',
    mileage: 0,
    'location.address': '',
    'location.city': '',
    'location.postcode': '',
    'location.coordinates.lat': 51.5074,
    'location.coordinates.lng': -0.1278,
    'pricing.dailyRate': 50,
    'pricing.securityDeposit': 200,
    description: '',
    instantBook: false,
    deliveryAvailable: false,
    deliveryFee: 15,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        bodyType: formData.bodyType,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        colour: formData.colour,
        numberOfSeats: formData.numberOfSeats,
        numberOfDoors: formData.numberOfDoors,
        registration: formData.registration,
        vin: formData.vin,
        mileage: formData.mileage,
        location: {
          address: formData['location.address'],
          city: formData['location.city'],
          postcode: formData['location.postcode'],
          coordinates: {
            lat: formData['location.coordinates.lat'],
            lng: formData['location.coordinates.lng'],
          },
        },
        pricing: {
          dailyRate: formData['pricing.dailyRate'],
          securityDeposit: formData['pricing.securityDeposit'],
        },
        description: formData.description,
        instantBook: formData.instantBook,
        deliveryAvailable: formData.deliveryAvailable,
        deliveryFee: formData.deliveryFee,
      };
      
      await api.post('/cars', payload);
      navigate('/owner');
    } catch (err) {
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main">
        <div className="max-w-2xl mx-auto">
          <Link to="/owner" className="link text-sm mb-4 inline-block">← Back to dashboard</Link>
          <h1 className="text-2xl font-display font-bold text-surface-900 mb-8">List Your Car</h1>

          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Make *</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => updateField('make', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateField('year', parseInt(e.target.value))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Body Type *</label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => updateField('bodyType', e.target.value)}
                  className="input"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="wagon">Wagon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Colour *</label>
                <input
                  type="text"
                  value={formData.colour}
                  onChange={(e) => updateField('colour', e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Transmission *</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => updateField('transmission', e.target.value)}
                  className="input"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="semi-automatic">Semi-Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Fuel Type *</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => updateField('fuelType', e.target.value)}
                  className="input"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Seats *</label>
                <input
                  type="number"
                  value={formData.numberOfSeats}
                  onChange={(e) => updateField('numberOfSeats', parseInt(e.target.value))}
                  className="input"
                  min={2}
                  max={9}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Registration *</label>
                <input
                  type="text"
                  value={formData.registration}
                  onChange={(e) => updateField('registration', e.target.value.toUpperCase())}
                  className="input"
                  placeholder="AB12 XYZ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Mileage *</label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => updateField('mileage', parseInt(e.target.value))}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">VIN *</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => updateField('vin', e.target.value.toUpperCase())}
                className="input"
                placeholder="17 characters"
                maxLength={17}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData['location.address']}
                  onChange={(e) => updateField('location.address', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData['location.city']}
                  onChange={(e) => updateField('location.city', e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Postcode *</label>
                <input
                  type="text"
                  value={formData['location.postcode']}
                  onChange={(e) => updateField('location.postcode', e.target.value.toUpperCase())}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Daily Rate (£) *</label>
                <input
                  type="number"
                  value={formData['pricing.dailyRate']}
                  onChange={(e) => updateField('pricing.dailyRate', parseInt(e.target.value))}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="input h-24"
                placeholder="Tell renters about your car..."
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.instantBook}
                  onChange={(e) => updateField('instantBook', e.target.checked)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-surface-700">Instant Book</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.deliveryAvailable}
                  onChange={(e) => updateField('deliveryAvailable', e.target.checked)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-surface-700">Delivery Available</span>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
              {isLoading ? 'Creating...' : 'List Car'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}