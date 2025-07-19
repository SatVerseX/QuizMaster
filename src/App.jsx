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

  if (!currentUser) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <QuizCreator 
            onBack={handleBackToList}
            onQuizCreated={handleQuizCreated}
          />
        );
      case 'take':
        return (
          <QuizTaker 
            quiz={selectedQuiz}
            onBack={handleBackToList}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
      case 'attempts':
        return (
          <UserAttempts 
            onBack={handleViewHome}
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard 
            quizId={selectedQuiz?.id}
            quizTitle={selectedQuiz?.title}
            onBack={handleBackToList}
          />
        );
      default:
        return (
          <QuizList 
            onTakeQuiz={handleTakeQuiz}
            onCreateQuiz={handleCreateQuiz}
            onViewAttempts={handleViewAttempts}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-opacity duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Header onViewAttempts={handleViewAttempts} onViewHome={handleViewHome} />
      <main className="flex-grow pb-16 pt-20">
        {renderContent()}
      </main>
      <footer className="w-full py-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>QuizMaster &copy; {new Date().getFullYear()} - Learning made fun and engaging</p>
        </div>
      </footer>
    </div>
  );
};

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
