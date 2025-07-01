import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Linguabot</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.username || user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;