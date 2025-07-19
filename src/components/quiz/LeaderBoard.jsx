import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiAward, FiUser, FiClock, FiArrowLeft, FiFilter, FiChevronDown } from 'react-icons/fi';
import { FaTrophy, FaCrown, FaMedal, FaChartLine, FaHistory } from 'react-icons/fa';

const Leaderboard = ({ quizId, quizTitle, onBack }) => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('best'); // 'best' or 'recent'
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    // Get all attempts for this quiz, ordered by score and time
    // Create query based on filter type
    let q;
    if (filter === 'best') {
      q = query(
        collection(db, 'quiz-attempts'),
        where('quizId', '==', quizId),
        orderBy('percentage', 'desc'),
        orderBy('timeSpent', 'asc'),
        limit(100)
      );
    } else {
      q = query(
        collection(db, 'quiz-attempts'),
        where('quizId', '==', quizId),
        orderBy('completedAt', 'desc'),
        limit(100)
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const attempts = [];
      const userAttempts = new Map(); // Track best attempt per user

      querySnapshot.forEach((doc) => {
        const attempt = { id: doc.id, ...doc.data() };
        attempts.push(attempt);

        // If showing recent, don't deduplicate
        if (filter === 'recent') {
          return;
        }

        // Track best attempt per user
        const existing = userAttempts.get(attempt.userId);
        if (!existing || 
            attempt.percentage > existing.percentage || 
            (attempt.percentage === existing.percentage && attempt.timeSpent < existing.timeSpent)) {
          userAttempts.set(attempt.userId, attempt);
        }
      });

      // Use appropriate data based on filter
      let leaderboardData;
      if (filter === 'best') {
        leaderboardData = Array.from(userAttempts.values()).sort((a, b) => {
          if (a.percentage !== b.percentage) {
            return b.percentage - a.percentage; // Higher percentage first
          }
          return a.timeSpent - b.timeSpent; // Faster time for same percentage
        });
      } else {
        // For recent, just use all attempts sorted by date
        leaderboardData = attempts;
      }

      setLeaderboard(leaderboardData);

      // Find current user's rank
      const userRankIndex = leaderboardData.findIndex(
        attempt => attempt.userId === currentUser?.uid
      );
      setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [quizId, currentUser, filter]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-yellow-400 opacity-30 blur-sm animate-pulse"></div>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
              <FaCrown className="w-5 h-5" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gray-300 opacity-30 blur-sm"></div>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md">
              <FaMedal className="w-5 h-5" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-orange-400 opacity-30 blur-sm"></div>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md">
              <FiAward className="w-5 h-5" />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold">
            {rank}
          </div>
        );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(undefined, { 
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-yellow-300 border-t-transparent animate-spin animate-delay-150"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Back button and page title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Quiz</span>
          </button>
        )}
        
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
          Quiz Leaderboard
        </h2>
      </div>
    
      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header with decorative background */}
        <div className="relative bg-gradient-to-r from-yellow-400/10 to-amber-500/10 dark:from-yellow-900/20 dark:to-amber-800/20 p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 -right-5 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative text-center">
            <div className="inline-block mb-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-yellow-400/30 blur-xl animate-pulse"></div>
                <FaTrophy className="relative w-16 h-16 text-yellow-500 mx-auto" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {quizTitle}
            </h2>
            
            {userRank && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Your Position</p>
                <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-full shadow-md">
                  <FiUser className="w-5 h-5" />
                  <span className="text-xl font-bold">#{userRank}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Filter buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setFilter('best')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === 'best' 
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FaChartLine className="w-4 h-4" />
              Best Scores
            </button>
            
            <button
              onClick={() => setFilter('recent')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === 'recent' 
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FaHistory className="w-4 h-4" />
              Recent Attempts
            </button>
          </div>
        </div>

        {/* Leaderboard entries */}
        <div className="p-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FaTrophy className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No attempts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to take this quiz and claim the top spot!
              </p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right">Date</div>
              </div>
              
              {/* List of players */}
              <div className="space-y-2 mt-2">
                {leaderboard.map((attempt, index) => {
                  const rank = index + 1;
                  const isCurrentUser = attempt.userId === currentUser?.uid;
                  
                  return (
                    <div
                      key={attempt.id}
                      className={`rounded-xl border ${
                        isCurrentUser 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md' 
                          : rank <= 3
                            ? 'bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10 border-amber-200 dark:border-amber-800'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                      } hover:shadow-md transition-all duration-300`}
                    >
                      <div className="md:grid md:grid-cols-12 md:gap-4 p-4 items-center">
                        {/* Rank */}
                        <div className="md:col-span-1 flex justify-center md:justify-start mb-4 md:mb-0">
                          {getRankIcon(rank)}
                        </div>
                        
                        {/* Player */}
                        <div className="md:col-span-5 flex flex-col items-center md:items-start mb-4 md:mb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-lg ${isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                              {attempt.userName || 'Anonymous'}
                            </h3>
                            {isCurrentUser && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-2 mb-4 md:mb-0">
                          <div className={`text-xl font-bold ${
                            rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                            rank === 2 ? 'text-gray-600 dark:text-gray-300' :
                            rank === 3 ? 'text-orange-600 dark:text-orange-400' :
                            'text-gray-900 dark:text-white'
                          }`}>
                            {attempt.percentage}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ({attempt.score}/{attempt.totalQuestions})
                          </div>
                        </div>
                        
                        {/* Time */}
                        <div className="md:col-span-2 flex items-center justify-center md:justify-start gap-2 mb-4 md:mb-0">
                          <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-mono text-gray-800 dark:text-gray-200">
                            {formatTime(attempt.timeSpent)}
                          </span>
                        </div>
                        
                        {/* Date (only visible in recent mode) */}
                        <div className="md:col-span-2 md:text-right text-center">
                          {filter === 'recent' && attempt.completedAt && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(attempt.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add the animations as regular CSS */}
      <style>
      {`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-delay-150 {
          animation-delay: 150ms;
        }
      `}
      </style>
    </div>
  );
};

export default Leaderboard;
