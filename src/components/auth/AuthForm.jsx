import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaPuzzlePiece } from 'react-icons/fa';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateForm, setAnimateForm] = useState(false);

  const { login, signup, signInWithGoogle } = useAuth();

  // Animation effect on mount and form toggle
  useEffect(() => {
    setAnimateForm(true);
    const timer = setTimeout(() => setAnimateForm(false), 500);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await signup(formData.email, formData.password, formData.displayName);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (error) {
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign in was cancelled';
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-teal-300/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-tr from-orange-300/20 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/30 animate-bounce">
              <FaPuzzlePiece className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                QuizMaster
              </div>
              <div className="text-sm text-white/70">Test Your Knowledge</div>
            </div>
          </div>
        </div>
        
        <div 
          className={`bg-white/10 backdrop-blur-xl p-8 sm:p-10 shadow-2xl rounded-3xl border border-white/20 
            transition-all duration-500 transform ${animateForm ? 'scale-105 opacity-95' : 'scale-100 opacity-100'}`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent mb-3">
              {isLogin ? 'Welcome Back!' : 'Get Started'}
            </h2>
            <p className="text-blue-100">
              {isLogin 
                ? 'Sign in to access your quizzes' 
                : 'Create an account to start your quiz journey'
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border-l-4 border-red-500 rounded-md text-red-200 text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/20 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6 transform hover:-translate-y-0.5"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <FcGoogle className="w-4 h-4" />
              </div>
            )}
            <span>{googleLoading ? 'Redirecting...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/50">
                OR
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-4 text-blue-300" />
                  <input
                    type="text"
                    name="displayName"
                    placeholder="Full Name"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required={!isLogin}
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-blue-300" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-blue-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-blue-300 hover:text-white disabled:opacity-50 transition-colors"
                  disabled={loading || googleLoading}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-blue-300" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required={!isLogin}
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 via-blue-600 to-teal-500 text-white mt-8"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <FiChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle form */}
          <div className="mt-8 text-center">
            <p className="text-blue-100">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setAnimateForm(true);
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 font-semibold text-teal-300 hover:text-teal-200 transition-colors duration-200 focus:outline-none"
                disabled={loading || googleLoading}
              >
                {isLogin ? 'Sign up now' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
        
        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-xs text-white/80 flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            AI-Powered Quizzes
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-xs text-white/80 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Real-time Leaderboards
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-xs text-white/80 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Progress Tracking
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
