import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiPlay, 
  FiClock, 
  FiUser, 
  FiPlus, 
  FiTarget, 
  FiEdit, 
  FiBarChart2,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiFilter,
  FiSearch,
  FiChevronRight,
  FiHelpCircle,
  FiCheckCircle,
  FiBookOpen
} from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

const QuizList = ({ onTakeQuiz, onCreateQuiz, onViewAttempts, onViewLeaderboard }) => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userStats, setUserStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0
  });

  useEffect(() => {
    const q = filter === 'mine' 
      ? query(collection(db, 'quizzes'), where('createdBy', '==', currentUser.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const quizData = [];
      querySnapshot.forEach((doc) => {
        quizData.push({ id: doc.id, ...doc.data() });
      });
      setQuizzes(quizData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.uid, filter]);

  // Load user statistics
  useEffect(() => {
    if (!currentUser) return;

    const statsQuery = query(
      collection(db, 'quiz-attempts'),
      where('userId', '==', currentUser.uid),
      orderBy('completedAt', 'desc')
    );

    const unsubscribe = onSnapshot(statsQuery, (querySnapshot) => {
      const attempts = [];
      querySnapshot.forEach((doc) => {
        attempts.push(doc.data());
      });

      if (attempts.length > 0) {
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
        const averageScore = Math.round(totalScore / attempts.length);
        const bestScore = Math.max(...attempts.map(attempt => attempt.percentage));

        setUserStats({
          totalAttempts: attempts.length,
          averageScore,
          bestScore
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter quizzes based on search term
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-blue-300 border-t-transparent animate-spin animate-delay-150"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section with Glass Effect */}
      <div className="relative mb-12 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-3xl"></div>
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-10 overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Quiz Library
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
                Discover amazing quizzes, test your knowledge, and challenge yourself to reach the top of the leaderboard.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onViewAttempts}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiTarget className="w-5 h-5" />
                My Progress
              </button>
              
              <button
                onClick={onCreateQuiz}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiPlus className="w-5 h-5" />
                Create New Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <FiBarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {quizzes.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Quizzes
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-green-100 dark:border-green-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {quizzes.filter(q => q.createdBy === currentUser.uid).length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Created by You
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-purple-100 dark:border-purple-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
              <FiCheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userStats.totalAttempts}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Your Attempts
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-yellow-100 dark:border-yellow-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md">
              <FiStar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {userStats.bestScore}%
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Best Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/90 dark:bg-[#172033] rounded-xl border-2 border-gray-300 dark:border-blue-900/60 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 shadow-md text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <FiSearch className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 dark:text-blue-400" />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            All Quizzes
          </button>
          
          <button
            onClick={() => setFilter('mine')}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              filter === 'mine'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <FiUser className="w-4 h-4" />
            My Quizzes
          </button>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            {searchTerm ? (
              <FiSearch className="w-10 h-10 text-gray-400" />
            ) : (
              <FiHelpCircle className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchTerm ? 'No matching quizzes found' : filter === 'mine' ? 'No quizzes created yet' : 'No quizzes available'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
            {searchTerm ? 'Try a different search term or clear your search' : 
             filter === 'mine' ? 'Create your first quiz and share your knowledge!' : 
             'Be the first to create a quiz and start the learning journey.'}
          </p>
          <button
            onClick={onCreateQuiz}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FiPlus className="w-6 h-6" />
            Create a Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {quiz.title}
                  </h3>
                  {quiz.createdBy === currentUser.uid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality 
                      }}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-5 line-clamp-2">
                  {quiz.description || "Take this quiz to test your knowledge!"}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400 mb-5">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    <span>{quiz.createdByName || "Anonymous"}</span>
                  </div>
                  
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                  
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>Created {formatDate(quiz.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onTakeQuiz(quiz)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                  >
                    <FiPlay className="w-4 h-4" />
                    Take Quiz
                  </button>
                  
                  <button
                    onClick={() => onViewLeaderboard(quiz)}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                  >
                    <FaTrophy className="w-4 h-4" />
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
