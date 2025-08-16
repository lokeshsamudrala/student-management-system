import React from 'react';
import { User, LogOut } from 'lucide-react';

const Header = ({ user, onLogout, title = "Student Management System" }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-apple-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-apple-900 font-sf leading-tight truncate">
              {title === "Student Management System" ? (
                <>
                  IT Eth, Pol, & Sec
                  <span className="hidden sm:inline sm:ml-2">- Fall 2025</span>
                </>
              ) : (
                title
              )}
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-4 ml-2 sm:ml-4">
              <div className="hidden md:flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-apple-600" />
                <span className="text-sm font-medium text-apple-700 truncate max-w-28 lg:max-w-none">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-apple-700 hover:text-apple-900 transition-colors"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;