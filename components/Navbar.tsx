'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg sm:text-2xl font-bold text-blue-600"
          >
            💰 ExpenseTracker
          </Link>

          {/* Desktop Menu */}
          {user ? (
            <div className="hidden md:flex items-center gap-6">
              <span className="text-gray-700">
                Welcome, {user.name}
              </span>

              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                Dashboard
              </Link>

              <Link
                href="/expenses"
                className="text-blue-600 hover:text-blue-800"
              >
                Expenses
              </Link>

              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-800"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex gap-4">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 text-2xl"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t py-4">
            {user ? (
              <div className="flex flex-col gap-4">
                <span className="text-gray-700 font-medium">
                  Welcome, {user.name}
                </span>

                <Link
                  href="/dashboard"
                  className="text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  href="/expenses"
                  className="text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Expenses
                </Link>

                <Link
                  href="/profile"
                  className="text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  className="text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};