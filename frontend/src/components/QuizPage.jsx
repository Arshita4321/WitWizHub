import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizPage = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentIndex]) {
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onSubmit(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.3 }
    },
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header with Progress */}
      <div className="text-center mb-8">
        <motion.h2
          className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
          key={currentIndex}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Question {currentIndex + 1} of {questions.length}
        </motion.h2>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-white/10 rounded-full mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20"></div>
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Main Quiz Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-0.5">
            <div className="h-full w-full rounded-3xl bg-slate-900/90 backdrop-blur-xl"></div>
          </div>

          <div className="relative z-10">
            {/* Question */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  Q
                </div>
                <p className="text-xl text-gray-200 leading-relaxed font-medium">
                  {questions[currentIndex].question}
                </p>
              </div>
            </motion.div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {questions[currentIndex].options.map((option, optionIndex) => {
                const isSelected = answers[currentIndex] === option;
                const optionLetter = String.fromCharCode(65 + optionIndex);
                
                return (
                  <motion.button
                    key={optionIndex}
                    custom={optionIndex}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleChange(option)}
                    className={`w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-white/50 shadow-xl'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-300 ${
                      isSelected
                        ? 'from-cyan-500/30 via-purple-500/30 to-pink-500/30 opacity-100'
                        : 'from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100'
                    }`}></div>
                    
                    {/* Shimmer Effect */}
                    <div className={`absolute inset-0 -skew-x-12 ${
                      isSelected ? 'animate-pulse' : ''
                    } bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer`}></div>

                    <div className="relative p-6 flex items-center space-x-4">
                      {/* Option Letter */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg scale-110'
                          : 'bg-white/10 text-gray-300 group-hover:bg-white/20'
                      }`}>
                        {optionLetter}
                      </div>
                      
                      {/* Option Text */}
                      <div className={`text-left flex-1 transition-colors duration-300 ${
                        isSelected ? 'text-white font-semibold' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {option}
                      </div>

                      {/* Selection Indicator */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-cyan-400 bg-gradient-to-r from-cyan-400 to-purple-500'
                          : 'border-gray-400 group-hover:border-white'
                      }`}>
                        {isSelected && (
                          <motion.svg
                            className="w-full h-full text-white p-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <motion.button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  currentIndex === 0
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
                whileHover={currentIndex > 0 ? { scale: 1.05 } : {}}
                whileTap={currentIndex > 0 ? { scale: 0.95 } : {}}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span>Previous</span>
                </div>
              </motion.button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500 scale-125'
                        : answers[index]
                        ? 'bg-green-400'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                onClick={handleNext}
                disabled={!answers[currentIndex]}
                className={`relative group overflow-hidden px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  !answers[currentIndex]
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                whileHover={answers[currentIndex] ? { scale: 1.05 } : {}}
                whileTap={answers[currentIndex] ? { scale: 0.95 } : {}}
              >
                {answers[currentIndex] && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
                )}
                <div className="relative flex items-center space-x-2">
                  <span>
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                  </span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={answers[currentIndex] ? { x: [0, 4, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {currentIndex < questions.length - 1 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    )}
                  </motion.svg>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question Counter Cards */}
      <motion.div
        className="mt-8 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex space-x-2 bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          {questions.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white scale-110 shadow-lg'
                  : answers[index]
                  ? 'bg-green-500/30 text-green-200 hover:scale-105'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:scale-105'
              }`}
              whileHover={{ scale: index === currentIndex ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </motion.div>
  );
};

export default QuizPage;