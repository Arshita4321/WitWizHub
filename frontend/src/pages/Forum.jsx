import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSection from '../components/ChatSection';
import QuestionSection from '../components/QuestionSection';
import { MessageCircle, HelpCircle, Sparkles, Users, TrendingUp, Zap, Star } from 'lucide-react';
import { API_BASE_URL } from "../config/api.js";
import { DESIGN_TOKENS } from '../styles/designTokens';

const T = DESIGN_TOKENS.colors;
const typography = DESIGN_TOKENS.typography;
const spacing = DESIGN_TOKENS.spacing;
const borderRadius = DESIGN_TOKENS.borderRadius;
const shadows = DESIGN_TOKENS.shadows;

// Define API base URL using environment variable (same pattern as Login/Chatbot/ContactUs)


// You can optionally pass API_BASE_URL down to children if needed in the future:
// <ChatSection apiBaseUrl={API_BASE_URL} />
// <QuestionSection apiBaseUrl={API_BASE_URL} />

const Forum = () => {
  const [activeTab, setActiveTab] = useState('chat');


  const tabVariants = {
    inactive: { 
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    active: { 
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, ' + T.bg + ' 0%, #1a1f3c 50%, ' + T.bg + ' 100%)' }}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to-t, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
      
      <div className="relative z-10 flex flex-col items-center py-8 px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, ' + T.accent + ' 0%, ' + T.success + ' 100%)',
              padding: spacing[2],
              borderRadius: borderRadius.md,
              marginRight: spacing[3],
              boxShadow: shadows.md
            }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              WitWizHub Forum
            </h1>
            <div style={{ 
              background: 'linear-gradient(135deg, ' + T.warning + ' 0%, ' + T.danger + ' 100%)',
              padding: spacing[2],
              borderRadius: borderRadius.md,
              marginLeft: spacing[3],
              boxShadow: shadows.md
            }}>
              <Star className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <motion.p 
            className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Connect, share, and grow with our community of learners and innovators
          </motion.p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="flex justify-center space-x-6 mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {[
            { icon: Users, label: "Active Users", value: "21", color: "from-teal-400 to-emerald-400" },
            { icon: MessageCircle, label: "Messages", value: "300+", color: "from-blue-400 to-cyan-400" },
            { icon: TrendingUp, label: "Growth", value: "+15%", color: "from-purple-400 to-pink-400" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
            >
              <motion.div
                className="flex items-center space-x-3 px-5 py-3 rounded-xl border"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderColor: T.borderHi
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  scale: 1.03,
                  borderColor: T.accent,
                  boxShadow: shadows.lg
                }}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-gray-400 text-xs font-medium block">{stat.label}</span>
                  <span className="text-white font-semibold">{stat.value}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="relative p-2 rounded-2xl mb-12 border"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(10px)',
            borderColor: T.borderHi
          }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex space-x-2">
            {[
              { id: 'chat', label: 'Live Chat', icon: MessageCircle, gradient: 'from-teal-500 to-cyan-500' },
              { id: 'question', label: 'Q&A Hub', icon: HelpCircle, gradient: 'from-purple-500 to-pink-500' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                variants={tabVariants}
                animate={activeTab === tab.id ? 'active' : 'inactive'}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${tab.gradient} ${
                  activeTab === tab.id ? '' : 'opacity-50'
                }`}>
                  <tab.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-base">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="w-full max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              {activeTab === 'chat' ? <ChatSection /> : <QuestionSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to-t, ' + T.bg + ' 0%, transparent 100%)' }} />
    </div>
  );
};

export default Forum;