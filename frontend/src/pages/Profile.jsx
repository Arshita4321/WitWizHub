import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaPlus, FaGraduationCap, FaCalendarAlt, FaTrophy, FaStar, FaBookOpen, FaChartLine } from 'react-icons/fa';
import '../styles/profile.css';

// Use environment variable (same pattern as your other components)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Generate floating particle positions
const generateParticlePositions = () => {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
    });
  }
  return particles;
};

// Generate watermark positions with slight randomization
const generateWatermarkPositions = () => {
  const positions = [];
  const rows = 4; // Reduced for cleaner look
  const cols = 5; // Reduced for cleaner look
  const spacingX = 100 / cols;
  const spacingY = 100 / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const randomOffsetX = (Math.random() - 0.5) * spacingX * 0.4;
      const randomOffsetY = (Math.random() - 0.5) * spacingY * 0.4;
      const size = 20 + Math.random() * 15; // Smaller, more subtle
      const rotation = (Math.random() - 0.5) * 30;
      positions.push({
        top: `${row * spacingY + spacingY / 2 + randomOffsetY}%`,
        left: `${col * spacingX + spacingX / 2 + randomOffsetX}%`,
        fontSize: `${size}px`,
        transform: `rotate(${rotation}deg)`,
      });
    }
  }
  return positions;
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [studyPlans, setStudyPlans] = useState({ current: [], completed: [] });
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [particles] = useState(generateParticlePositions());

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.log('No jwtToken found, redirecting to /login');
        toast.error('Please log in to view your profile');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile fetched:', response.data);
        setUser(response.data.user);
        setStudyPlans(response.data.studyPlans);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', {
          status: error.response?.status,
          message: error.response?.data?.error || error.message,
          details: error.response?.data?.details,
        });
        toast.error('Failed to load profile. Please try again.');
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  // Calculate statistics
  const totalPlans = studyPlans.current.length + studyPlans.completed.length;
  const avgProgress = studyPlans.current.length > 0 
    ? studyPlans.current.reduce((sum, plan) => sum + plan.progress, 0) / studyPlans.current.length 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0F0D2A] via-[#1E1B4B] to-[#0F172A] relative overflow-hidden">
        {/* Animated background particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] rounded-full opacity-20"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-[#2DD4BF] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-[#E5E7EB] text-2xl font-semibold">Loading your profile...</div>
          <div className="text-[#A855F7] text-sm mt-2">Preparing your study dashboard</div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-[#0F0D2A] via-[#1E1B4B] to-[#0F172A] text-[#E5E7EB] p-4 sm:p-6 lg:p-8 relative overflow-hidden"
    >
      {/* Animated background elements */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] rounded-full opacity-10"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Watermark Icons */}
      {generateWatermarkPositions().map((pos, index) => (
        <motion.i
          key={`watermark-${index}`}
          className="fas fa-graduation-cap absolute"
          style={{
            top: pos.top,
            left: pos.left,
            fontSize: pos.fontSize,
            color: '#2DD4BF',
            opacity: 0.08,
            transform: pos.transform,
            zIndex: 1,
          }}
          animate={{
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Welcome Message */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#2DD4BF] via-[#A855F7] to-[#EC4899] bg-clip-text text-transparent mb-4">
            Welcome Back!
          </h1>
          <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto">
            Continue your learning journey and track your amazing progress
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-gradient-to-r from-[#1E1B4B]/90 via-[#2C2A66]/90 to-[#1E1B4B]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-[#2DD4BF]/30 hover:border-[#2DD4BF]/60 transition-all duration-500 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#2DD4BF]/20 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#A855F7]/20 to-transparent rounded-full blur-lg"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-[#2DD4BF] via-[#A855F7] to-[#EC4899] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl relative">
                  {user?.name?.charAt(0).toUpperCase()}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-white/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-sm" />
                </div>
              </motion.div>
              
              <div className="text-center lg:text-left flex-1">
                <motion.h2 
                  className="text-4xl lg:text-5xl font-bold text-[#E5E7EB] mb-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user?.name}
                </motion.h2>
                <motion.p 
                  className="text-[#2DD4BF] text-xl mb-4 flex items-center gap-2 justify-center lg:justify-start"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <FaGraduationCap />
                  {user?.email}
                </motion.p>
                
                {/* Quick Stats */}
                <motion.div 
                  className="flex flex-wrap gap-6 justify-center lg:justify-start"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2DD4BF]">{totalPlans}</div>
                    <div className="text-sm text-[#94A3B8]">Total Plans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#A855F7]">{studyPlans.completed.length}</div>
                    <div className="text-sm text-[#94A3B8]">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#EC4899]">{Math.round(avgProgress)}%</div>
                    <div className="text-sm text-[#94A3B8]">Avg Progress</div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <motion.button
              onClick={() => navigate('/study-planner')}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 0 30px rgba(45, 212, 191, 0.6)',
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full lg:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-[#0F0D2A] px-8 py-4 rounded-2xl font-bold text-lg hover:from-[#14B8A6] hover:to-[#9333EA] transition-all duration-300 shadow-lg hover:shadow-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <FaPlus className="text-xl" />
              Create New Study Plan
            </motion.button>
          </div>
        </motion.div>

        {/* Study Plans Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-[#1E1B4B]/90 via-[#2C2A66]/90 to-[#1E1B4B]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#2DD4BF]/30 hover:border-[#2DD4BF]/60 transition-all duration-500 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-[#A855F7]/20 to-transparent rounded-full blur-lg"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-tl from-[#2DD4BF]/20 to-transparent rounded-full blur-md"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <FaBookOpen className="text-[#2DD4BF] text-3xl" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] bg-clip-text text-transparent">
                Study Plans Dashboard
              </h2>
            </div>
            
            {/* Enhanced Tab Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                onClick={() => setActiveTab('current')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'current'
                    ? 'bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] text-[#0F0D2A] shadow-lg transform scale-105'
                    : 'bg-[#2C2A66]/50 text-[#E5E7EB] hover:bg-[#2C2A66]/80 border border-[#2DD4BF]/20'
                }`}
              >
                <FaChartLine />
                <span>Current Plans ({studyPlans.current.length})</span>
                {activeTab === 'current' && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
              
              <motion.button
                onClick={() => setActiveTab('completed')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-[#A855F7] to-[#9333EA] text-[#E5E7EB] shadow-lg transform scale-105'
                    : 'bg-[#2C2A66]/50 text-[#E5E7EB] hover:bg-[#2C2A66]/80 border border-[#A855F7]/20'
                }`}
              >
                <FaTrophy />
                <span>Completed Plans ({studyPlans.completed.length})</span>
                {activeTab === 'completed' && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            </div>
            
            {/* Plans Grid */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {studyPlans[activeTab].length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full text-center py-16"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#2DD4BF]/20 to-[#A855F7]/20 rounded-full flex items-center justify-center">
                    <FaBookOpen className="text-4xl text-[#94A3B8]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#94A3B8] mb-2">
                    No {activeTab} plans yet
                  </h3>
                  <p className="text-[#64748B] mb-6">
                    {activeTab === 'current' 
                      ? 'Start your learning journey by creating your first study plan!'
                      : 'Complete some study plans to see them here!'
                    }
                  </p>
                  {activeTab === 'current' && (
                    <motion.button
                      onClick={() => navigate('/study-planner')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-[#0F0D2A] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Create Your First Plan
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                studyPlans[activeTab].map((plan, index) => (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: '0 20px 40px rgba(45, 212, 191, 0.2)',
                    }}
                    className="bg-gradient-to-br from-[#2C2A66]/80 to-[#1E1B4B]/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#A855F7]/20 hover:border-[#A855F7]/50 transition-all duration-500 relative overflow-hidden group"
                  >
                    {/* Card decorative elements */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#2DD4BF]/10 to-transparent rounded-full blur-md group-hover:from-[#2DD4BF]/20 transition-all duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#2DD4BF] group-hover:text-[#14B8A6] transition-colors duration-300">
                          {plan.fieldOfStudy}
                        </h3>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-[#F59E0B] text-sm" />
                          <span className="text-sm text-[#94A3B8]">
                            {activeTab === 'completed' ? 'Done' : 'Active'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[#94A3B8] mb-4 line-clamp-2">
                        {plan.description || 'No description provided.'}
                      </p>
                      
                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#E5E7EB]">Progress</span>
                          <span className="text-sm font-bold text-[#2DD4BF]">{plan.progress}%</span>
                        </div>
                        <div className="w-full bg-[#0F0D2A]/60 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] h-full rounded-full relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Date and Status */}
                      {plan.createdAt && (
                        <div className="flex items-center gap-2 text-[#64748B] text-sm">
                          <FaCalendarAlt />
                          <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;