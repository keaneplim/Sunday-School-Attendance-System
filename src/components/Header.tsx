import React, { useState } from 'react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';

  interface HeaderProps {
    currentView: string;
    onViewChange: (view: string) => void;
    isAdmin: boolean;
    onAdminLoginClick: () => void; // <-- This line fixes the error
    onLogout: () => void;
  }

  export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, isAdmin, onAdminLoginClick, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    // Define which nav items are visible to whom
    const allNavItems = [
      { id: 'dashboard', label: 'Dashboard', adminOnly: true },
      { id: 'checkin', label: 'Check-in', adminOnly: false },
      { id: 'students', label: 'Students', adminOnly: false },
      { id: 'reports', label: 'Reports', adminOnly: true },
    ];
  
    const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          <div className="flex items-center space-x-4"> {/* Increased spacing for the logo */}

            {/* THIS IS THE NEW LOGO IMAGE */}
            <img src="/logo_RPCC.png" alt="RPCC Logo" className="h-16 w-auto" /> {/* Adjust h-16 as needed */}

            <div>
              <h1 className="font-semibold text-gray-900 text-[clamp(1.125rem,3vw,1.25rem)]">
                 Kids
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Attendance
              </p>
              <p className="text-[10px] text-gray-400 mt-1">v{globalThis.__APP_VERSION__}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isAdmin ? (
              <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <button onClick={onAdminLoginClick} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                <LogIn className="h-4 w-4" />
                <span>Admin Login</span>
              </button>
            )}
          </nav>

          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 font-sans ${currentView === item.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* THIS IS THE MISSING SECTION FOR MOBILE VIEW */}
            {isAdmin ? (
              <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100">
                Logout
              </button>
            ) : (
              <button onClick={() => { onAdminLoginClick(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100">
                Admin Login
              </button>
            )}
          </div>
      </nav>
      )}
    </header>
  );
};