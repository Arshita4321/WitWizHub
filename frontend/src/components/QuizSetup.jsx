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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'from-green-400 to-emerald-500', icon: '😊' },
    { value: 'medium', label: 'Medium', color: 'from-yellow-400 to-orange-500', icon: '🤔' },
    { value: 'hard', label: 'Hard', color: 'from-red-400 to-pink-500', icon: '😤' }
  ];

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.h1
          className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundSize: "200% 200%"
          }}
        >
          Quiz Master
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-300 font-light"
        >
          Create your personalized quiz experience
        </motion.p>
      </motion.div>

      {/* Main Form Container */}
      <motion.form
        onSubmit={handleSubmit}
        variants={itemVariants}
        className="relative"
      >
        {/* Glassmorphism Card */}
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-0.5">
            <div className="h-full w-full rounded-3xl bg-slate-900/80 backdrop-blur-xl"></div>
          </div>
          
          <div className="relative z-10 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {/* Subject Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-gray-200 text-sm font-semibold uppercase tracking-wider">
                Subject
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  placeholder="e.g., Mathematics, Science, History..."
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20 opacity-0 transition-opacity duration-300 pointer-events-none focus-within:opacity-100"></div>
              </div>
            </motion.div>

            {/* Topics Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-gray-200 text-sm font-semibold uppercase tracking-wider">
                Topics
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  placeholder="e.g., Algebra, Geometry, Calculus..."
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-500/20 opacity-0 transition-opacity duration-300 pointer-events-none focus-within:opacity-100"></div>
              </div>
              <p className="text-xs text-gray-400">Separate multiple topics with commas</p>
            </motion.div>

            {/* Questions Count */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="block text-gray-200 text-sm font-semibold uppercase tracking-wider">
                Number of Questions
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                  min="1"
                  max="20"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/20 to-red-500/20 opacity-0 transition-opacity duration-300 pointer-events-none focus-within:opacity-100"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Min: 1</span>
                <span>Max: 20</span>
              </div>
            </motion.div>

            {/* Difficulty Level */}
            <motion.div variants={itemVariants} className="space-y-4">
              <label className="block text-gray-200 text-sm font-semibold uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {difficultyLevels.map((difficulty) => (
                  <motion.button
                    key={difficulty.value}
                    type="button"
                    onClick={() => setLevel(difficulty.value)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      level === difficulty.value
                        ? 'border-white/50 scale-105'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    whileHover={{ scale: level === difficulty.value ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${difficulty.color} ${
                      level === difficulty.value ? 'opacity-30' : 'opacity-10'
                    } transition-opacity duration-300`}></div>
                    <div className="relative text-center">
                      <div className="text-2xl mb-2">{difficulty.icon}</div>
                      <div className="text-white font-semibold">{difficulty.label}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              variants={itemVariants}
              className="w-full relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:blur-sm"></div>
              <div className="relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-lg">
                <div className="flex items-center justify-center space-x-2">
                  <span>Generate Quiz</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.form>

      {/* Decorative Elements */}
      <motion.div
        className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};

export default QuizSetup;