import { Link, useLocation } from 'react-router-dom';
import { Car, ShieldAlert, Settings } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-park-bg flex flex-col">
      <header className="bg-park-navy text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-8 h-8 text-park-yellow" />
            <div>
              <h1 className="text-xl font-bold tracking-wider">PARKORA</h1>
              <p className="text-xs text-gray-300">Smart Parking Management</p>
            </div>
          </div>
          <nav className="flex space-x-4">
            <Link 
              to="/security" 
              className={`flex items-center space-x-2 px-4 py-2 rounded ${location.pathname === '/security' ? 'bg-park-blue text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Security</span>
            </Link>
            <Link 
              to="/admin" 
              className={`flex items-center space-x-2 px-4 py-2 rounded ${location.pathname === '/admin' ? 'bg-park-blue text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} PARKORA. College Mini Project.
      </footer>
    </div>
  );
}
