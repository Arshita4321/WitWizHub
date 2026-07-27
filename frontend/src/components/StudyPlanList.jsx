import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import TopicScheduleModal from './TopicScheduleModal';
import EditPlanDialog from './EditPlanDialog';

import { API_BASE_URL } from "../config/api.js";

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  surface:    '#1e293b',
  card:       '#162032',
  border:     '#334155',
  borderHi:   '#475569',
  text:       '#f1f5f9',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  accent:     '#6366f1',
  accentLt:   '#a5b4fc',
  success:    '#10b981',
  successLt:  '#6ee7b7',
  danger:     '#ef4444',
};

const StudyPlanList = ({ plans, setPlans, onPlanUpdated, onPlanDeleted }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editPlan, setEditPlan] = useState(null);

  const handleDeletePlan = async (planId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) throw new Error('No JWT token found');
      const plan = plans.find((p) => p._id === planId);
      if (!plan) throw new Error('Plan not found');

      await axios.delete(`${API_BASE_URL}/api/study-planner/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(plans.filter((plan) => plan._id !== planId));
      onPlanDeleted();
      toast.success('Plan deleted.', { style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } });
    } catch (err) {
      toast.error('Failed to delete plan');
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
        toast.success('Plan updated.', { style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } });
      } catch (err) {
        toast.error('Failed to update plan');
        console.error('Edit plan error:', err.response?.data || err.message);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit:   { opacity: 0, y: -12, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}
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
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
              onClick={() => setSelectedPlan(plan)}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: '0.75rem',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                transition: 'border-color 0.15s',
              }}
              onHoverStart={e => {}}
            >
              {/* Card header stripe */}
              <div style={{ height: '3px', background: '#312e81' }} />

              <div style={{ padding: '1rem', maxHeight: '22rem', overflowY: 'auto' }}>
                {/* Action buttons */}
                <div
                  style={{ position: 'absolute', top: '0.6rem', right: '0.5rem', display: 'flex', gap: '0.1rem', zIndex: 2 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setEditPlan(plan)}
                    style={{
                      background: 'transparent', border: 'none', color: T.textDim, cursor: 'pointer',
                      width: '1.75rem', height: '1.75rem', borderRadius: '0.35rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                      transition: 'all 0.15s',
                    }}
                    title="Edit plan"
                    onMouseEnter={e => { e.currentTarget.style.color = T.accentLt; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textDim; e.currentTarget.style.background = 'transparent'; }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    style={{
                      background: 'transparent', border: 'none', color: T.textDim, cursor: 'pointer',
                      width: '1.75rem', height: '1.75rem', borderRadius: '0.35rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                      transition: 'all 0.15s',
                    }}
                    title="Delete plan"
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.textDim; e.currentTarget.style.background = 'transparent'; }}
                  >
                    ✕
                  </button>
                </div>

                {/* Plan title */}
                <h3 style={{
                  margin: '0 2rem 0.75rem 0',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: T.text,
                  lineHeight: 1.3,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {plan.fieldOfStudy}
                </h3>

                {/* Subjects */}
                {plan.subjects.map((subject) => (
                  <div key={subject._id} style={{ marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: T.accentLt, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {subject.name}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', color: T.textDim, fontFamily: 'Inter, system-ui, sans-serif' }}>
                      Due {new Date(subject.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {subject.topics.map((topic) => (
                        <span
                          key={topic._id}
                          style={{
                            background: topic.completed ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                            color: topic.completed ? T.successLt : T.accentLt,
                            border: `1px solid ${topic.completed ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`,
                            borderRadius: '0.3rem',
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.45rem',
                            fontFamily: 'Inter, system-ui, sans-serif',
                          }}
                        >
                          {topic.completed ? '✓ ' : ''}{topic.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Progress bar */}
                {plan.progress !== undefined && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', color: T.textDim }}>Progress</span>
                      <span style={{ fontSize: '0.7rem', color: plan.progress === 100 ? T.successLt : T.accentLt }}>{plan.progress || 0}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#0f172a', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${plan.progress || 0}%`,
                        background: plan.progress === 100 ? T.success : T.accent,
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>
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
    </>
  );
};

export default StudyPlanList;