import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import AuthForm from './components/auth/AuthForm';
import QuizList from './components/quiz/QuizList';
import QuizCreator from './components/quiz/QuizCreator';
import QuizTaker from './components/quiz/QuizTaker';
import UserAttempts from './components/quiz/UserAttempts';
import Leaderboard from './components/quiz/LeaderBoard';
import AIQuizGenerator from './components/quiz/AIQuizGenerator'; // Add AI Generator import

const AppContent = () => {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState('list');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Add a subtle page transition effect
    setPageLoaded(true);
  }, []);

  const handleTakeQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('take');
    window.scrollTo(0, 0);
  };

  const handleCreateQuiz = () => {
    setCurrentView('create');
    window.scrollTo(0, 0);
  };

  // Add AI Generator handler
  const handleAIGenerator = () => {
    setCurrentView('ai-generator');
    window.scrollTo(0, 0);
  };

  const handleQuizCreated = () => {
    setCurrentView('list');
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedQuiz(null);
    window.scrollTo(0, 0);
  };

  const handleViewAttempts = () => {
    setCurrentView('attempts');
    window.scrollTo(0, 0);
  };

  const handleViewHome = () => {
    setCurrentView('list');
    setSelectedQuiz(null);
    window.scrollTo(0, 0);
  };

  const handleViewLeaderboard = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('leaderboard');
    window.scrollTo(0, 0);
  };

  // Show loading screen if user authentication is still loading
  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading QuizMaster...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AuthForm />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <div className="animate-fade-in">
            <QuizCreator 
              onBack={handleBackToList}
              onQuizCreated={handleQuizCreated}
            />
          </div>
        );
      
      case 'ai-generator': // Add AI Generator case
        return (
          <div className="animate-fade-in">
            <AIQuizGenerator
              onBack={handleBackToList}
              onQuizCreated={handleQuizCreated}
            />
          </div>
        );
      
      case 'take':
        return (
          <div className="animate-fade-in">
            <QuizTaker 
              quiz={selectedQuiz}
              onBack={handleBackToList}
              onViewLeaderboard={handleViewLeaderboard}
            />
          </div>
        );
      
      case 'attempts':
        return (
          <div className="animate-fade-in">
            <UserAttempts 
              onBack={handleViewHome}
            />
          </div>
        );
      
      case 'leaderboard':
        return (
          <div className="animate-fade-in">
            <Leaderboard 
              quizId={selectedQuiz?.id}
              quizTitle={selectedQuiz?.title}
              onBack={handleBackToList}
            />
          </div>
        );
      
      default:
        return (
          <div className="animate-fade-in">
            <QuizList 
              onTakeQuiz={handleTakeQuiz}
              onCreateQuiz={handleCreateQuiz}
              onViewAttempts={handleViewAttempts}
              onViewLeaderboard={handleViewLeaderboard}
              onAIGenerator={handleAIGenerator} // Add AI Generator prop
            />
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with navigation */}
      <Header 
        onViewAttempts={handleViewAttempts} 
        onViewHome={handleViewHome}
        onAIGenerator={handleAIGenerator} // Pass AI Generator to header
      />
      
      {/* Main content area */}
      <main className="flex-grow pb-16 pt-20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content with error boundary */}
        <div className="relative z-10">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-10 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border-t border-blue-900/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and Copyright */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  QuizMaster
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-1">
                QuizMaster &copy; {new Date().getFullYear()}
              </p>
              <p className="text-xs text-gray-500">
                Learning made fun and engaging
              </p>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl border border-blue-700/30 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🚀</span>
                </div>
                <span className="text-sm font-medium text-blue-300">
                  AI-Powered Quizzes
                </span>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl border border-purple-700/30 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">📊</span>
                </div>
                <span className="text-sm font-medium text-purple-300">
                  Real-time Leaderboards
                </span>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-teal-900/40 to-teal-800/40 rounded-xl border border-teal-700/30 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <span className="text-sm font-medium text-teal-300">
                  Progress Tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Error Boundary Component for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Quiz App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We encountered an unexpected error. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
