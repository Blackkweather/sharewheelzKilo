import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Booking } from '@shared/types';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get<{ status: string; data: Booking[] }>(`/bookings${params}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-primary',
      active: 'bg-blue-100 text-blue-700',
      completed: 'badge-success',
      cancelled: 'badge-error',
    };
    return styles[status] || '';
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main">
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-8">My Bookings</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-surface-600 border border-surface-300 hover:border-surface-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-32 animate-pulse" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="card p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-20 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                    {(booking.car as any)?.images?.[0] && (
                      <img
                        src={(booking.car as any).images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900">
                      {(booking.car as any)?.year} {(booking.car as any)?.make} {(booking.car as any)?.model}
                    </h3>
                    <p className="text-sm text-surface-500">
                      {new Date(booking.tripDetails.startDate).toLocaleDateString()} -{' '}
                      {new Date(booking.tripDetails.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-surface-500">
                      £{booking.pricing.total} • {(booking.car as any)?.location?.city}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Link to={`/car/${(booking.car as any)?._id}`} className="link text-sm">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-surface-500 mb-4">No bookings found</p>
            <Link to="/search" className="btn btn-primary">
              Find a car
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}