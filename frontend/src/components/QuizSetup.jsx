import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuizSetup = ({ onQuizGenerated }) => {
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [level, setLevel] = useState('easy');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const topicsArray = topics.split(',').map(t => t.trim()).filter(t => t);
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (topicsArray.length === 0) {
      setError('At least one topic is required');
      return;
    }
    if (numQuestions < 1) {
      setError('Number of questions must be at least 1');
      return;
    }

    onQuizGenerated(subject, topicsArray, numQuestions, level);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-[#0F172A] p-8 rounded-xl shadow-2xl border border-[#2DD4BF]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
    >
      <motion.h2
        className="text-3xl font-['Dancing Script'] text-[#A855F7] mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Dream Your Quiz
      </motion.h2>
      {error && <p className="text-[#EC4899] mb-4 text-center">{error}</p>}
      <div className="mb-4">
        <label className="block text-[#D1D5DB] mb-2">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 bg-[#1E1B4B] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-[#D1D5DB] mb-2">Topics (comma-separated)</label>
        <input
          type="text"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="w-full p-2 bg-[#1E1B4B] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-[#D1D5DB] mb-2">Number of Questions</label>
        <input
          type="number"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          className="w-full p-2 bg-[#1E1B4B] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          min="1"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-[#D1D5DB] mb-2">Difficulty Level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-2 bg-[#1E1B4B] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <motion.button
        type="submit"
        className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-white p-2 rounded hover:opacity-90 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Generate Quiz
      </motion.button>
    </motion.form>
  );
};

export default QuizSetup;