import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSection from '../components/ChatSection';
import QuestionSection from '../components/QuestionSection';
import { MessageCircle, HelpCircle, Sparkles, Users, TrendingUp, Zap, Star } from 'lucide-react';
import { API_BASE_URL } from "../config/api.js";

// Define API base URL using environment variable (same pattern as Login/Chatbot/ContactUs)


// You can optionally pass API_BASE_URL down to children if needed in the future:
// <ChatSection apiBaseUrl={API_BASE_URL} />
// <QuestionSection apiBaseUrl={API_BASE_URL} />

const Forum = () => {
  const [activeTab, setActiveTab] = useState('chat');

  // Enhanced floating elements with more variety
  const floatingElements = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
    size: 0.5 + Math.random() * 1.5,
    color: i % 3 === 0 ? 'teal' : i % 3 === 1 ? 'purple' : 'blue',
  }));

  const pulsingShapes = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    delay: Math.random() * 4,
    size: 20 + Math.random() * 40,
  }));

  const tabVariants = {
    inactive: { 
      scale: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(15px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    active: { 
      scale: 1.02,
      backgroundColor: 'rgba(45, 212, 191, 0.25)',
      backdropFilter: 'blur(25px)',
      boxShadow: '0 8px 40px rgba(45, 212, 191, 0.3)',
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      x: activeTab === 'chat' ? -60 : 60, 
      scale: 0.92,
      rotateY: activeTab === 'chat' ? -15 : 15,
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.8,
        opacity: { duration: 0.6 }
      }
    },
    exit: { 
      opacity: 0, 
      x: activeTab === 'chat' ? 60 : -60, 
      scale: 0.92,
      rotateY: activeTab === 'chat' ? 15 : -15,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className={`absolute rounded-full opacity-30 bg-gradient-to-r ${
              element.color === 'teal' ? 'from-teal-400 to-cyan-300' :
              element.color === 'purple' ? 'from-purple-400 to-pink-300' :
              'from-blue-400 to-indigo-300'
            }`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size * 8}px`,
              height: `${element.size * 8}px`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.sin(element.id) * 20, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Pulsing background shapes */}
        {pulsingShapes.map((shape) => (
          <motion.div
            key={`pulse-${shape.id}`}
            className="absolute rounded-full bg-gradient-to-r from-teal-500/10 to-purple-500/10 backdrop-blur-sm"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: shape.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-teal-900/20" />
      
      <div className="relative z-10 flex flex-col items-center py-8 px-4">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center mb-6 relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-10 h-10 text-teal-400 mr-4" />
            </motion.div>
            <motion.h1 
              className="text-6xl font-bold bg-gradient-to-r from-teal-400 via-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% 200%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              WitWizHub Forum
            </motion.h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-10 h-10 text-purple-400 ml-4" />
            </motion.div>

            {/* Decorative elements around title */}
            <motion.div
              className="absolute -top-4 -left-4 w-3 h-3 bg-teal-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -right-4 w-2 h-2 bg-purple-400 rounded-full"
              animate={{ scale: [1, 2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
          
          <motion.p 
            className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Connect, share, and grow with our vibrant community of learners and innovators
          </motion.p>

          {/* Subtitle enhancement */}
          <motion.div
            className="flex justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <motion.div
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500/20 to-purple-500/20 backdrop-blur-md rounded-full border border-white/10"
              whileHover={{ scale: 1.05, borderColor: 'rgba(45, 212, 191, 0.5)' }}
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300 font-medium">Powered by Innovation</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Bar */}
        <motion.div 
          className="flex justify-center space-x-6 mb-12"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {[
            { icon: Users, label: "Active Users", value: "21", color: "from-green-400 to-emerald-400" },
            { icon: MessageCircle, label: "Messages", value: "300+", color: "from-blue-400 to-cyan-400" },
            { icon: TrendingUp, label: "Growth", value: "+15%", color: "from-purple-400 to-pink-400" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
            >
              <motion.div
                className="flex items-center space-x-3 px-6 py-4 bg-white/8 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl"
                whileHover={{ 
                  scale: 1.08, 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`p-2 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <span className="text-gray-300 text-sm font-medium block">{stat.label}</span>
                  <span className="text-white font-bold text-lg">{stat.value}</span>
                </div>
              </motion.div>
              
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                style={{ zIndex: -1 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          className="relative p-2 bg-white/8 backdrop-blur-2xl rounded-3xl mb-12 shadow-2xl border border-white/20"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex space-x-3">
            {[
              { id: 'chat', label: 'Live Chat', icon: MessageCircle, gradient: 'from-teal-500 to-cyan-500' },
              { id: 'question', label: 'Q&A Hub', icon: HelpCircle, gradient: 'from-purple-500 to-pink-500' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-500 overflow-hidden ${
                  activeTab === tab.id
                    ? 'text-white shadow-2xl'
                    : 'text-gray-300 hover:text-white'
                }`}
                variants={tabVariants}
                animate={activeTab === tab.id ? 'active' : 'inactive'}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className={`p-2 rounded-xl bg-gradient-to-r ${tab.gradient} ${
                    activeTab === tab.id ? 'shadow-lg' : 'opacity-60'
                  }`}
                  whileHover={{ rotate: 10 }}
                >
                  <tab.icon className="w-5 h-5 text-white" />
                </motion.div>
                <span className="relative z-10 text-lg">{tab.label}</span>
                
                {activeTab === tab.id && (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-500/30 to-purple-500/30 rounded-2xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Content Area */}
        <div className="w-full max-w-7xl perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full transform-gpu"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {activeTab === 'chat' ? <ChatSection /> : <QuestionSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
      
      {/* Corner decorations */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 border-2 border-teal-400/30 rounded-full"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-16 h-16 border-2 border-purple-400/30 rounded-full"
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default Forum;