import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Button } from '@mui/material';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is WitWizHub?',
          answer: 'WitWizHub is a vibrant community platform where users can engage in discussions, ask questions, and share knowledge in an interactive environment.',
        },
        {
          question: 'How do I join WitWizHub?',
          answer: 'Sign up with your email and a password on the login page. Once registered, you can access the forum to post messages and questions.',
        },
      ],
    },
    {
      category: 'Account',
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox to reset your password.',
        },
        {
          question: 'Can I change my username?',
          answer: 'Yes, you can update your username in the account settings. Ensure it’s between 3 and 100 characters.',
        },
      ],
    },
    {
      category: 'Support',
      questions: [
        {
          question: 'How do I contact support?',
          answer: 'Visit our Contact Us page to send a message or email us at support@witwizhub.com.',
        },
        {
          question: 'What should I do if I encounter a bug?',
          answer: 'Report bugs via the Contact Us page or email support@witwizhub.com with details and screenshots for faster resolution.',
        },
      ],
    },
  ];

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (category) =>
        (activeCategory === 'All' || category.category === activeCategory) &&
        category.questions.length > 0
    );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const answerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#1E1B4B] py-12 px-4 sm:px-6 lg:px-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-extrabold text-[#2DD4BF] text-center mb-8 bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] bg-clip-text text-transparent"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-center text-[#E5E7EB] text-lg mb-8"
        >
          Find answers to common questions or use the search bar to explore.
        </motion.p>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <TextField
            fullWidth
            label="Search FAQs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputLabelProps={{ className: 'text-[#E5E7EB]' }}
            InputProps={{
              className: 'text-[#E5E7EB] bg-[#2C2A6B]/50 rounded-lg',
              sx: {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2DD4BF' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#A855F7' },
              },
            }}
            className="backdrop-blur-sm"
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {['All', ...faqs.map((cat) => cat.category)].map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold text-[#E5E7EB] transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] shadow-lg'
                  : 'bg-[#2C2A6B] hover:bg-[#A855F7]/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQs */}
        <div className="space-y-6">
          {filteredFaqs.map((category, catIndex) => (
            <motion.div key={catIndex} variants={itemVariants}>
              <h3 className="text-2xl font-semibold text-[#EC4899] mb-4">
                {category.category}
              </h3>
              {category.questions.map((faq, index) => {
                const globalIndex = `${catIndex}-${index}`;
                return (
                  <motion.div
                    key={globalIndex}
                    variants={itemVariants}
                    className="bg-[#2C2A6B]/80 rounded-lg shadow-lg border border-[#2DD4BF]/20 overflow-hidden backdrop-blur-sm hover:shadow-[#2DD4BF]/30 transition-shadow duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <button
                      onClick={() => toggleFAQ(globalIndex)}
                      className="w-full text-left p-5 flex justify-between items-center text-[#E5E7EB] hover:bg-[#A855F7]/10 transition-colors duration-300"
                      aria-expanded={openIndex === globalIndex}
                      aria-controls={`faq-answer-${globalIndex}`}
                    >
                      <span className="text-lg font-semibold">{faq.question}</span>
                      <motion.span
                        animate={{ rotate: openIndex === globalIndex ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-[#2DD4BF] text-xl"
                      >
                        ▼
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openIndex === globalIndex && (
                        <motion.div
                          variants={answerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          id={`faq-answer-${globalIndex}`}
                          className="p-5 text-[#D1D5DB] bg-[#1E1B4B]/80 border-t border-[#2DD4BF]/20"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
          {filteredFaqs.length === 0 && (
            <motion.p
              variants={itemVariants}
              className="text-center text-[#E5E7EB] text-lg"
            >
              No FAQs found matching your search.
            </motion.p>
          )}
        </div>

        {/* Back to Top Button */}
        <motion.div
          variants={itemVariants}
          className="fixed bottom-8 right-8"
        >
          <Button
            onClick={scrollToTop}
            variant="contained"
            className="bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-white font-bold rounded-full shadow-lg hover:from-[#14B8A6] hover:to-[#9333EA] transition-all duration-300"
            sx={{ padding: '12px 24px' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Back to Top
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;