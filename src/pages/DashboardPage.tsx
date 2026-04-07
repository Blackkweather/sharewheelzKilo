import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Booking } from '@shared/types';

interface DashboardStats {
  totalEarnings: number;
  totalBookings: number;
  pendingRequests: number;
  activeTrips: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, tripsRes] = await Promise.all([
        api.get<{ status: string; data: DashboardStats }>('/users/dashboard-stats'),
        api.get<{ status: string; data: Booking[] }>('/bookings/upcoming'),
      ]);
      setStats(statsRes.data);
      setUpcomingTrips(tripsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-surface-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-surface-500">Manage your trips and account</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Trips</p>
            <p className="text-3xl font-bold text-surface-900">{user?.totalTrips || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-surface-900">
              {user?.averageRating ? user.averageRating.toFixed(1) : 'New'}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Reviews</p>
            <p className="text-3xl font-bold text-surface-900">{user?.totalReviews || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Discount Credits</p>
            <p className="text-3xl font-bold text-surface-900">£{user?.discountCredits || 0}</p>
          </div>
        </div>

        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Upcoming Trips</h2>
            <Link to="/bookings" className="link text-sm">View all</Link>
          </div>
          
          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.slice(0, 3).map((booking) => (
                <div key={booking._id} className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg">
                  <div className="w-16 h-16 bg-surface-200 rounded-lg overflow-hidden">
                    {(booking.car as any)?.images?.[0] && (
                      <img 
                        src={(booking.car as any).images[0].url} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-900">
                      {(booking.car as any)?.year} {(booking.car as any)?.make} {(booking.car as any)?.model}
                    </p>
                    <p className="text-sm text-surface-500">
                      {new Date(booking.tripDetails.startDate).toLocaleDateString()} -{' '}
                      {new Date(booking.tripDetails.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge badge-primary">{booking.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-8">No upcoming trips</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/search" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors">
                <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-surface-700">Find a car</span>
              </Link>
              <Link to="/bookings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors">
                <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-surface-700">My bookings</span>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors">
                <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-surface-700">Profile settings</span>
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Refer a Friend</h2>
            <p className="text-surface-600 text-sm mb-4">
              Share your referral code and earn £10 for each friend who signs up.
            </p>
            <div className="bg-surface-100 p-4 rounded-lg flex items-center justify-between">
              <span className="font-mono font-semibold text-surface-900">{user?.referrerCode}</span>
              <button className="btn btn-secondary btn-sm">Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}