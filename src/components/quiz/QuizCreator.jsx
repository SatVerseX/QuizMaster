import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const QuizCreator = ({ onBack, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    questions: [{ 
      id: uuidv4(), 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: uuidv4(), question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    }));
  };

  const removeQuestion = (questionId) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const saveQuiz = async () => {
    if (!quiz.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    const hasEmptyQuestions = quiz.questions.some(q => 
      !q.question.trim() || q.options.some(opt => !opt.trim())
    );

    if (hasEmptyQuestions) {
      setError('All questions and options must be filled out');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'quizzes'), {
        ...quiz,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        totalQuestions: quiz.questions.length
      });
      
      onQuizCreated?.();
    } catch (error) {
      setError('Failed to save quiz. Please try again.');
      console.error('Error saving quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create a New Quiz</h1>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 transition-opacity"
        >
          <FiPlus /> Add Question
        </button>
      </div>

      <div className="space-y-10">
        {/* Quiz Details */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-500/10 border-l-4 border-red-500 dark:border-red-400 rounded-md text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quiz Title
              </label>
              <input
                id="quizTitle"
                type="text"
                placeholder="e.g., 'Modern Art History'"
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold"
              />
            </div>

            <div>
              <label htmlFor="quizDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="quizDescription"
                placeholder="A short summary of what this quiz is about"
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 min-h-[120px] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Questions ({quiz.questions.length})
          </h2>

          {quiz.questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Question {questionIndex + 1}
                </h3>
                
                {quiz.questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-full transition-all duration-200"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Text
                  </label>
                  <input
                    type="text"
                    placeholder="What is the question?"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Answer Options
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="relative flex items-center">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                            className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg transition-all duration-300 ${question.correctAnswer === optionIndex ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'} text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={saveQuiz}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-lg px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold"
          >
            <FiSave />
            {loading ? 'Saving Quiz...' : 'Save & Publish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
