import React, { useState } from 'react';
import QuizSetup from '../components/QuizSetup';
import Loading from '../components/Loading';
import QuizPage from '../components/QuizPage';
import QuizResults from '../components/QuizResults';
import { getQuizQuestions, submitQuiz } from '../api/quizApi';
import { motion } from 'framer-motion';

const Quiz = () => {
  const [questions, setQuestions] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuizGenerated = async (subject, topics, numQuestions, level) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwtToken');
      const { questions } = await getQuizQuestions(subject, topics, numQuestions, level, token);
      setQuestions(questions);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
      setLoading(false);
    }
  };

  const handleSubmit = async (answers) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) throw new Error('Please log in to submit quiz');
      const data = await submitQuiz(questions, answers, token);
      setResults({ ...data, questions, answers }); // Pass questions and answers
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] p-8 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {loading && <Loading />}
      {error && (
        <motion.p
          className="text-[#EC4899] text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>
      )}
      {!questions && !results && (
        <QuizSetup onQuizGenerated={handleQuizGenerated} />
      )}
      {questions && !results && (
        <QuizPage questions={questions} onSubmit={handleSubmit} />
      )}
      {results && <QuizResults {...results} />}
    </motion.div>
  );
};

export default Quiz;