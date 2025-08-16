import React from 'react';
import { User, LogOut } from 'lucide-react';

const Header = ({ user, onLogout, title = "Student Management System" }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-apple-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-apple-900 font-sf">
              {title}
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-apple-600" />
                <span className="text-sm font-medium text-apple-700">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-apple-700 hover:text-apple-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;