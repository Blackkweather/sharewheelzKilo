import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-200">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xl font-display font-semibold text-surface-900">ShareWheelz</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-surface-600 hover:text-surface-900 transition-colors">
              Browse Cars
            </Link>
            {isAuthenticated && (
              <Link to="/owner" className="text-surface-600 hover:text-surface-900 transition-colors">
                List Your Car
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-card border border-surface-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-2">
                    <Link to="/dashboard" className="block px-4 py-2 text-surface-700 hover:bg-surface-50">
                      My Dashboard
                    </Link>
                    <Link to="/bookings" className="block px-4 py-2 text-surface-700 hover:bg-surface-50">
                      My Bookings
                    </Link>
                    {user?.role === 'owner' && (
                      <Link to="/owner" className="block px-4 py-2 text-surface-700 hover:bg-surface-50">
                        Owner Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-surface-700 hover:bg-surface-50">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-surface-700 hover:bg-surface-50">
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}