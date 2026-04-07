import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-400">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-xl font-display font-semibold text-white">ShareWheelz</span>
            </Link>
            <p className="text-sm">
              Premium peer-to-peer car rental in the UK. Rent from local owners or list your vehicle.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-sm hover:text-white transition-colors">Browse Cars</Link></li>
              <li><Link to="/search?bodyType=suv" className="text-sm hover:text-white transition-colors">SUVs</Link></li>
              <li><Link to="/search?bodyType=sedan" className="text-sm hover:text-white transition-colors">Sedans</Link></li>
              <li><Link to="/search?transmission=automatic" className="text-sm hover:text-white transition-colors">Automatic</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">For Owners</h4>
            <ul className="space-y-2">
              <li><Link to="/owner/add-car" className="text-sm hover:text-white transition-colors">List Your Car</Link></li>
              <li><Link to="/owner" className="text-sm hover:text-white transition-colors">Owner Dashboard</Link></li>
              <li><Link to="/owner" className="text-sm hover:text-white transition-colors">Insurance</Link></li>
              <li><Link to="/owner" className="text-sm hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-surface-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 ShareWheelz. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}