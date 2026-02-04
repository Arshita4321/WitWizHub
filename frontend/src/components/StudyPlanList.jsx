import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import toast from 'react-hot-toast';
import TopicScheduleModal from './TopicScheduleModal';
import EditPlanDialog from './EditPlanDialog';
import Box from '@mui/material/Box';

import { API_BASE_URL } from "../config/api.js";

const StudyPlanList = ({ plans, setPlans, onPlanUpdated, onPlanDeleted }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editPlan, setEditPlan] = useState(null);

  const handleDeletePlan = async (planId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) throw new Error('No JWT token found');

      // Find the plan to delete
      const plan = plans.find((p) => p._id === planId);
      if (!plan) throw new Error('Plan not found');

      // Delete the plan (backend will handle Google Calendar events)
      await axios.delete(`${API_BASE_URL}/api/study-planner/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(plans.filter((plan) => plan._id !== planId));
      onPlanDeleted();
      toast.success('Study plan deleted!', { style: { background: '#10B981', color: '#fff' } });
    } catch (err) {
      toast.error('Failed to delete plan', { style: { background: '#EF4444', color: '#fff' } });
      console.error('Delete plan error:', err.response?.data || err.message);
    }
  };

  const handleEditPlan = async (plan, newName) => {
    if (newName && newName !== plan.fieldOfStudy) {
      try {
        const token = localStorage.getItem('jwtToken');
        const res = await axios.put(
          `${API_BASE_URL}/api/study-planner/plans/${plan._id}`,
          { fieldOfStudy: newName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlans(plans.map((p) => (p._id === plan._id ? res.data : p)));
        onPlanUpdated(res.data);
        toast.success('Study plan updated!', { style: { background: '#10B981', color: '#fff' } });
      } catch (err) {
        toast.error('Failed to update plan', { style: { background: '#EF4444', color: '#fff' } });
        console.error('Edit plan error:', err.response?.data || err.message);
      }
    }
  };

  const handleCardClick = (plan) => {
    setSelectedPlan(plan);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.3 } },
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <Box className="mt-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {plans.map((plan) => (
              <motion.div
                key={plan._id}
                variants={cardVariants}
                layout
                whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                onClick={() => handleCardClick(plan)}
                style={{
                  background: 'linear-gradient(to bottom, #1E1B4B, #0F172A)',
                  border: '2px solid transparent',
                  borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                }}
              >
                <Card
                  className="bg-gray-800 bg-opacity-95 backdrop-blur-md rounded-xl overflow-hidden"
                >
                  <CardContent className="p-6 max-h-96 overflow-y-auto">
                    <Typography
                      variant="h6"
                      style={{
                        fontFamily: "'Dancing Script', cursive",
                        background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        marginBottom: '1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {plan.fieldOfStudy}
                    </Typography>
                    {plan.subjects.map((subject) => (
                      <div key={subject._id} className="mb-4">
                        <Typography
                          style={{
                            background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: '500',
                          }}
                        >
                          {subject.name}
                        </Typography>
                        <Typography style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          Deadline: {new Date(subject.deadline).toLocaleDateString()}
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {subject.topics.map((topic) => (
                            <Chip
                              key={topic._id}
                              label={topic.name}
                              style={{
                                background: topic.completed ? '#10B981' : '#2DD4BF',
                                color: '#E5E7EB',
                                fontSize: '0.75rem',
                              }}
                              size="small"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-4 right-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPlan(plan);
                      }}
                    >
                      <IconButton
                        style={{ color: '#2DD4BF' }}
                        className="hover:bg-teal-100 hover:bg-opacity-20 rounded-full"
                      >
                        <Edit />
                      </IconButton>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-4 right-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan._id);
                      }}
                    >
                      <IconButton
                        style={{ color: '#EC4899' }}
                        className="hover:bg-pink-100 hover:bg-opacity-20 rounded-full"
                      >
                        <Delete />
                      </IconButton>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {selectedPlan && (
          <TopicScheduleModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onUpdatePlan={onPlanUpdated}
          />
        )}
        {editPlan && (
          <EditPlanDialog
            plan={editPlan}
            onClose={() => setEditPlan(null)}
            onSave={handleEditPlan}
          />
        )}
      </Box>
    </>
  );
};

export default StudyPlanList;