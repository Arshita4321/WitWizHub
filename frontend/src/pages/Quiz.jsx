import React, { useState } from 'react';
import QuizSetup from '../components/QuizSetup';
import Loading from '../components/Loading';
import QuizPage from '../components/QuizPage';
import QuizResults from '../components/QuizResults';
import { getQuizQuestions, submitQuiz } from '../api/quizApi';
import { motion, AnimatePresence } from 'framer-motion';

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
      setResults({ ...data, questions, answers });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuestions(null);
    setResults(null);
    setError('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-red-400/50">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <Loading key="loading" />
          ) : !questions && !results ? (
            <QuizSetup key="setup" onQuizGenerated={handleQuizGenerated} />
          ) : questions && !results ? (
            <QuizPage key="quiz" questions={questions} onSubmit={handleSubmit} />
          ) : results ? (
            <QuizResults key="results" {...results} onRetake={handleRetakeQuiz} />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;

