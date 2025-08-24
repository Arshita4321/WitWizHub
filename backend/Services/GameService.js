const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const winston = require('winston');
const NodeCache = require('node-cache'); // Add node-cache for caching

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
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // Cache for 1 hour

// Fallback question in case of API failure
const fallbackQuestions = {
  easy: {
    question: "What is a common placeholder question used in quizzes?",
    options: ["Lorem Ipsum", "Foo Bar", "Hello World", "Test Question"],
    correctAnswer: "Foo Bar",
    topic: "General",
    difficulty: "easy",
    questionType: "basic-recall",
    questionNumber: 1
  },
  medium: {
    question: "Which of these is a common programming paradigm?",
    options: ["Object-Oriented", "Linear", "Circular", "Random"],
    correctAnswer: "Object-Oriented",
    topic: "General",
    difficulty: "medium",
    questionType: "conceptual",
    questionNumber: 1
  },
  hard: {
    question: "What is the primary purpose of a design pattern in software engineering?",
    options: ["Increase code length", "Solve common problems", "Reduce performance", "Add complexity"],
    correctAnswer: "Solve common problems",
    topic: "General",
    difficulty: "hard",
    questionType: "problem-solving",
    questionNumber: 1
  }
};

const getRandomSeed = () => Math.floor(Math.random() * 1000000);

const getRandomQuestionStyle = (difficulty) => {
  const styles = {
    easy: ["basic-recall", "simple-definition", "direct-identification", "straightforward-concept"],
    medium: ["analytical", "application-based", "conceptual", "comparative", "understanding-based"],
    hard: ["problem-solving", "scenario-based", "critical-thinking", "evaluation-based", "synthesis-based", "complex-application"]
  };
  const availableStyles = styles[difficulty] || styles.medium;
  return availableStyles[Math.floor(Math.random() * availableStyles.length)];
};

const shuffleDifficulties = () => {
  const difficulties = [
    ...Array(4).fill('hard'),
    ...Array(2).fill('easy'),
    ...Array(4).fill('medium')
  ];
  for (let i = difficulties.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
  }
  return difficulties;
};

async function generateQuestion(topic, usedQuestions = [], questionNumber = 1, difficultyOrder = null) {
  const maxRetries = 5;
  let attempts = 0;

  if (!difficultyOrder) {
    difficultyOrder = shuffleDifficulties();
  }

  const difficulty = difficultyOrder[questionNumber - 1] || 'medium';
  const cacheKey = `${topic}:${difficulty}:${questionNumber}`;

  // Check cache first
  const cachedQuestion = cache.get(cacheKey);
  if (cachedQuestion) {
    logger.info('Returning cached question', { topic, difficulty, questionNumber });
    return cachedQuestion;
  }

  while (attempts < maxRetries) {
    attempts++;
    const randomSeed = getRandomSeed();
    const questionStyle = getRandomQuestionStyle(difficulty);

    const difficultyPrompts = {
      easy: `
        Create an EASY difficulty question that:
        - Tests basic knowledge or simple recall
        - Uses straightforward language
        - Has obvious correct answers
        - Covers fundamental concepts of the topic
      `,
      medium: `
        Create a MEDIUM difficulty question that:
        - Requires understanding and application of concepts
        - Tests comprehension beyond basic recall
        - May involve simple analysis or comparison
        - Covers intermediate concepts of the topic
      `,
      hard: `
        Create a HARD difficulty question that:
        - Requires critical thinking, analysis, or problem-solving
        - Tests deep understanding of complex concepts
        - May involve scenarios, evaluations, or synthesis
        - Covers advanced or specialized aspects of the topic
      `
    };

    const prompt = `
    Generate a ${difficulty.toUpperCase()} difficulty multiple choice question about "${topic}".
    
    CRITICAL REQUIREMENTS:
    1. Difficulty Level: ${difficulty.toUpperCase()}
    ${difficultyPrompts[difficulty]}
    2. Question Style: ${questionStyle}
    3. Random Seed: ${randomSeed}
    4. Question Length: EXACTLY 4-5 lines (approximately 200-350 characters)
    5. The question must be COMPLETELY DIFFERENT from these previously used questions:
    ${usedQuestions.length > 0 ? usedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'No previous questions'}
    
    FORMATTING REQUIREMENTS:
    - Question should be 4-5 lines long (not too short, not too long)
    - Use clear, concise language
    - Break longer sentences into multiple lines naturally
    - Ensure all 4 options are plausible and well-formatted
    - Make options concise but complete
    
    Return ONLY valid JSON in this exact format:
    {
      "question": "Your ${difficulty} difficulty question here (4-5 lines)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact correct option from above",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "questionType": "${questionStyle}",
      "questionNumber": ${questionNumber}
    }
    `;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024
        }
      });

      // Set timeout for API call (10 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API timeout')), 10000);
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      let text = result.response.text().replace(/```json|```/g, '').trim();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd);
      }

      const question = JSON.parse(text);

      // Validate question structure
      if (!question.question ||
          !Array.isArray(question.options) ||
          question.options.length !== 4 ||
          !question.correctAnswer ||
          !question.options.includes(question.correctAnswer)) {
        logger.warn('Gemini returned invalid question format', {
          topic,
          difficulty,
          attempt: attempts,
          question: question?.question || 'No question',
          optionsCount: question?.options?.length || 0,
          hasCorrectAnswer: !!question?.correctAnswer
        });
        continue;
      }

      const questionText = question.question.trim();
      const questionLength = questionText.length;
      const lineCount = questionText.split('\n').length;

      if (questionLength < 150 || questionLength > 400) {
        logger.warn('Question length not in desired range, retrying', {
          topic,
          difficulty,
          attempt: attempts,
          questionLength,
          desiredRange: '150-400 characters'
        });
        continue;
      }

      const questionTextLower = questionText.toLowerCase().trim();
      const isDuplicate = usedQuestions.some(used => {
        const usedText = used.toLowerCase().trim();
        if (questionTextLower === usedText) return true;
        const questionWords = questionTextLower.split(/\s+/).filter(word => word.length > 3);
        const usedWords = usedText.split(/\s+/).filter(word => word.length > 3);
        if (questionWords.length === 0 || usedWords.length === 0) return false;
        const commonWords = questionWords.filter(word =>
          usedWords.some(usedWord =>
            word.includes(usedWord) || usedWord.includes(word) ||
            (word.length > 4 && usedWord.length > 4 &&
             word.substring(0, 4) === usedWord.substring(0, 4))
          )
        );
        const similarity = commonWords.length / Math.max(questionWords.length, usedWords.length);
        return similarity > 0.5;
      });

      if (isDuplicate) {
        logger.warn('Generated question is too similar to existing ones, retrying', {
          topic,
          difficulty,
          attempt: attempts,
          question: question.question,
          similarityCheck: 'failed'
        });
        continue;
      }

      const difficultyValidation = validateDifficultyLevel(questionText, difficulty);
      if (!difficultyValidation.valid) {
        logger.warn('Question difficulty validation failed, retrying', {
          topic,
          difficulty,
          attempt: attempts,
          question: question.question,
          reason: difficultyValidation.reason
        });
        continue;
      }

      // Cache the valid question
      cache.set(cacheKey, question);
      logger.info('Question generated and cached successfully', {
        topic,
        difficulty,
        questionType: questionStyle,
        questionNumber,
        attempt: attempts,
        questionLength,
        lineCount
      });

      return question;

    } catch (error) {
      logger.error('Error in generateQuestion', {
        error: error.message,
        topic,
        difficulty,
        attempt: attempts,
        questionStyle,
        randomSeed
      });

      if (attempts < maxRetries && (error.message.includes('JSON') || error.message.includes('parse') || error.message.includes('timeout'))) {
        logger.info('Retrying question generation', { topic, difficulty, attempt: attempts });
        continue;
      }

      // Return fallback question on final failure
      logger.warn('Returning fallback question after max retries', { topic, difficulty, questionNumber });
      return { ...fallbackQuestions[difficulty], questionNumber };
    }
  }

  // Fallback if all retries fail
  logger.error('Failed to generate question after max retries', { topic, difficulty, questionNumber });
  return { ...fallbackQuestions[difficulty], questionNumber };
}

function validateDifficultyLevel(questionText, expectedDifficulty) {
  const text = questionText.toLowerCase();
  const easyIndicators = [
    'what is', 'which is', 'define', 'name the', 'identify', 'list',
    'basic', 'simple', 'fundamental', 'primary'
  ];
  const mediumIndicators = [
    'explain', 'describe', 'compare', 'contrast', 'how does', 'why does',
    'relationship', 'difference', 'similarity', 'application', 'example'
  ];
  const hardIndicators = [
    'analyze', 'evaluate', 'synthesize', 'critique', 'assess', 'justify',
    'scenario', 'complex', 'advanced', 'implications', 'consequences',
    'predict', 'recommend', 'optimize', 'design'
  ];

  const easyCount = easyIndicators.filter(indicator => text.includes(indicator)).length;
  const mediumCount = mediumIndicators.filter(indicator => text.includes(indicator)).length;
  const hardCount = hardIndicators.filter(indicator => text.includes(indicator)).length;

  switch (expectedDifficulty) {
    case 'easy':
      if (easyCount > 0 || (mediumCount === 0 && hardCount === 0 && text.length < 250)) {
        return { valid: true };
      }
      return { valid: false, reason: 'Question appears too complex for easy level' };
    case 'medium':
      if (mediumCount > 0 || (easyCount === 0 && hardCount === 0)) {
        return { valid: true };
      }
      return { valid: false, reason: 'Question not appropriate for medium level' };
    case 'hard':
      if (hardCount > 0 || (text.length > 300 && (mediumCount > 0 || easyCount === 0))) {
        return { valid: true };
      }
      return { valid: false, reason: 'Question appears too simple for hard level' };
    default:
      return { valid: true };
  }
}

async function verifyAnswer(question, answer) {
  try {
    if (!answer || !question.correctAnswer) {
      return false;
    }
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = question.correctAnswer.trim().toLowerCase();
    return userAnswer === correctAnswer;
  } catch (error) {
    logger.error('Error verifying answer', {
      question: question?.question || 'No question',
      answer,
      error: error.message
    });
    return false;
  }
}

module.exports = { generateQuestion, verifyAnswer, shuffleDifficulties };