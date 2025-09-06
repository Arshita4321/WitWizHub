import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Container, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AddCircle, DoneAll } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';

import GoogleAuthButton from '../components/GoogleAuthButton';
import StudyPlanForm from '../components/StudyPlanForm';
import StudyPlanList from '../components/StudyPlanList';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActivePlans, setShowActivePlans] = useState(true);
  const [showCompletedPlans, setShowCompletedPlans] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/study-planner/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data);
      setLoading(false);
      showReminders(res.data);
    } catch (err) {
      setError('Failed to load study plans. Please try again.');
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login', { state: { from: location.pathname } });
      }
      console.error('Fetch plans error:', err);
    }
  }, [navigate, location]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePlanCreated = (newPlan) => {
    setPlans((prev) => [...prev, newPlan]);
    toast.success('Study plan created!', { style: { background: '#10B981', color: '#fff' } });
    showReminders([newPlan]);
  };

  const handlePlanUpdated = (updatedPlan) => {
    setPlans((prev) => prev.map((p) => (p._id === updatedPlan._id ? updatedPlan : p)));
    showReminders([updatedPlan]);
  };

  const handlePlanDeleted = () => {
    fetchPlans();
  };

  const activePlans = plans.filter((p) => (p.progress || 0) < 100);
  const completedPlans = plans.filter((p) => (p.progress || 0) === 100);

  const showReminders = (plansArray) => {
    const now = new Date();
    const upcomingTopics = [];
    plansArray.forEach((plan) => {
      plan.subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
          const deadline = new Date(topic.deadline);
          const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
          if (diffDays >= 0 && diffDays <= 3) {
            upcomingTopics.push({ plan: plan.fieldOfStudy, subject: subject.name, topic: topic.name, deadline });
          }
        });
      });
    });

    upcomingTopics.forEach((t) => {
      toast(
        `📌 "${t.topic}" of ${t.subject} in ${t.plan} is due on ${t.deadline.toLocaleDateString()}`,
        { duration: 8000, style: { background: '#FBBF24', color: '#000', fontWeight: 'bold' } }
      );
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <CircularProgress sx={{ color: '#2DD4BF' }} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <Container maxWidth="md"><Alert severity="error">{error}</Alert></Container>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#0F172A' }}>
      <Toaster position="top-right" />
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            className="p-8 bg-opacity-95 rounded-2xl"
            style={{
              background: '#1E1B4B',
              border: '2px solid transparent',
              borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1',
              boxShadow: '8px 8px 16px rgba(30,27,75,0.6), -8px -8px 16px rgba(75,63,145,0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Typography
              variant="h3"
              style={{
                fontFamily: "'Dancing Script', cursive",
                background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              Study Planner
            </Typography>

            <GoogleAuthButton />

            <StudyPlanForm onPlanCreated={handlePlanCreated} />

            <div className="flex gap-4 mt-6">
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddCircle />}
                style={{ background: '#2DD4BF', color: '#E5E7EB', borderRadius: '0.75rem' }}
                onClick={() => setShowActivePlans(!showActivePlans)}
              >
                {showActivePlans ? 'Hide Active Plans' : 'Show Active Plans'}
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DoneAll />}
                style={{ background: '#10B981', color: '#E5E7EB', borderRadius: '0.75rem' }}
                onClick={() => setShowCompletedPlans(!showCompletedPlans)}
              >
                {showCompletedPlans ? 'Hide Completed Plans' : 'Show Completed Plans'}
              </Button>
            </div>

            {showActivePlans && (
              <>
                <Typography variant="h5" className="mt-8 mb-4" style={{ color: '#2DD4BF', textAlign: 'center' }}>
                  Active Plans
                </Typography>
                <StudyPlanList
                  plans={activePlans}
                  setPlans={setPlans}
                  onPlanUpdated={handlePlanUpdated}
                  onPlanDeleted={handlePlanDeleted}
                />
              </>
            )}

            {showCompletedPlans && (
              <>
                <Typography variant="h5" className="mt-8 mb-4" style={{ color: '#10B981', textAlign: 'center' }}>
                  Completed Plans
                </Typography>
                <StudyPlanList
                  plans={completedPlans}
                  setPlans={setPlans}
                  onPlanUpdated={handlePlanUpdated}
                  onPlanDeleted={handlePlanDeleted}
                />
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default StudyPlanner;
