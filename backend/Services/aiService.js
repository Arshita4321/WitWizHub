const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback YouTube links for common topics
const youtubeLinks = {
  'Process Management': [
    'https://www.youtube.com/watch?v=9t5Ca7YGx-w', // Process Management Lecture
    'https://www.youtube.com/watch?v=0jw32HvJx98', // Process Management Part One
  ],
  'Memory Management': [
    'https://www.youtube.com/watch?v=qmAFUvu-VYA', // Memory Management in OS
    'https://www.youtube.com/watch?v=-Z48jM1m2kQ', // Memory Management and Paging
  ],
};

// Fallback mock questions
const generateMockQuestions = (subject, topics, numQuestions, level) => {
  const questions = [];
  const difficulties = {
    easy: ['basic concept', 'fundamental principle', 'simple definition'],
    medium: ['key concept', 'core principle', 'important mechanism'],
    hard: ['advanced concept', 'complex mechanism', 'detailed process']
  };
  const questionType = difficulties[level.toLowerCase()] || difficulties.medium;
  for (let i = 0; i < numQuestions; i++) {
    const topic = topics[i % topics.length];
    questions.push({
      question: `What is a ${questionType[0]} in ${topic} within ${subject}?`,
      options: [
        `${questionType[0].charAt(0).toUpperCase() + questionType[0].slice(1)} of ${topic}`,
        `Secondary aspect of ${topic}`,
        `Unrelated concept`,
        `Basic idea of ${topic}`
      ],
      correctAnswer: `${questionType[0].charAt(0).toUpperCase() + questionType[0].slice(1)} of ${topic}`,
      topic
    });
  }
  return questions;
};

async function generateAIQuestions(subject, topics, numQuestions, level) {
  const prompt = `
  Generate ${numQuestions} MCQs for subject "${subject}", topics: ${topics.join(", ")}, difficulty: ${level}.
  Return valid JSON array:
  [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "topic": "..."
    }
  ]
  `;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    const questions = JSON.parse(text);
    if (!Array.isArray(questions) || questions.length === 0) {
      logger.warn('Gemini returned empty or invalid questions', { subject, topics, numQuestions, level });
      return generateMockQuestions(subject, topics, numQuestions, level);
    }
    return questions;
  } catch (error) {
    logger.error('Gemini API error', { error: error.message, subject, topics, numQuestions, level });
    return generateMockQuestions(subject, topics, numQuestions, level);
  }
}

async function generateAIRevisionSheet(topics) {
  if (!topics.length) return "No wrong topics. You did great!";
  const prompt = `Create a short bullet-point revision sheet for: ${topics.join(", ")}. For each topic, include a brief description of key concepts to review.`;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let revisionText = result.response.text();
    
    // Append YouTube links for each topic
    let finalRevisionSheet = revisionText;
    topics.forEach(topic => {
      const links = youtubeLinks[topic] || [];
      if (links.length > 0) {
        finalRevisionSheet += `\n\n**${topic} Resources**:\n`;
        links.forEach((link, index) => {
          finalRevisionSheet += `- [YouTube Video ${index + 1}](${link})\n`;
        });
      } else {
        finalRevisionSheet += `\n\n**${topic} Resources**: Search YouTube for "${topic} in Operating Systems" to find relevant tutorials.\n`;
      }
    });
    
    return finalRevisionSheet;
  } catch (error) {
    logger.error('Revision sheet generation failed', { error: error.message, topics });
    let fallbackSheet = `Review the following topics: ${topics.join(", ")}.\n`;
    topics.forEach(topic => {
      const links = youtubeLinks[topic] || [];
      if (links.length > 0) {
        fallbackSheet += `\n**${topic}**:\n`;
        links.forEach((link, index) => {
          fallbackSheet += `- [YouTube Video ${index + 1}](${link})\n`;
        });
      } else {
        fallbackSheet += `\n**${topic}**: Refer to textbooks or search YouTube for "${topic} in Operating Systems".\n`;
      }
    });
    return fallbackSheet;
  }
}

module.exports = { generateAIQuestions, generateAIRevisionSheet };