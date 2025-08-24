import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';
import '../styles/profile.css';

// Generate watermark positions with slight randomization
const generateWatermarkPositions = () => {
  const positions = [];
  const rows = 5; // Adjust for vertical coverage
  const cols = 6; // Adjust for horizontal coverage
  const spacingX = 100 / cols; // Percentage width per column
  const spacingY = 100 / rows; // Percentage height per row

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const randomOffsetX = (Math.random() - 0.5) * spacingX * 0.3; // ±15% of spacing
      const randomOffsetY = (Math.random() - 0.5) * spacingY * 0.3;
      const size = 25 + Math.random() * 25; // 25px–50px
      const rotation = (Math.random() - 0.5) * 50; // -25deg to 25deg
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
        const response = await axios.get('http://localhost:3000/api/profile', {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A]">
        <motion.div
          className="text-[#E5E7EB] text-2xl font-semibold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-[#E5E7EB] p-6 sm:p-8 relative overflow-hidden profile-container"
    >
      {/* Watermark Icons */}
      {generateWatermarkPositions().map((pos, index) => (
        <i
          key={`watermark-${index}`}
          className="fas fa-graduation-cap"
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            fontSize: pos.fontSize,
            color: '#2DD4BF',
            opacity: 0.2,
            transform: pos.transform,
            zIndex: 1,
          }}
        ></i>
      ))}

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Profile Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-[#1E1B4B]/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-[#2DD4BF]/20 hover:border-[#2DD4BF]/50 transition-all duration-300 profile-card"
        >
          <h1 className="text-4xl font-extrabold text-[#2DD4BF] mb-6 tracking-tight">
            My Profile
          </h1>
          <div className="flex items-center gap-6 mb-6 profile-info">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-28 h-28 bg-gradient-to-br from-[#A855F7] to-[#2DD4BF] rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg avatar"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </motion.div>
            <div className="user-details">
              <h2 className="text-3xl font-semibold text-[#E5E7EB]">{user?.name}</h2>
              <p className="text-[#A855F7] text-lg">{user?.email}</p>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/study-planner')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(45, 212, 191, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-[#1E1B4B] px-6 py-3 rounded-lg font-semibold text-lg hover:from-[#26A69A] hover:to-[#9333EA] transition-all duration-300 add-plan-btn"
          >
            <FaPlus /> Add New Study Plan
          </motion.button>
        </motion.div>

        {/* Study Plans Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#1E1B4B]/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#2DD4BF]/20 hover:border-[#2DD4BF]/50 transition-all duration-300 study-plans-card"
        >
          <h2 className="text-3xl font-bold text-[#2DD4BF] mb-6 tracking-tight">
            My Study Plans
          </h2>
          <div className="flex gap-4 mb-6 tab-buttons">
            <motion.button
              onClick={() => setActiveTab('current')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 tab-button ${
                activeTab === 'current'
                  ? 'bg-[#E5E7EB] text-[#1E1B4B] shadow-lg'
                  : 'bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-[#E5E7EB] hover:from-[#14B8A6] hover:to-[#9333EA]'
              }`}
            >
              Current Plans
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('completed')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 tab-button ${
                activeTab === 'completed'
                  ? 'bg-[#E5E7EB] text-[#1E1B4B] shadow-lg'
                  : 'bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-[#E5E7EB] hover:from-[#14B8A6] hover:to-[#9333EA]'
              }`}
            >
              Completed Plans
            </motion.button>
          </div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 plan-grid"
          >
            {studyPlans[activeTab].length === 0 ? (
              <p className="text-[#E5E7EB] text-lg col-span-2 text-center">
                No {activeTab} plans available.
              </p>
            ) : (
              studyPlans[activeTab].map(plan => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(45, 212, 191, 0.3)' }}
                  className="bg-[#2C2A66]/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-[#A855F7]/20 hover:border-[#A855F7]/50 transition-all duration-300 plan-card"
                >
                  <h3 className="text-xl font-semibold text-[#2DD4BF] mb-2">
                    {plan.fieldOfStudy}
                  </h3>
                  <p className="text-[#E5E7EB] mb-3">
                    {plan.description || 'No description provided.'}
                  </p>
                  <div className="w-full bg-[#1E1B4B] rounded-full h-2.5 mb-3 progress-bar">
                    <motion.div
                      className="bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] h-2.5 rounded-full progress-bar-inner"
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[#A855F7] text-sm">Progress: {plan.progress}%</p>
                  {plan.createdAt && (
                    <p className="text-[#A855F7] text-sm">
                      Created: {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;