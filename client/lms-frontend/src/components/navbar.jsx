import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, LogOut, User, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { AuthContext } from "../context/authcontext";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/support', label: 'Support' }
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 px-6 py-4 transition-all duration-300 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-4">
          {user && location.pathname !== '/' && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-teal-500 p-2 rounded-lg group-hover:bg-teal-600 transition-colors duration-200">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              phish <span className="text-teal-500">defense.</span>
            </span>
          </Link>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`hover:text-teal-500 transition-colors duration-200 font-medium ${
                location.pathname === link.href
                  ? 'text-teal-500'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {!user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-teal-500/25"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <User size={20} />
                <span className="hidden sm:inline">{user.username}</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Settings</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                location.pathname === link.href
                  ? 'text-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-500 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
