import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChatSection from '../components/ChatSection';
import QuestionSection from '../components/QuestionSection';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Forum = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const isLoggedIn = !!localStorage.getItem('jwtToken');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <>
      <section className="min-h-screen bg-gradient-dark flex flex-col items-center py-12 px-4">
        <motion.h1
          className="text-4xl font-bold text-teal-400 mb-6 text-center tracking-tight"
          style={{ fontSize: '1.25rem' }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          WitWizHub Forum
        </motion.h1>
        <motion.nav
          className="w-full max-w-4xl bg-gray-800 rounded-xl p-4 mb-8 flex justify-center space-x-6"
          style={{ backgroundColor: '#E5E7EB' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'chat' ? 'text-pink-500' : 'text-black'
            } hover:text-pink-500`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('question')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'question' ? 'text-pink-500' : 'text-black'
            } hover:text-pink-500`}
          >
            Question
          </button>
          {!isLoggedIn && (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-lg font-medium transition-colors ${
                  isActive ? 'text-pink-500' : 'text-black'
                } hover:text-pink-500`
              }
            >
              Login
            </NavLink>
          )}
        </motion.nav>
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {activeTab === 'chat' ? <ChatSection /> : <QuestionSection />}
        </motion.div>
      </section>
      <ToastContainer />
    </>
  );
};

export default Forum;