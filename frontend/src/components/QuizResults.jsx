import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const QuizResults = ({ score, total, wrongTopics, revisionSheet, questions, answers, onRetake }) => {
  const [showPerformance, setShowPerformance] = useState(false);
  const [showRevision, setShowRevision] = useState(false);

  const percentage = Math.round((score / total) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return 'from-green-400 to-emerald-500';
    if (percentage >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getScoreEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🎉';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '😊';
    return '💪';
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Outstanding Performance!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 70) return 'Great Job!';
    if (percentage >= 60) return 'Good Effort!';
    return 'Keep Practicing!';
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
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateX: -90
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateX: 90,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <motion.div
        className="w-full max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Results Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="text-8xl mb-4"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            {getScoreEmoji()}
          </motion.div>
          
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Quiz Complete!
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300"
          >
            {getScoreMessage()}
          </motion.p>
        </motion.div>

        {/* Main Results Card */}
        <motion.div
          variants={itemVariants}
          className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl mb-8"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-0.5">
            <div className="h-full w-full rounded-3xl bg-slate-900/90 backdrop-blur-xl"></div>
          </div>

          <div className="relative z-10">
            {/* Score Display */}
            <div className="text-center mb-8">
              <motion.div
                className="relative inline-block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  bounce: 0.5
                }}
              >
                {/* Circular Progress */}
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: percentage / 100 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                      strokeDasharray: "283",
                      strokeDashoffset: 0,
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    {percentage}%
                  </motion.div>
                  <motion.div
                    className="text-2xl text-gray-300 font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    {score}/{total}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Wrong Topics */}
            {wrongTopics && wrongTopics.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
              >
                <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Topics to Review
                </h3>
                <div className="flex flex-wrap gap-2">
                  {wrongTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                variants={itemVariants}
                onClick={() => setShowPerformance(true)}
                className="group relative overflow-hidden p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold text-white mb-1">Performance</h3>
                  <p className="text-sm text-gray-400">Detailed breakdown</p>
                </div>
              </motion.button>

              <motion.button
                variants={itemVariants}
                onClick={() => setShowRevision(true)}
                className="group relative overflow-hidden p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="font-semibold text-white mb-1">Study Guide</h3>
                  <p className="text-sm text-gray-400">Revision materials</p>
                </div>
              </motion.button>

              <motion.button
                variants={itemVariants}
                onClick={() => {
                  // Add a small delay for visual feedback before retaking
                  setTimeout(() => {
                    if (onRetake) onRetake();
                  }, 300);
                }}
                className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <motion.div 
                    className="text-3xl mb-2"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    🔄
                  </motion.div>
                  <h3 className="font-semibold mb-1">Retake Quiz</h3>
                  <p className="text-sm opacity-90">Start over with new questions</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Performance Modal */}
      <AnimatePresence>
        {showPerformance && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPerformance(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-0.5">
                  <div className="h-full w-full rounded-3xl bg-slate-900/90 backdrop-blur-xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      Performance Details
                    </h3>
                    <button
                      onClick={() => setShowPerformance(false)}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {questions && questions.length > 0 ? (
                      questions.map((q, i) => {
                        const isCorrect = answers[i] === q.correctAnswer;
                        return (
                          <motion.div
                            key={i}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                              isCorrect 
                                ? 'border-green-500/50 bg-green-500/10' 
                                : 'border-red-500/50 bg-red-500/10'
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                isCorrect ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                {isCorrect ? '✓' : '✗'}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-200 mb-3 font-medium">
                                  <span className="text-cyan-400 font-semibold">Q{i + 1}:</span> {q.question}
                                </p>
                                <div className="space-y-2">
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-purple-400">Your Answer:</span> {answers[i] || 'Not answered'}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-green-400">Correct Answer:</span> {q.correctAnswer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-red-400 text-center py-8">No performance data available.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revision Modal */}
      <AnimatePresence>
        {showRevision && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRevision(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-0.5">
                  <div className="h-full w-full rounded-3xl bg-slate-900/90 backdrop-blur-xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      Study Guide
                    </h3>
                    <button
                      onClick={() => setShowRevision(false)}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <motion.div
                    className="prose prose-invert max-w-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">
                              {children}
                            </a>
                          ),
                          p: ({ children }) => <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>,
                          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="text-purple-300">{children}</em>,
                          code: ({ children }) => <code className="bg-white/10 text-cyan-300 px-2 py-1 rounded text-sm">{children}</code>,
                          pre: ({ children }) => <pre className="bg-white/10 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                        }}
                      >
                        {revisionSheet}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuizResults;