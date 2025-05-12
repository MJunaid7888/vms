'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  BarChart2,
  Home,
  UserPlus
} from 'lucide-react';

interface AppBarProps {
  showAuthButtons?: boolean;
}

export default function AppBar({ showAuthButtons = true }: AppBarProps) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-800">
                QuickPass
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-700 text-blue-700' 
                    : 'border-transparent text-gray-700 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              
              <Link 
                href="/check-in" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/check-in') 
                    ? 'border-blue-700 text-blue-700' 
                    : 'border-transparent text-gray-700 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                <UserPlus className="mr-1 h-4 w-4" />
                New Visitor
              </Link>
              
              <Link 
                href="/beenherebefore" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/beenherebefore') 
                    ? 'border-blue-700 text-blue-700' 
                    : 'border-transparent text-gray-700 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                <User className="mr-1 h-4 w-4" />
                Return Visitor
              </Link>
            </div>
          </div>
          
          {/* Secondary navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <span>English</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {languageOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">English</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Français</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Español</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Deutsch</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Italiano</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">中文</button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Auth buttons */}
            {showAuthButtons && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{user.firstName || 'User'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {userMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Link 
                            href="/admin/dashboard" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <Home className="mr-2 h-4 w-4" />
                              Dashboard
                            </div>
                          </Link>
                          <Link 
                            href="/admin/analytics" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <BarChart2 className="mr-2 h-4 w-4" />
                              Analytics
                            </div>
                          </Link>
                          <Link 
                            href="/profile" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              Profile
                            </div>
                          </Link>
                          <Link 
                            href="/settings" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </div>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <div className="flex items-center">
                              <LogOut className="mr-2 h-4 w-4" />
                              Logout
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/login" 
                      className="text-blue-700 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none"
            >
              {menuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-blue-700 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/check-in"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/check-in') 
                  ? 'border-blue-700 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              New Visitor
            </Link>
            <Link
              href="/beenherebefore"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/beenherebefore') 
                  ? 'border-blue-700 text-blue-700 bg-blue-50' 
                  : 'border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Return Visitor
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-800" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-900 text-white hover:bg-blue-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            <div className="mt-3 px-2 space-y-1 border-t border-gray-200 pt-3">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex justify-between w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                <span>Language: English</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {languageOpen && (
                <div className="pl-3 space-y-1">
                  <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">English</button>
                  <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Français</button>
                  <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Español</button>
                  <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Deutsch</button>
                  <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Italiano</button>
                  <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">中文</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
