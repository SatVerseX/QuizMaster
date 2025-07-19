import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiClock, FiTarget, FiTrendingUp, FiCalendar, FiAward, FiArrowLeft, FiFilter } from 'react-icons/fi';

const UserAttempts = ({ quizId = null, onBack }) => {
  const { currentUser } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    let q;
    if (quizId) {
      // Show attempts for specific quiz
      q = query(
        collection(db, 'quiz-attempts'),
        where('userId', '==', currentUser.uid),
        where('quizId', '==', quizId),
        orderBy('completedAt', 'desc')
      );
    } else {
      // Show all user attempts
      q = query(
        collection(db, 'quiz-attempts'),
        where('userId', '==', currentUser.uid),
        orderBy('completedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const attemptsData = [];
      querySnapshot.forEach((doc) => {
        attemptsData.push({ id: doc.id, ...doc.data() });
      });
      setAttempts(attemptsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, quizId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return timestamp.toDate().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-500 bg-red-50 dark:bg-red-900/20';
  };

  const getBestAttempt = () => {
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
  };

  const getAverageScore = () => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    return Math.round(total / attempts.length);
  };

  const getBestTime = () => {
    if (attempts.length === 0) return 0;
    return attempts.reduce((best, current) => 
      current.timeSpent < best.timeSpent ? current : best
    ).timeSpent;
  };

  const filterAttempts = (filter) => {
    setActiveFilter(filter);
    // Additional filtering logic could be added here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-300 border-t-blue-600 animate-spin"></div>
          <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-400 animate-spin absolute top-0 left-0" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  const bestAttempt = getBestAttempt();
  const averageScore = getAverageScore();

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="group flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4 transition-colors duration-300"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Back to Quizzes</span>
            </button>
          )}
          <h2 className="text-4xl font-extrabold mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Your Quiz History
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your progress and see your improvement over time
          </p>
        </div>
        
        <div className="flex gap-2 self-start">
          <button 
            onClick={() => filterAttempts('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${activeFilter === 'all' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            All Attempts
          </button>
          <button
            onClick={() => filterAttempts('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${activeFilter === 'recent' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Recent
          </button>
          <button
            onClick={() => filterAttempts('best')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${activeFilter === 'best' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Best Scores
          </button>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping opacity-50"></div>
            <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-purple-900 rounded-full w-full h-full flex items-center justify-center">
              <FiTarget className="w-12 h-12 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No attempts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Take your first quiz to see your progress here!
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Discover Quizzes
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/50 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/50 p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-blue-500/10 dark:bg-blue-400/10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 bg-blue-500/10 dark:bg-blue-400/10 rounded-full"></div>
              <div className="relative">
                <div className="p-3 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg inline-flex mb-3">
                  <FiTarget className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {attempts.length}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Attempts
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/40 dark:to-green-800/50 rounded-2xl shadow-lg border border-green-100 dark:border-green-900/50 p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-green-500/10 dark:bg-green-400/10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 bg-green-500/10 dark:bg-green-400/10 rounded-full"></div>
              <div className="relative">
                <div className="p-3 bg-green-500/20 dark:bg-green-400/20 rounded-lg inline-flex mb-3">
                  <FiAward className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {bestAttempt?.percentage || 0}%
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Best Score
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/50 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-900/50 p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-purple-500/10 dark:bg-purple-400/10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 bg-purple-500/10 dark:bg-purple-400/10 rounded-full"></div>
              <div className="relative">
                <div className="p-3 bg-purple-500/20 dark:bg-purple-400/20 rounded-lg inline-flex mb-3">
                  <FiTrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {averageScore}%
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Average Score
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-900/40 dark:to-orange-800/50 rounded-2xl shadow-lg border border-orange-100 dark:border-orange-900/50 p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-orange-500/10 dark:bg-orange-400/10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 bg-orange-500/10 dark:bg-orange-400/10 rounded-full"></div>
              <div className="relative">
                <div className="p-3 bg-orange-500/20 dark:bg-orange-400/20 rounded-lg inline-flex mb-3">
                  <FiClock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {bestAttempt ? formatTime(getBestTime()) : '0:00'}
                </div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Best Time
                </div>
              </div>
            </div>
          </div>

          {/* History Title */}
          <div className="flex items-center mb-6 mt-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Quiz History</h3>
            <div className="ml-4 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 flex-grow"></div>
          </div>

          {/* Attempts List */}
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <div 
                key={attempt.id} 
                className="bg-white dark:bg-gray-800/90 rounded-xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700/70 p-5 transform transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                      {attempt.quizTitle}
                    </h3>
                    
                    <div className="flex flex-wrap gap-5 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <FiCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        {formatDate(attempt.completedAt)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                          <FiClock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        {formatTime(attempt.timeSpent)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <FiTarget className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        {attempt.score}/{attempt.totalQuestions} correct
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-6 py-3 rounded-xl font-bold text-lg ${
                      attempt.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' :
                      attempt.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md' :
                      'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                    }`}>
                      {attempt.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserAttempts;
