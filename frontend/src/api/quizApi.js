// src/api/quizApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getQuizQuestions = async (subject, topics, numQuestions, level, token) => {
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subject, topics, numQuestions, level }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate quiz');
  }

  return response.json();
};

export const submitQuiz = async (questions, answers, token) => {
  const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ questions, answers }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit quiz');
  }

  return response.json();
};