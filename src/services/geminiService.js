import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// JSON Schema for Quiz Questions
const quizSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Quiz title"
    },
    description: {
      type: "string",
      description: "Quiz description"
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The quiz question"
          },
          options: {
            type: "array",
            items: {
              type: "string"
            },
            minItems: 4,
            maxItems: 4,
            description: "Four multiple choice options"
          },
          correctAnswer: {
            type: "integer",
            minimum: 0,
            maximum: 3,
            description: "Index of correct answer (0-3)"
          },
          explanation: {
            type: "string",
            description: "Explanation for the correct answer"
          }
        },
        required: ["question", "options", "correctAnswer"]
      }
    }
  },
  required: ["title", "questions"]
};

export const generateQuizWithAI = async (topic, numberOfQuestions = 5, difficulty = 'medium') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });

    const prompt = `Create a comprehensive quiz about "${topic}" with exactly ${numberOfQuestions} questions. 
    Difficulty level: ${difficulty}.
    
    Requirements:
    - Each question should have exactly 4 multiple choice options
    - Include varied question types (factual, conceptual, analytical)
    - Provide clear explanations for correct answers
    - Make questions challenging but fair
    - Ensure options are plausible and well-distributed
    
    Topic: ${topic}
    Number of questions: ${numberOfQuestions}
    Difficulty: ${difficulty}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quizData = JSON.parse(response.text());
    
    return {
      success: true,
      data: quizData
    };
  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const validateQuizJSON = (jsonData) => {
  try {
    // Basic validation
    if (!jsonData.title || !jsonData.questions || !Array.isArray(jsonData.questions)) {
      return { valid: false, error: 'Invalid JSON structure. Must have title and questions array.' };
    }

    if (jsonData.questions.length === 0) {
      return { valid: false, error: 'Quiz must have at least one question.' };
    }

    // Validate each question
    for (let i = 0; i < jsonData.questions.length; i++) {
      const question = jsonData.questions[i];
      
      if (!question.question || typeof question.question !== 'string') {
        return { valid: false, error: `Question ${i + 1}: Missing or invalid question text.` };
      }

      if (!Array.isArray(question.options) || question.options.length !== 4) {
        return { valid: false, error: `Question ${i + 1}: Must have exactly 4 options.` };
      }

      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer > 3) {
        return { valid: false, error: `Question ${i + 1}: correctAnswer must be 0, 1, 2, or 3.` };
      }

      // Check for empty options
      if (question.options.some(option => !option || typeof option !== 'string')) {
        return { valid: false, error: `Question ${i + 1}: All options must be non-empty strings.` };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format.' };
  }
};
