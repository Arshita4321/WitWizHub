import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, IconButton, LinearProgress, Button } from '@mui/material';
import { Close, AccessTime, CheckCircle, EventAvailable, Assignment, Add, Edit, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { API_BASE_URL } from "../config/api.js";

const TopicScheduleModal = ({ plan, onClose, onUpdatePlan }) => {
  const [localPlan, setLocalPlan] = useState(plan);

  const calculateProgress = (subjects) => {
    const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
    const completedTopics = subjects.reduce(
      (sum, subject) => sum + subject.topics.filter((topic) => topic.completed).length,
      0
    );
    return totalTopics ? (completedTopics / totalTopics) * 100 : 0;
  };

  const generateSchedule = (subject) => {
    const deadline = new Date(subject.deadline);
    const now = new Date();
    const daysUntilDeadline = Math.max(1, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
    const topics = subject.topics;
    const topicsCount = topics.length;
    const daysPerTopic = Math.floor(daysUntilDeadline / topicsCount) || 1;
    const schedule = [];

    topics.forEach((topic, index) => {
      const startDate = new Date(now.getTime() + index * daysPerTopic * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + daysPerTopic * 24 * 60 * 60 * 1000 - 1);
      const hoursPerTopic = 2;
      schedule.push({
        topic: topic.name,
        completed: topic.completed || false,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        hours: hoursPerTopic,
        _id: topic._id,
        googleEventId: topic.googleEventId || null,
      });
    });

    return schedule;
  };

  const handleToggleTopic = async (subjectIndex, topicIndex) => {
    const updatedPlan = { ...localPlan };
    const subjectId = updatedPlan.subjects[subjectIndex]._id;
    const topic = updatedPlan.subjects[subjectIndex].topics[topicIndex];
    const newCompletedStatus = !topic.completed;

    // Optimistically update the local state
    topic.completed = newCompletedStatus;
    setLocalPlan({ ...updatedPlan });

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast.error('No authentication token found', { style: { background: '#EF4444', color: '#fff' } });
        topic.completed = !newCompletedStatus; // Revert on failure
        setLocalPlan({ ...updatedPlan });
        return;
      }

      console.log('Toggling topic:', { planId: plan._id, subjectId, topicId: topic._id, completed: newCompletedStatus });

      // Update the topic using the correct endpoint
      const response = await axios.put(
        `${API_BASE_URL}/api/study-planner/subjects/${subjectId}/topics/${topic._id}`,
        { completed: newCompletedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch the updated plan to ensure progress is correct
      const planResponse = await axios.get(
        `${API_BASE_URL}/api/study-planner/plans/${plan._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLocalPlan(planResponse.data);
      onUpdatePlan(planResponse.data);
      toast.success(`Topic marked as ${newCompletedStatus ? 'done' : 'undone'}!`, {
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (err) {
      toast.error('Failed to update topic status', { style: { background: '#EF4444', color: '#fff' } });
      console.error('Update topic error:', {
        planId: plan._id,
        subjectIndex,
        topicIndex,
        subjectId,
        topicId: topic._id,
        response: err.response?.data,
        status: err.response?.status,
        message: err.message,
      });
      // Revert the local change if the request fails
      topic.completed = !newCompletedStatus;
      setLocalPlan({ ...updatedPlan });
    }
  };

  const handleAddTopic = async (subjectIndex) => {
    const name = prompt('New Topic Name:');
    if (name) {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No JWT token found');
        const subjectId = localPlan.subjects[subjectIndex]._id;
        console.log('Adding topic:', { subjectId, name });

        const res = await axios.post(
          `${API_BASE_URL}/api/study-planner/subjects/${subjectId}/topics`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedPlan = { ...localPlan, subjects: localPlan.subjects.map((s, i) => (i === subjectIndex ? res.data : s)) };
        setLocalPlan(updatedPlan);
        onUpdatePlan(updatedPlan);
        toast.success('Topic added!', { style: { background: '#10B981', color: '#fff' } });
      } catch (err) {
        toast.error('Failed to add topic', { style: { background: '#EF4444', color: '#fff' } });
        console.error('Add topic error:', {
          subjectIndex,
          subjectId: localPlan.subjects[subjectIndex]._id,
          response: err.response?.data,
          status: err.response?.status,
          message: err.message,
        });
      }
    }
  };

  const handleEditTopic = async (subjectIndex, topicIndex, topicId) => {
    const newName = prompt('New Topic Name:', localPlan.subjects[subjectIndex].topics[topicIndex].name);
    if (newName && newName !== localPlan.subjects[subjectIndex].topics[topicIndex].name) {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No JWT token found');
        const subjectId = localPlan.subjects[subjectIndex]._id;
        console.log('Editing topic:', { subjectId, topicId, newName });

        const res = await axios.put(
          `${API_BASE_URL}/api/study-planner/subjects/${subjectId}/topics/${topicId}`,
          { name: newName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedPlan = { ...localPlan, subjects: localPlan.subjects.map((s, i) => (i === subjectIndex ? res.data : s)) };
        setLocalPlan(updatedPlan);
        onUpdatePlan(updatedPlan);
        toast.success('Topic updated!', { style: { background: '#10B981', color: '#fff' } });
      } catch (err) {
        toast.error('Failed to update topic', { style: { background: '#EF4444', color: '#fff' } });
        console.error('Edit topic error:', {
          subjectIndex,
          topicIndex,
          topicId,
          subjectId: localPlan.subjects[subjectIndex]._id,
          response: err.response?.data,
          status: err.response?.status,
          message: err.message,
        });
      }
    }
  };

  const handleDeleteTopic = async (subjectIndex, topicIndex, topicId) => {
    if (window.confirm('Delete this topic?')) {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No JWT token found');
        const subjectId = localPlan.subjects[subjectIndex]._id;
        const topic = localPlan.subjects[subjectIndex].topics[topicIndex];
        console.log('Deleting topic:', {
          subjectId,
          topicId,
          googleEventId: topic.googleEventId || 'none',
          token: token.slice(0, 10) + '...',
          planId: plan._id,
        });

        const res = await axios.delete(
          `${API_BASE_URL}/api/study-planner/subjects/${subjectId}/topics/${topicId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedSubjects = localPlan.subjects.map((s, i) =>
          i === subjectIndex ? res.data : s
        );
        const updatedPlan = { ...localPlan, subjects: updatedSubjects };
        const progress = calculateProgress(updatedSubjects);
        setLocalPlan(updatedPlan);
        onUpdatePlan({ ...updatedPlan, progress });
        toast.success('Topic deleted!', { style: { background: '#10B981', color: '#fff' } });
      } catch (err) {
        toast.error('Failed to delete topic', { style: { background: '#EF4444', color: '#fff' } });
        console.error('Delete topic error:', {
          subjectIndex,
          topicIndex,
          topicId,
          subjectId: localPlan.subjects[subjectIndex]._id,
          planId: plan._id,
          response: err.response?.data,
          status: err.response?.status,
          message: err.message,
        });
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.7, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: 'easeOut', type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, scale: 0.7, rotate: 5, transition: { duration: 0.3 } },
  };

  const timelineVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4, delay: i * 0.15, type: 'spring', bounce: 0.3 },
    }),
  };

  const progress = calculateProgress(localPlan.subjects);

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: 'linear-gradient(to bottom, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.8))' }}
        >
          <motion.div
            className="relative w-full max-w-3xl mx-4 bg-gray-900 bg-opacity-95 rounded-2xl p-8"
            style={{
              border: '2px solid transparent',
              borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1',
              boxShadow: '8px 8px 16px rgba(30, 27, 75, 0.6), -8px -8px 16px rgba(75, 63, 145, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4"
            >
              <IconButton
                onClick={onClose}
                style={{ color: '#EC4899', background: 'rgba(236, 72, 153, 0.1)' }}
                className="hover:bg-pink-700 hover:bg-opacity-30 rounded-full"
              >
                <Close />
              </IconButton>
            </motion.div>
            <Typography
              variant="h4"
              style={{
                fontFamily: "'Dancing Script', cursive",
                background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              {plan.fieldOfStudy} Schedule
            </Typography>
            <Box mb={4}>
              <Typography
                style={{ color: '#2DD4BF', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}
              >
                Overall Progress: {Math.floor(progress)}%
              </Typography>
              <motion.div
                animate={{ scale: progress === 100 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.5, repeat: progress === 100 ? 2 : 0 }}
              >
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    background: '#333',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                    },
                  }}
                  className="mt-2"
                />
              </motion.div>
            </Box>
            {localPlan.subjects.map((subject, subjectIndex) => {
              const schedule = generateSchedule(subject);
              return (
                <Box key={subject._id} className="mb-10 relative">
                  <Typography
                    variant="h6"
                    style={{
                      background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      fontWeight: 600,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {subject.name}
                  </Typography>
                  <Typography
                    className="text-gray-400 text-sm mb-6 flex items-center"
                    style={{ color: '#9CA3AF' }}
                  >
                    <EventAvailable style={{ color: '#2DD4BF', marginRight: '0.5rem' }} />
                    Deadline: {new Date(subject.deadline).toLocaleDateString()}
                  </Typography>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-4"
                  >
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      style={{
                        background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                        color: '#E5E7EB',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                      }}
                      onClick={() => handleAddTopic(subjectIndex)}
                    >
                      Add Topic
                    </Button>
                  </motion.div>
                  <div className="space-y-8 relative">
                    {schedule.map((item, index) => (
                      <motion.div
                        key={item._id}
                        custom={index}
                        variants={timelineVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-start gap-6 p-6 bg-gray-800 rounded-xl relative"
                        style={{
                          borderLeft: '4px solid #2DD4BF',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.3s ease',
                          opacity: item.completed ? 0.7 : 1,
                        }}
                        whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(45, 212, 191, 0.4)' }}
                      >
                        <Box
                          className="absolute -left-3 top-6 w-6 h-6 rounded-full"
                          style={{
                            background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                            boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)',
                          }}
                        />
                        <Assignment style={{ color: '#2DD4BF', marginTop: '0.25rem' }} />
                        <Box flex={1}>
                          <Typography style={{ color: '#E5E7EB', fontWeight: 500 }}>
                            {item.topic}
                          </Typography>
                          <Typography
                            style={{ color: '#9CA3AF', fontSize: '0.875rem' }}
                            className="flex items-center"
                          >
                            <CheckCircle style={{ color: '#EC4899', margin: '0 0.5rem' }} />
                            Study Period: {item.startDate} - {item.endDate}
                          </Typography>
                          <Typography style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                            <AccessTime style={{ color: '#2DD4BF', marginRight: '0.5rem' }} />
                            Estimated Time: {item.hours} hours
                          </Typography>
                        </Box>
                        <motion.div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              onClick={() => handleToggleTopic(subjectIndex, index)}
                              style={{
                                background: item.completed
                                  ? 'linear-gradient(to right, #10B981, #34D399)'
                                  : 'linear-gradient(to right, #EF4444, #F87171)',
                                color: '#E5E7EB',
                                borderRadius: '0.5rem',
                                padding: '0.25rem 1rem',
                                fontSize: '0.75rem',
                              }}
                            >
                              {item.completed ? 'Done' : 'Mark Done'}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <IconButton
                              onClick={() => handleEditTopic(subjectIndex, index, item._id)}
                              style={{ color: '#2DD4BF' }}
                              className="hover:bg-teal-100 hover:bg-opacity-20 rounded-full"
                            >
                              <Edit />
                            </IconButton>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <IconButton
                              onClick={() => handleDeleteTopic(subjectIndex, index, item._id)}
                              style={{ color: '#EC4899' }}
                              className="hover:bg-pink-100 hover:bg-opacity-20 rounded-full"
                            >
                              <Delete />
                            </IconButton>
                          </motion.div>
                        </motion.div>
                        {index < schedule.length - 1 && (
                          <Box
                            className="absolute left-2.5 top-14 w-0.5 h-[calc(100%-2rem)]"
                            style={{ background: 'linear-gradient(to bottom, #2DD4BF, #A855F7)' }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Box>
              );
            })}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TopicScheduleModal;