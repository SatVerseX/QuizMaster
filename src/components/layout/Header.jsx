import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiSun, 
  FiMoon, 
  FiUser, 
  FiLogOut, 
  FiRotateCcw, 
  FiTarget, 
  FiHome,
  FiAward,
  FiMenu,
  FiBookOpen
} from 'react-icons/fi';
import { FaTrophy, FaGraduationCap, FaBrain, FaQuestionCircle, FaPuzzlePiece } from 'react-icons/fa';

const Header = ({ onViewAttempts, onViewHome }) => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [logoHovered, setLogoHovered] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onViewHome && onViewHome()}
              className="group flex items-center relative"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <div className={`mr-2 p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white transform transition-all duration-300 ${logoHovered ? 'scale-110 rotate-3 shadow-lg shadow-orange-500/30 dark:shadow-orange-400/20' : ''}`}>
                <FaPuzzlePiece className={`w-5 h-5 transition-transform duration-500 ${logoHovered ? 'rotate-180' : ''}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent transition-all duration-300 ${logoHovered ? 'tracking-wider' : ''}`}>
                  QuizMaster
                </span>
                <span className={`h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 transition-all duration-500 ${logoHovered ? 'w-full' : 'w-0'}`}></span>
                <span className={`absolute -bottom-3 text-xs text-orange-600 dark:text-orange-400 font-medium transition-all duration-300 ${logoHovered ? 'opacity-100' : 'opacity-0'}`}>
                  Test Your Knowledge
                </span>
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleMenu}
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation & Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Menu */}
            {currentUser && (
              <nav className="flex items-center mr-4">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => onViewHome && onViewHome()}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200"
                    title="Home"
                  >
                    <FiHome className="w-4 h-4" />
                    <span className="text-sm font-medium">Home</span>
                  </button>

                  <button
                    onClick={() => onViewAttempts && onViewAttempts()}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200"
                    title="My Attempts"
                  >
                    <FiTarget className="w-4 h-4" />
                    <span className="text-sm font-medium">My Progress</span>
                  </button>
                </div>
              </nav>
            )}

            {/* User menu */}
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-32 truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border border-red-200 dark:border-red-800 hover:shadow-sm"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && currentUser && (
          <div className="md:hidden animate-fadeIn border-t border-gray-200 dark:border-gray-800 py-3">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onViewHome && onViewHome();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <FiHome className="w-5 h-5" />
                <span className="text-sm font-medium">Home</span>
              </button>

              <button
                onClick={() => {
                  onViewAttempts && onViewAttempts();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <FiTarget className="w-5 h-5" />
                <span className="text-sm font-medium">My Progress</span>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
