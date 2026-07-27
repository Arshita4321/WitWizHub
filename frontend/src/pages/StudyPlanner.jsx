import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgress, Alert } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

import GoogleAuthButton from '../components/GoogleAuthButton';
import StudyPlanForm from '../components/StudyPlanForm';
import StudyPlanList from '../components/StudyPlanList';
import { API_BASE_URL } from "../config/api.js";

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        '#0f172a',
  surface:   '#1e293b',
  surfaceHi: '#263348',
  border:    '#334155',
  borderHi:  '#475569',
  text:      '#f1f5f9',
  textMuted: '#94a3b8',
  textDim:   '#64748b',
  accent:    '#6366f1',
  accentLt:  '#a5b4fc',
  accentBg:  'rgba(99,102,241,0.1)',
  success:   '#10b981',
  successLt: '#6ee7b7',
  successBg: 'rgba(16,185,129,0.08)',
};

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActivePlans, setShowActivePlans] = useState(true);
  const [showCompletedPlans, setShowCompletedPlans] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
      toast.success('Google Calendar connected!', {
        duration: 4000,
        style: { background: T.surface, color: T.text, border: `1px solid ${T.border}` },
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/study-planner/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data);
      showReminders(res.data);
    } catch (err) {
      console.error('Fetch plans error:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setError('Failed to load study plans. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handlePlanCreated = (newPlan) => {
    setPlans((prev) => [...prev, newPlan]);
    toast.success('Study plan created!', {
      style: { background: T.surface, color: T.text, border: `1px solid ${T.border}` },
    });
    showReminders([newPlan]);
  };

  const handlePlanUpdated = (updatedPlan) => {
    setPlans((prev) => prev.map((p) => (p._id === updatedPlan._id ? updatedPlan : p)));
    showReminders([updatedPlan]);
  };

  const handlePlanDeleted = () => { fetchPlans(); };

  const activePlans = plans.filter((p) => (p.progress || 0) < 100);
  const completedPlans = plans.filter((p) => (p.progress || 0) === 100);

  const showReminders = (plansArray) => {
    const now = new Date();
    plansArray.forEach((plan) => {
      plan.subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
          const deadline = new Date(topic.endTime || topic.deadline);
          const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
          if (diffDays >= 0 && diffDays <= 3) {
            toast(
              `⏰ "${topic.name}" in ${subject.name} is due ${deadline.toLocaleDateString()}`,
              {
                duration: 8000,
                style: { background: '#1c1408', color: '#fbbf24', border: '1px solid #78350f', fontWeight: '500' },
              }
            );
          }
        });
      });
    });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <CircularProgress sx={{ color: T.accent }} size={34} thickness={4} />
      <span style={{ color: T.textDim, fontSize: '0.875rem', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading your plans…</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <Alert severity="error" sx={{ maxWidth: 480, borderRadius: '0.75rem' }}>{error}</Alert>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '2.5rem 1rem', fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '0.5rem', fontSize: '0.85rem' } }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ maxWidth: '900px', margin: '0 auto' }}
      >
        {/* ── Page card ── */}
        <div style={{ background: T.surface, borderRadius: '1rem', border: `1px solid ${T.border}`, boxShadow: '0 8px 40px rgba(0,0,0,0.45)', padding: '2.25rem 2.5rem' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', background: '#1e3a5f', width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              📚
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
                Study Planner
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: T.textDim }}>
                Organize subjects, track deadlines, and stay on schedule
              </p>
            </div>
          </div>

          <div style={{ height: '1px', background: T.border, marginBottom: '1.75rem' }} />

          {/* ── Google Calendar ── */}
          <GoogleAuthButton />

          {/* ── Create new plan form ── */}
          <StudyPlanForm onPlanCreated={handlePlanCreated} />

          {/* ── Toggle buttons ── */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowActivePlans(!showActivePlans)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1.1rem', borderRadius: '0.5rem', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s',
                background: showActivePlans ? T.accentBg : 'transparent',
                border: `1px solid ${showActivePlans ? T.accent : T.border}`,
                color: showActivePlans ? T.accentLt : T.textDim,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: showActivePlans ? T.accent : T.borderHi, flexShrink: 0 }} />
              {showActivePlans ? 'Hide Active Plans' : 'Show Active Plans'}
              {activePlans.length > 0 && (
                <span style={{ background: '#312e81', color: T.accentLt, fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                  {activePlans.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowCompletedPlans(!showCompletedPlans)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1.1rem', borderRadius: '0.5rem', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s',
                background: showCompletedPlans ? T.successBg : 'transparent',
                border: `1px solid ${showCompletedPlans ? T.success : T.border}`,
                color: showCompletedPlans ? T.successLt : T.textDim,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: showCompletedPlans ? T.success : T.borderHi, flexShrink: 0 }} />
              {showCompletedPlans ? 'Hide Completed Plans' : 'Show Completed Plans'}
              {completedPlans.length > 0 && (
                <span style={{ background: '#064e3b', color: T.successLt, fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                  {completedPlans.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Active Plans section ── */}
          {showActivePlans && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: T.accentLt, letterSpacing: '0.01em' }}>
                  Active Plans
                </h2>
                <span style={{ background: '#312e81', color: T.accentLt, fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                  {activePlans.length}
                </span>
              </div>
              {activePlans.length === 0 ? (
                <p style={{ color: T.textDim, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem', borderRadius: '0.75rem', border: `1px dashed ${T.border}`, margin: 0 }}>
                  No active plans yet — create your first plan above.
                </p>
              ) : (
                <StudyPlanList
                  plans={activePlans}
                  setPlans={setPlans}
                  onPlanUpdated={handlePlanUpdated}
                  onPlanDeleted={handlePlanDeleted}
                />
              )}
            </motion.section>
          )}

          {/* ── Completed Plans section ── */}
          {showCompletedPlans && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: T.success, flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: T.successLt, letterSpacing: '0.01em' }}>
                  Completed Plans
                </h2>
                <span style={{ background: '#064e3b', color: T.successLt, fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                  {completedPlans.length}
                </span>
              </div>
              {completedPlans.length === 0 ? (
                <p style={{ color: T.textDim, fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem', borderRadius: '0.75rem', border: `1px dashed ${T.border}`, margin: 0 }}>
                  No completed plans yet — keep studying!
                </p>
              ) : (
                <StudyPlanList
                  plans={completedPlans}
                  setPlans={setPlans}
                  onPlanUpdated={handlePlanUpdated}
                  onPlanDeleted={handlePlanDeleted}
                />
              )}
            </motion.section>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudyPlanner;