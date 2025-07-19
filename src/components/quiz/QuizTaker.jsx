import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiCheck, FiX, FiClock, FiAward, FiSend, FiAlertCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

const QuizTaker = ({ quiz, onBack, onViewLeaderboard }) => {
  const { currentUser } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmitConfirm = () => {
    setShowSubmitConfirm(true);
  };

  const handleCancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  const submitQuiz = async () => {
    setSaving(true);
    const endTimeNow = Date.now();
    setEndTime(endTimeNow);

    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = correctAnswers;
    const timeSpentSeconds = Math.floor((endTimeNow - startTime) / 1000);
    const percentage = Math.round((finalScore / quiz.questions.length) * 100);
    
    setScore(finalScore);

    try {
      // Save attempt to Firestore
      const attemptData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        percentage: percentage,
        timeSpent: timeSpentSeconds,
        answers: answers,
        completedAt: new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'quiz-attempts'), attemptData);
      console.log('Quiz attempt saved successfully');
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    } finally {
      setSaving(false);
      setShowResults(true);
      setShowSubmitConfirm(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentQuestionIndex + 1) / quiz.questions.length * 100;

  // Get current question
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  
  // Check if quiz data is missing or invalid
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-10 text-center border border-gray-200 dark:border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-red-100 dark:bg-red-900/30 rounded-full blur-3xl"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-100 dark:bg-red-900/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 mb-6">
              <FiAlertCircle className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Not Found</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-md mx-auto">
              This quiz has no questions or might have been deleted. Please try another quiz.
            </p>
            
            <button
              onClick={onBack}
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center mx-auto hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Quiz List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Confetti background for high scores */}
          {percentage >= 70 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"></div>
            </div>
          )}
          
          <div className="relative px-6 pt-10 pb-12 md:px-10">
            {/* Results Header with animated score */}
            <div className="text-center mb-10">
              <div className="mb-8 relative">
                <div className="inline-flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-r shadow-lg relative animate-scale-in">
                  {/* Background circular progress */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      className="text-gray-200 dark:text-gray-700" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * percentage) / 100}
                      className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${
                        percentage >= 80 ? 'text-green-500 dark:text-green-400' :
                        percentage >= 60 ? 'text-blue-500 dark:text-blue-400' :
                        percentage >= 40 ? 'text-yellow-500 dark:text-yellow-400' :
                        'text-red-500 dark:text-red-400'
                      }`}
                    />
                  </svg>
                  <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white animate-fade-in">
                    {percentage}%
                  </span>
                </div>
                
                {/* Badge for perfect score */}
                {percentage === 100 && (
                  <div className="absolute -right-2 -top-2 bg-yellow-500 rounded-full p-1.5 shadow-lg animate-bounce-in">
                    <FiAward className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-fade-up">
                Quiz Complete!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 animate-fade-up" style={{animationDelay: '100ms'}}>
                You scored <span className="font-semibold text-blue-600 dark:text-blue-400">{score}</span> out of <span className="font-semibold text-blue-600 dark:text-blue-400">{quiz.questions.length}</span> questions correctly
              </p>
              
              {saving && (
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 animate-fade-in">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                  <span>Saving your attempt...</span>
                </div>
              )}
            </div>

            {/* Result Details */}
            <div className="mb-10 max-w-md mx-auto">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Time Spent:</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.floor((endTime - startTime) / 60000)}m {Math.floor(((endTime - startTime) % 60000) / 1000)}s
                </span>
              </div>
              
              {/* Result message based on score */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <p className="text-center text-gray-800 dark:text-gray-200 text-lg">
                  {percentage === 100 ? (
                    <span>Perfect score! Impressive knowledge! 🎉</span>
                  ) : percentage >= 80 ? (
                    <span>Great job! You've mastered this topic! 👏</span>
                  ) : percentage >= 60 ? (
                    <span>Good work! You're on the right track! 👍</span>
                  ) : percentage >= 40 ? (
                    <span>Not bad! Keep practicing to improve! 📚</span>
                  ) : (
                    <span>Keep studying and try again soon! 💪</span>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{animationDelay: '200ms'}}>
              <button
                onClick={onBack}
                className="px-6 py-3.5 bg-blue-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Quizzes
              </button>
              
              <button
                onClick={() => onViewLeaderboard && onViewLeaderboard(quiz)}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <FaTrophy className="w-5 h-5" />
                View Leaderboard
              </button>
            </div>
          </div>
          
          {/* Custom footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 py-4 px-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Quiz: {quiz.title}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Completed on {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Add the following CSS to the component for animations */}
        <style jsx>{`
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          
          @keyframes fadeUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes bounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-scale-in {
            animation: scaleIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          
          .animate-fade-up {
            animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          
          .animate-bounce-in {
            animation: bounceIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}</style>
      </div>
    );
  }

  // Confirmation Modal
  if (showSubmitConfirm) {
    return (
      <div className="max-w-4xl mx-auto p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <FiSend className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ready to Submit?
            </h3>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300 mb-2 text-center">
              You've answered <span className="font-semibold text-blue-700 dark:text-blue-400">{Object.keys(answers).length}</span> of <span className="font-semibold text-blue-700 dark:text-blue-400">{quiz.questions.length}</span> questions. 
            </p>
            
            {Object.keys(answers).length < quiz.questions.length && (
              <div className="flex items-center gap-3 justify-center mt-3 py-2 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <FiAlertCircle className="text-amber-500 dark:text-amber-400 flex-shrink-0 w-5 h-5" />
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  {quiz.questions.length - Object.keys(answers).length} question{quiz.questions.length - Object.keys(answers).length !== 1 ? 's' : ''} remain unanswered and will be marked incorrect.
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Time spent:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor((Date.now() - startTime) / 1000) % 60}s
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={handleCancelSubmit}
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl flex items-center gap-2 justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 border border-gray-200 dark:border-gray-600"
            >
              <FiX className="w-5 h-5" />
              Continue Quiz
            </button>
            
            <button
              onClick={submitQuiz}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl flex items-center gap-2 justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FiCheck className="w-5 h-5" />
              Submit Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz UI
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
          title="Back to Quiz List"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Exit Quiz</span>
        </button>
        
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center flex-1 mx-4 truncate">
          {quiz.title}
        </h1>
        
        <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
          <FiClock className="w-4 h-4" />
          <span>{Object.keys(answers).length}/{quiz.questions.length}</span>
        </div>
      </div>

      {/* Progress Bar with gradient */}
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Question Card with enhanced styling */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
        {/* Question Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.floor((Date.now() - startTime) / 60000)}:{String(Math.floor((Date.now() - startTime) / 1000) % 60).padStart(2, '0')}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-3">
            {currentQuestion?.question || "No question found"}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="p-5">
          <div className="space-y-3">
            {currentQuestion?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 flex items-start transition-all duration-300 ${
                  answers[currentQuestionIndex] === index
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/70'
                }`}
              >
                <div className={`flex-shrink-0 w-7 h-7 mr-3 rounded-full flex items-center justify-center border-2 ${
                  answers[currentQuestionIndex] === index
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {answers[currentQuestionIndex] === index ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                  )}
                </div>
                <span className={`text-md ${
                  answers[currentQuestionIndex] === index
                    ? 'text-blue-900 dark:text-blue-100 font-medium'
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Controls with improved styling */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
            currentQuestionIndex === 0
              ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 border border-blue-200 dark:border-blue-800'
          }`}
        >
          <FiChevronLeft className="w-5 h-5" /> Previous
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitConfirm}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FiSend className="w-5 h-5" /> 
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Next <FiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Quiz footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>Quiz: {quiz.title}</p>
          <p>
            {answers[currentQuestionIndex] !== undefined ? (
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Answered</span>
            ) : (
              <span>Not answered yet</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

// Add missing helper function
const getScoreBgColor = (percentage) => {
  if (percentage >= 80) return 'from-green-500 to-green-600';
  if (percentage >= 60) return 'from-blue-500 to-blue-600';
  if (percentage >= 40) return 'from-yellow-500 to-yellow-600';
  return 'from-red-500 to-red-600';
};

export default QuizTaker;
