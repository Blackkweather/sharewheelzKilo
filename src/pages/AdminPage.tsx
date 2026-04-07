import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface DashboardData {
  users: { total: number; owners: number };
  cars: { total: number; approved: number; pending: number };
  bookings: { total: number; completed: number };
  revenue: number;
  recentBookings: any[];
}

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get<{ status: string; data: DashboardData }>('/admin/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="container-main">
        <h1 className="text-2xl font-display font-bold text-surface-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-surface-900">{data?.users.total || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Cars</p>
            <p className="text-3xl font-bold text-surface-900">{data?.cars.total || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-surface-900">{data?.bookings.total || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-surface-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-surface-900">£{data?.revenue || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Platform Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-surface-600">Approved Cars</span>
                <span className="font-medium">{data?.cars.approved || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Pending Car Approvals</span>
                <span className="font-medium text-yellow-600">{data?.cars.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Total Owners</span>
                <span className="font-medium">{data?.users.owners || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Completed Bookings</span>
                <span className="font-medium">{data?.bookings.completed || 0}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Bookings</h2>
            {data?.recentBookings && data.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {data.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                    <div>
                      <p className="font-medium text-surface-900">
                        {booking.car?.make} {booking.car?.model}
                      </p>
                      <p className="text-sm text-surface-500">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                    </div>
                    <span className={`badge ${
                      booking.status === 'completed' ? 'badge-success' :
                      booking.status === 'confirmed' ? 'badge-primary' :
                      booking.status === 'pending' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No recent bookings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}