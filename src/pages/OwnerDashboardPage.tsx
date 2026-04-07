import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Car, Booking } from '@shared/types';

export default function OwnerDashboardPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [carsRes, bookingsRes] = await Promise.all([
        api.get<{ status: string; data: Car[] }>('/cars/owner/my-cars'),
        api.get<{ status: string; data: Booking[] }>('/bookings?role=owner'),
      ]);
      setCars(carsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'active');

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-900">Owner Dashboard</h1>
            <p className="text-surface-500">Manage your cars and bookings</p>
          </div>
          <Link to="/owner/add-car" className="btn btn-primary">
            Add New Car
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Cars</p>
            <p className="text-3xl font-bold text-surface-900">{cars.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingBookings.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Active Trips</p>
            <p className="text-3xl font-bold text-primary-600">{activeBookings.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-surface-900">{bookings.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Your Cars</h2>
            {cars.length > 0 ? (
              <div className="space-y-3">
                {cars.map((car) => (
                  <div key={car._id} className="flex items-center gap-4 p-3 bg-surface-50 rounded-lg">
                    <div className="w-16 h-12 bg-surface-200 rounded-lg overflow-hidden">
                      {car.images?.[0] && (
                        <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-surface-900">
                        {car.year} {car.make} {car.model}
                      </p>
                      <p className="text-sm text-surface-500">£{car.pricing.dailyRate}/day</p>
                    </div>
                    <span className={`badge ${
                      car.status === 'approved' ? 'badge-success' : 
                      car.status === 'pending' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {car.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No cars listed yet</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Booking Requests</h2>
            {bookings.filter(b => b.status === 'pending').length > 0 ? (
              <div className="space-y-3">
                {bookings.filter(b => b.status === 'pending').slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center gap-4 p-3 bg-surface-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-surface-900">
                        {(booking.car as any)?.make} {(booking.car as any)?.model}
                      </p>
                      <p className="text-sm text-surface-500">
                        {new Date(booking.tripDetails.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.tripDetails.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm">Accept</button>
                      <button className="btn btn-secondary btn-sm">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No pending requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}