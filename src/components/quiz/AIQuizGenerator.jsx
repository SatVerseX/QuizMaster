import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { generateQuizWithAI, validateQuizJSON } from '../../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { 
  FiUpload, 
  FiDownload, 
  FiZap, 
  FiFileText, 
  FiCheck, 
  FiX, 
  FiLoader,
  FiArrowLeft,
  FiCpu,
  FiBookOpen,
  FiStar,
  FiBriefcase,
  FiLayers
} from 'react-icons/fi';

const AIQuizGenerator = ({ onBack, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'upload'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // AI Generation State
  const [aiForm, setAiForm] = useState({
    topic: '',
    numberOfQuestions: 5,
    difficulty: 'medium'
  });

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);

  // Animation effect on component mount
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // AI Quiz Generation
  const handleAIGeneration = async () => {
    if (!aiForm.topic.trim()) {
      setError('Please enter a topic for the quiz');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const result = await generateQuizWithAI(
        aiForm.topic,
        aiForm.numberOfQuestions,
        aiForm.difficulty
      );

      if (result.success) {
        setPreviewData(result.data);
        setShowPreview(true);
        setSuccess(`Generated ${result.data.questions.length} questions successfully!`);
      } else {
        setError(`Failed to generate quiz: ${result.error}`);
      }
    } catch (error) {
      setError('An unexpected error occurred while generating the quiz');
      console.error('AI Generation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        const validation = validateQuizJSON(parsedData);
        
        if (validation.valid) {
          setJsonData(parsedData);
          setPreviewData(parsedData);
          setShowPreview(true);
          setSuccess('JSON file uploaded and validated successfully!');
          clearMessages();
        } else {
          setError(`Invalid JSON: ${validation.error}`);
          setJsonData(null);
          setPreviewData(null);
        }
      } catch (error) {
        setError('Invalid JSON file format');
        setJsonData(null);
        setPreviewData(null);
      }
    };
    
    reader.readAsText(file);
  };

  // Create Quiz in Firebase
  const createQuizFromData = async (quizData) => {
    setLoading(true);
    clearMessages();

    try {
      const processedQuestions = quizData.questions.map(q => ({
        id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      }));

      const finalQuizData = {
        title: quizData.title,
        description: quizData.description || '',
        questions: processedQuestions,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
        totalQuestions: processedQuestions.length,
        isAIGenerated: activeTab === 'ai'
      };

      await addDoc(collection(db, 'quizzes'), finalQuizData);
      
      setSuccess('Quiz created successfully!');
      setTimeout(() => {
        onQuizCreated();
      }, 2000);
    } catch (error) {
      setError('Failed to create quiz. Please try again.');
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download Sample JSON
  const downloadSampleJSON = () => {
    const sampleData = {
      title: "Sample JavaScript Quiz",
      description: "Test your JavaScript knowledge",
      questions: [
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: [
            "var myVar = 5;",
            "variable myVar = 5;",
            "v myVar = 5;",
            "declare myVar = 5;"
          ],
          correctAnswer: 0,
          explanation: "The 'var' keyword is used to declare variables in JavaScript."
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: [
            "push()",
            "pop()",
            "shift()",
            "unshift()"
          ],
          correctAnswer: 0,
          explanation: "The push() method adds one or more elements to the end of an array."
        }
      ]
    };

    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-quiz.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (showPreview && previewData) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        {/* Preview Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">Quiz Preview</h1>
            <p className="text-gray-600 dark:text-gray-400">Review your quiz before creating</p>
          </div>
          
          <button
            onClick={() => setShowPreview(false)}
            className="group flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Generator
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Quiz Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/10 rounded-full -mt-10 -mr-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {previewData.title}
            </h2>
            {previewData.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {previewData.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5">
                <FiLayers className="w-4 h-4" />
                <span>{previewData.questions.length} questions</span>
              </div>
              
              <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1.5">
                {activeTab === 'ai' ? (
                  <>
                    <FiCpu className="w-4 h-4" />
                    <span>AI Generated</span>
                  </>
                ) : (
                  <>
                    <FiFileText className="w-4 h-4" />
                    <span>JSON Upload</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-6 mb-8">
          {previewData.questions.map((question, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-500 hover:shadow-xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm">
                    {index + 1}
                  </span>
                  <span>Question {index + 1}</span>
                </h3>
              </div>

              <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium">
                {question.question}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      optionIndex === question.correctAnswer
                        ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {optionIndex === question.correctAnswer ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{String.fromCharCode(65 + optionIndex)}</span>
                        </div>
                      )}
                      <span className={optionIndex === question.correctAnswer ? 'font-medium' : ''}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Quiz Button */}
        <div className="text-center">
          <button
            onClick={() => createQuizFromData(previewData)}
            disabled={loading}
            className="relative px-8 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group disabled:opacity-70"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 group-active:opacity-50 transition-opacity"></span>
            <span className="relative flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating Quiz...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>Create Quiz</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Header with glowing background */}
      <div className="relative mb-12">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              AI Quiz Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create professional quizzes instantly with AI or upload your own JSON files
            </p>
          </div>
          
          <button
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-xl mb-8 shadow-inner flex gap-2">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform translate-y-0'
              : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'ai' ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
            <FiCpu className={`w-5 h-5 ${activeTab === 'ai' ? 'text-white' : 'text-orange-500 dark:text-orange-400'}`} />
          </div>
          <span>AI Generation</span>
        </button>
        
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform translate-y-0'
              : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'upload' ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
            <FiUpload className={`w-5 h-5 ${activeTab === 'upload' ? 'text-white' : 'text-orange-500 dark:text-orange-400'}`} />
          </div>
          <span>JSON Upload</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2 animate-fade-in">
          <FiX className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded-lg text-green-600 dark:text-green-400 flex items-center gap-2 animate-fade-in">
          <FiCheck className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* AI Generation Tab */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden animate-fade-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-full -mt-32 -mr-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 rounded-full -mb-32 -ml-32"></div>
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <FiZap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generate Quiz with AI
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Let AI create engaging quiz questions for any topic you choose
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-300">
                  Quiz Topic <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., JavaScript, World History, Physics, etc."
                    value={aiForm.topic}
                    onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiStar className="w-5 h-5 text-orange-500 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-300">
                  Number of Questions
                </label>
                <select
                  value={aiForm.numberOfQuestions}
                  onChange={(e) => setAiForm(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 cursor-pointer"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-4">
                <label className="block font-medium text-gray-700 dark:text-gray-300">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { 
                      name: 'easy', 
                      icon: <FiBookOpen className="w-6 h-6" />, 
                      desc: 'Basic concepts',
                      gradient: 'from-blue-500 to-blue-600',
                      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30',
                      borderColor: 'border-blue-200 dark:border-blue-800',
                      hoverGlow: 'shadow-blue-200 dark:shadow-blue-900/30',
                      activeGlow: 'shadow-blue-300 dark:shadow-blue-800/40'
                    },
                    { 
                      name: 'medium', 
                      icon: <FiBriefcase className="w-6 h-6" />, 
                      desc: 'Moderate depth',
                      gradient: 'from-orange-500 to-red-500',
                      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/30',
                      borderColor: 'border-orange-200 dark:border-orange-800', 
                      hoverGlow: 'shadow-orange-200 dark:shadow-orange-900/30',
                      activeGlow: 'shadow-orange-300 dark:shadow-orange-800/40'
                    },
                    { 
                      name: 'hard', 
                      icon: <FiStar className="w-6 h-6" />, 
                      desc: 'Advanced topics',
                      gradient: 'from-purple-500 to-purple-600',
                      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30', 
                      borderColor: 'border-purple-200 dark:border-purple-800',
                      hoverGlow: 'shadow-purple-200 dark:shadow-purple-900/30',
                      activeGlow: 'shadow-purple-300 dark:shadow-purple-800/40'
                    }
                  ].map((level) => (
                    <button
                      key={level.name}
                      onClick={() => setAiForm(prev => ({ ...prev, difficulty: level.name }))}
                      className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden border-2
                        ${aiForm.difficulty === level.name 
                          ? `bg-gradient-to-b ${level.bgGradient} ${level.borderColor} shadow-lg shadow-${level.activeGlow} transform scale-105 border-2` 
                          : `bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 hover:shadow-lg hover:shadow-${level.hoverGlow} hover:border-${level.borderColor}`
                        }
                      `}
                    >
                      {/* Selected indicator */}
                      {aiForm.difficulty === level.name && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                      )}
                      
                      <div className="py-8 px-2 flex flex-col items-center justify-center w-full">
                        {/* Icon container */}
                        <div 
                          className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 transition-all duration-300
                            ${aiForm.difficulty === level.name
                              ? `bg-gradient-to-br ${level.gradient} text-white shadow-lg transform scale-110`
                              : `bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:scale-105`
                            }
                          `}
                        >
                          {level.icon}
                        </div>
                        
                        {/* Title */}
                        <div className={`text-xl font-bold mb-1 capitalize transition-colors duration-300 
                          ${aiForm.difficulty === level.name
                            ? `bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`
                            : 'text-gray-800 dark:text-gray-200'
                          }
                        `}>
                          {level.name}
                        </div>
                        
                        {/* Description */}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {level.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleAIGeneration}
                disabled={loading || !aiForm.topic.trim()}
                className="w-full mt-6 relative py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 overflow-hidden group disabled:opacity-70"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 group-active:opacity-50 transition-opacity"></span>
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <FiZap className="w-6 h-6" />
                      <span>Generate Quiz with AI</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sample Download */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl shadow-lg border-2 border-orange-200 dark:border-orange-800 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-md">
                  <FiBookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Need a template?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download our sample JSON file to see the correct format for your quiz
                  </p>
                </div>
              </div>
              
              <button
                onClick={downloadSampleJSON}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <FiDownload className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
                <span>Download Sample</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-full -mt-32 -mr-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 rounded-full -mb-32 -ml-32"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                  <FiFileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upload JSON File
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload a properly formatted JSON file with quiz questions
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors duration-300 group">
                <div className="mb-4 p-6 mx-auto w-24 h-24 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUpload className="w-12 h-12 text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
                
                <label
                  htmlFor="json-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <FiUpload className="w-5 h-5" />
                  Choose JSON File
                </label>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Or drag and drop your JSON file here
                </p>
                
                {uploadedFile && (
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 mx-auto max-w-md">
                    <div className="flex items-center gap-3">
                      <FiFileText className="w-6 h-6 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                      <div className="text-left overflow-hidden">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* JSON Format Requirements */}
              <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-orange-500" />
                  JSON Format Requirements
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <span>Must have "title" and "questions" fields</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <span>Each question needs "question", "options" (4 items), and "correctAnswer" (0-3)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <span>Optional: "description" and "explanation" for each question</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <span>All options must be non-empty strings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;
