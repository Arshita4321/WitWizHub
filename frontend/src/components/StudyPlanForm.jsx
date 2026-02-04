import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Box, TextField, Button, Typography, IconButton, Alert } from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { API_BASE_URL } from "../config/api.js";

const StudyPlanForm = ({ onPlanCreated }) => {
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', deadline: '', topics: [''] }]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', deadline: '', topics: [''] }]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleAddTopic = (subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].topics.push('');
    setSubjects(newSubjects);
  };

  const handleRemoveTopic = (subjectIndex, topicIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].topics = newSubjects[subjectIndex].topics.filter((_, i) => i !== topicIndex);
    setSubjects(newSubjects);
  };

  const handleTopicChange = (subjectIndex, topicIndex, value) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].topics[topicIndex] = value;
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formattedSubjects = subjects.map((subject) => ({
        name: subject.name,
        deadline: subject.deadline,
        topics: subject.topics.map((topic) => ({ name: topic })),
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/study-planner/plans`,
        {
          fieldOfStudy,
          subjects: formattedSubjects,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPlanCreated(response.data);
      setFieldOfStudy('');
      setSubjects([{ name: '', deadline: '', topics: [''] }]);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create study plan');
      setLoading(false);
      toast.error('Failed to create plan', { style: { background: '#EF4444', color: '#fff' } });
      console.error('Create plan error:', err);
    }
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <Box className="mt-6">
        <Typography
          variant="h5"
          style={{
            fontFamily: "'Dancing Script', cursive",
            background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          Create New Study Plan
        </Typography>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TextField
            label="Field of Study"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ style: { color: '#9CA3AF' } }}
            InputProps={{
              style: {
                color: '#E5E7EB',
                background: 'rgba(31, 41, 55, 0.5)',
                borderRadius: '0.5rem',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#2DD4BF' },
                '&:hover fieldset': { borderColor: '#A855F7' },
                '&.Mui-focused fieldset': { borderColor: '#A855F7' },
              },
            }}
          />
          {subjects.map((subject, subjectIndex) => (
            <Box key={subjectIndex} className="mb-4 p-4 bg-gray-800 rounded-xl">
              <TextField
                label="Subject Name"
                value={subject.name}
                onChange={(e) => handleSubjectChange(subjectIndex, 'name', e.target.value)}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ style: { color: '#9CA3AF' } }}
                InputProps={{
                  style: {
                    color: '#E5E7EB',
                    background: 'rgba(31, 41, 55, 0.5)',
                    borderRadius: '0.5rem',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#2DD4BF' },
                    '&:hover fieldset': { borderColor: '#A855F7' },
                    '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                  },
                }}
              />
              <TextField
                label="Deadline"
                type="date"
                value={subject.deadline}
                onChange={(e) => handleSubjectChange(subjectIndex, 'deadline', e.target.value)}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ style: { color: '#9CA3AF' }, shrink: true }}
                InputProps={{
                  style: {
                    color: '#E5E7EB',
                    background: 'rgba(31, 41, 55, 0.5)',
                    borderRadius: '0.5rem',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#2DD4BF' },
                    '&:hover fieldset': { borderColor: '#A855F7' },
                    '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                  },
                }}
              />
              {subject.topics.map((topic, topicIndex) => (
                <Box key={topicIndex} className="flex items-center gap-2 mt-2">
                  <TextField
                    label={`Topic ${topicIndex + 1}`}
                    value={topic}
                    onChange={(e) => handleTopicChange(subjectIndex, topicIndex, e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ style: { color: '#9CA3AF' } }}
                    InputProps={{
                      style: {
                        color: '#E5E7EB',
                        background: 'rgba(31, 41, 55, 0.5)',
                        borderRadius: '0.5rem',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#2DD4BF' },
                        '&:hover fieldset': { borderColor: '#A855F7' },
                        '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveTopic(subjectIndex, topicIndex)}
                    style={{ color: '#EC4899' }}
                    disabled={subject.topics.length === 1}
                  >
                    <RemoveCircle />
                  </IconButton>
                </Box>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-2"
              >
                <Button
                  variant="outlined"
                  startIcon={<AddCircle />}
                  onClick={() => handleAddTopic(subjectIndex)}
                  style={{
                    color: '#2DD4BF',
                    borderColor: '#2DD4BF',
                    borderRadius: '0.5rem',
                  }}
                >
                  Add Topic
                </Button>
              </motion.div>
              {subjects.length > 1 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2"
                >
                  <Button
                    variant="outlined"
                    startIcon={<RemoveCircle />}
                    onClick={() => handleRemoveSubject(subjectIndex)}
                    style={{
                      color: '#EC4899',
                      borderColor: '#EC4899',
                      borderRadius: '0.5rem',
                    }}
                  >
                    Remove Subject
                  </Button>
                </motion.div>
              )}
            </Box>
          ))}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4"
          >
            <Button
              variant="outlined"
              startIcon={<AddCircle />}
              onClick={handleAddSubject}
              style={{
                color: '#2DD4BF',
                borderColor: '#2DD4BF',
                borderRadius: '0.5rem',
              }}
            >
              Add Subject
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4"
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              style={{
                background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                color: '#E5E7EB',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                fontWeight: 600,
              }}
            >
              {loading ? 'Creating...' : 'Create Study Plan'}
            </Button>
          </motion.div>
        </motion.form>
      </Box>
    </>
  );
};

export default StudyPlanForm;