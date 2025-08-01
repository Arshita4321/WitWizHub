import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Container, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AddCircle, DoneAll } from '@mui/icons-material';
import GoogleAuthButton from '../components/GoogleAuthButton';
import StudyPlanForm from '../components/StudyPlanForm';
import StudyPlanList from '../components/StudyPlanList';
import toast from 'react-hot-toast';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActivePlans, setShowActivePlans] = useState(false);
  const [showCompletedPlans, setShowCompletedPlans] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const reFetchPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.log('StudyPlanner: No token, redirecting to /login with state');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/study-planner/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('StudyPlanner: Plans fetched successfully', res.data);
      setPlans(res.data);
      setLoading(false);
    } catch (err) {
      console.error('StudyPlanner: Fetch plans error:', err.response?.status, err.message);
      setError('Failed to load study plans. Please try again.');
      setLoading(false);
      if (err.response?.status === 401) {
        console.log('StudyPlanner: 401 Unauthorized, clearing token and redirecting to /login');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  }, [navigate, location]);

  useEffect(() => {
    reFetchPlans();
  }, [reFetchPlans]);

  const handlePlanCreated = (newPlan) => {
    setPlans((prevPlans) => [...prevPlans, newPlan]);
    setShowActivePlans(true);
    if (newPlan.progress === 100) {
      setShowCompletedPlans(true);
    }
    toast.success('Study plan created!', { style: { background: '#10B981', color: '#fff' } });
  };

  const handlePlanUpdated = (updatedPlan) => {
    setPlans((prevPlans) => prevPlans.map((plan) => (plan._id === updatedPlan._id ? updatedPlan : plan)));
    if (updatedPlan.progress === 100) {
      setShowCompletedPlans(true);
    }
  };

  const handlePlanDeleted = () => {
    reFetchPlans();
  };

  const activePlans = plans.filter((plan) => (plan.progress || 0) < 100);
  const completedPlans = plans.filter((plan) => (plan.progress || 0) === 100);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(to right, #1E1B4B, #0F172A)',
          backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#2DD4BF' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(to right, #1E1B4B, #0F172A)',
          backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error">{error}</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{
        background: 'linear-gradient(to right, #1E1B4B, #0F172A)',
        backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 80 }}
        >
          <Paper
            className="p-8 bg-opacity-95 rounded-2xl"
            style={{
              background: 'linear-gradient(to bottom, #1E1B4B, #0F172A)',
              border: '2px solid transparent',
              borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1',
              boxShadow: '8px 8px 16px rgba(30, 27, 75, 0.6), -8px -8px 16px rgba(75, 63, 145, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Typography
              variant="h3"
              style={{
                fontFamily: "'Dancing Script', cursive",
                background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 10px rgba(45, 212, 191, 0.5)',
                textAlign: 'center',
                marginBottom: '1.5rem',
                fontWeight: 700,
              }}
            >
              Study Planner
            </Typography>
            <GoogleAuthButton />
            <StudyPlanForm onPlanCreated={handlePlanCreated} />
            <div className="flex gap-4 mt-6">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(45, 212, 191, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddCircle style={{ color: '#E5E7EB' }} />}
                  style={{
                    background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                    color: '#E5E7EB',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                  onClick={() => setShowActivePlans(!showActivePlans)}
                >
                  {showActivePlans ? 'Hide Active Plans' : 'Show Active Plans'}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(150, 50, 50, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DoneAll style={{ color: '#E5E7EB' }} />}
                  style={{
                    background: 'linear-gradient(to right, #10B981, #34D399)',
                    color: '#E5E7EB',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                  onClick={() => setShowCompletedPlans(!showCompletedPlans)}
                >
                  {showCompletedPlans ? 'Hide Completed Plans' : 'Show Completed Plans'}
                </Button>
              </motion.div>
            </div>
            {showActivePlans && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h5"
                  style={{
                    color: '#2DD4BF',
                    fontFamily: "'Dancing Script', cursive",
                    margin: '2rem 0 1rem',
                    textAlign: 'center',
                    textShadow: '0 0 5px rgba(45, 212, 191, 0.3)',
                  }}
                >
                  Active Plans
                </Typography>
                <StudyPlanList
                  plans={activePlans}
                  setPlans={setPlans}
                  onPlanUpdated={handlePlanUpdated}
                  onPlanDeleted={handlePlanDeleted}
                />
              </motion.div>
            )}
            {showCompletedPlans && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h5"
                  style={{
                    color: '#10B981',
                    fontFamily: "'Dancing Script', cursive",
                    margin: '2rem 0 1rem',
                    textAlign: 'center',
                    textShadow: '0 0 5px rgba(16, 185, 129, 0.6)',
                  }}
                >
                  Completed Plans
                </Typography>
                <StudyPlanList
                  plans={completedPlans}
                  setPlans={setPlans}
                  onPlanUpdated={handlePlanUpdated}
                  onPlanDeleted={handlePlanDeleted}
                />
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default StudyPlanner;