import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
      alert('Please select an answer');
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onSubmit(answers);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] p-8 rounded-xl shadow-2xl border-2 border-transparent border-image-linear-gradient-to-right-teal-purple backdrop-blur-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-3xl font-['Dancing Script'] text-[#A855F7] mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Question {currentIndex + 1} of {questions.length}
      </motion.h2>
      <motion.p
        className="text-[#D1D5DB] mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {questions[currentIndex].question}
      </motion.p>
      <div className="space-y-4">
        {questions[currentIndex].options.map((opt, j) => (
          <motion.button
            key={j}
            onClick={() => handleChange(opt)}
            className={`w-full p-4 rounded-lg text-left transition ${answers[currentIndex] === opt ? 'bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-white' : 'bg-[#1E1B4B] text-[#E5E7EB] hover:bg-[#4B5563]'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: j * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      <motion.button
        onClick={handleNext}
        className="w-full bg-[#EC4899] text-white p-4 rounded-lg mt-6 hover:bg-[#F87171] transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentIndex < questions.length - 1 ? 'Next' : 'Submit'}
      </motion.button>
    </motion.div>
  );
};

export default QuizPage;