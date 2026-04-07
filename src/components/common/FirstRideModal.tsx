import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface FirstRideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FirstRideModal({ isOpen, onClose }: FirstRideModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && user?.firstRideDiscountUsed) {
      onClose();
    }
  }, [isAuthenticated, user, onClose]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-hover max-w-md w-full p-8 animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-surface-400 hover:text-surface-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          
          <h2 className="text-2xl font-display font-semibold text-surface-900 mb-2">
            Get 10% Off Your First Ride!
          </h2>
          
          <p className="text-surface-600 mb-6">
            Sign up now and save on your first car rental. It's our way of welcoming you to ShareWheelz.
          </p>
          
          {isSubmitted ? (
            <div className="bg-green-50 text-green-700 rounded-lg py-3 px-4">
              Awesome! Your discount code: WELCOME10
            </div>
          ) : isAuthenticated ? (
            <div className="bg-primary-50 text-primary-700 rounded-lg py-3 px-4">
              You already have an account! Discount applied.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <Link 
                to="/register"
                onClick={onClose}
                className="btn btn-primary w-full"
              >
                Sign Up & Get Discount
              </Link>
            </form>
          )}
          
          <button 
            onClick={onClose}
            className="mt-4 text-sm text-surface-500 hover:text-surface-700"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}