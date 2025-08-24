import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const QuizResults = ({ score, total, wrongTopics, revisionSheet, questions, answers }) => {
  const [showPerformance, setShowPerformance] = useState(false);
  const [showRevision, setShowRevision] = useState(false);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-[#1E1B4B]/80 p-8 rounded-2xl shadow-2xl border-2 border-transparent max-w-lg w-full backdrop-blur-md"
        style={{ borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1' }}
        variants={itemVariants}
      >
        <motion.h2
          className="text-4xl font-['Dancing Script'] text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] mb-6 text-center"
          variants={itemVariants}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.8, rotate: { repeat: 1, duration: 0.5 } }}
        >
          Quiz Results
        </motion.h2>
        <motion.div
          className="text-3xl text-[#10B981] text-center mb-4 flex items-center justify-center"
          variants={itemVariants}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <span className="mr-2">Score:</span>
          <motion.span
            className="inline-block"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.3, repeat: 2 }}
          >
            {score} / {total}
          </motion.span>
        </motion.div>
        <motion.p
          className="text-[#D1D5DB] text-center mb-6"
          variants={itemVariants}
        >
          Wrong Topics: {wrongTopics.join(', ') || 'None'}
        </motion.p>
        <motion.button
          onClick={() => setShowPerformance(true)}
          className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-white p-4 rounded-lg mb-4 hover:opacity-90 transition shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          Show Performance
        </motion.button>
        <motion.button
          onClick={() => setShowRevision(true)}
          className="w-full bg-[#EC4899] text-white p-4 rounded-lg hover:opacity-90 transition shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          Revision Sheet
        </motion.button>

        {showPerformance && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-[#1E1B4B]/80 p-8 rounded-2xl shadow-2xl max-w-lg w-full border-2 border-transparent backdrop-blur-md max-h-[80vh] overflow-y-auto"
              style={{ borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1' }}
              variants={modalVariants}
            >
              <motion.h3
                className="text-2xl font-['Dancing Script'] text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] mb-4 text-center"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Performance Details
              </motion.h3>
              <div className="space-y-4">
                {questions && questions.length > 0 ? (
                  questions.map((q, i) => (
                    <motion.div
                      key={i}
                      className="p-4 rounded-lg shadow-md bg-[#0F172A]/80 border border-[#2DD4BF]/50"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <p className="text-[#D1D5DB] mb-2">{q.question}</p>
                      <p className="text-[#E5E7EB] mb-1">Your Answer: {answers[i] || 'Not answered'}</p>
                      <p className="text-[#E5E7EB] mb-1">Correct Answer: {q.correctAnswer}</p>
                      <p className={answers[i] === q.correctAnswer ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                        {answers[i] === q.correctAnswer ? 'Correct' : 'Wrong'}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[#EF4444] text-center">No performance data available.</p>
                )}
              </div>
              <motion.button
                onClick={() => setShowPerformance(false)}
                className="w-full bg-[#EC4899] text-white p-2 rounded mt-4 hover:opacity-90 transition shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showRevision && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-[#1E1B4B]/80 p-8 rounded-2xl shadow-2xl max-w-lg w-full border-2 border-transparent backdrop-blur-md max-h-[80vh] overflow-y-auto"
              style={{ borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1' }}
              variants={modalVariants}
            >
              <motion.h3
                className="text-2xl font-['Dancing Script'] text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] mb-4 text-center"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Revision Sheet
              </motion.h3>
              <motion.div
                className="text-[#D1D5DB] whitespace-pre-wrap p-4 bg-[#0F172A]/80 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#2DD4BF] hover:underline">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {revisionSheet}
                </ReactMarkdown>
              </motion.div>
              <motion.button
                onClick={() => setShowRevision(false)}
                className="w-full bg-[#EC4899] text-white p-2 rounded mt-4 hover:opacity-90 transition shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuizResults;