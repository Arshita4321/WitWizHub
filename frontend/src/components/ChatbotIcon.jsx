import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

const ChatbotIcon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsAuthenticated(!!token);
    console.log('ChatbotIcon: isAuthenticated:', !!token, 'Path:', location.pathname);
  }, [location.pathname]);

  // Hide on /quiz, /login, and /signup pages
  const hiddenPages = ['/quiz', '/login', '/signup'];
  const isHidden = hiddenPages.includes(location.pathname);

  useEffect(() => {
    if (isHidden) {
      console.log('ChatbotIcon hidden on:', location.pathname);
    } else {
      console.log('ChatbotIcon visible on:', location.pathname);
    }
  }, [location.pathname, isHidden]);

  // Only render if authenticated and not on hidden pages
  if (isHidden || !isAuthenticated) {
    return null;
  }

  return (
    <motion.button
      onClick={() => {
        console.log('Chatbot icon clicked, navigating to /chatbot');
        navigate('/chatbot');
      }}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] p-4 rounded-full shadow-2xl text-white hover:opacity-90 transition z-[2000]"
      whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 25px rgba(168, 85, 247, 0.7)' }}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 10px rgba(168, 85, 247, 0.3)', '0 0 20px rgba(168, 85, 247, 0.5)', '0 0 10px rgba(168, 85, 247, 0.3)'] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
    >
      <FaRobot className="text-4xl" />
    </motion.button>
  );
};

export default ChatbotIcon;