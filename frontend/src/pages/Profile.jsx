import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaPlus, FaGraduationCap, FaCalendarAlt, FaTrophy, FaStar, FaBookOpen, FaChartLine } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';

// ─── Design tokens (same palette as Notes) ────────────────────────────────────
const C = {
  bg:       '#1C1A35',
  surface:  '#242240',
  raised:   '#2C2A52',
  border:   '#38365E',
  borderHi: '#5856A0',
  text:     '#EEEDF8',
  muted:    '#7E7CA8',
  faint:    '#3E3C68',
  accent:   '#8B87FF',
  accentHi: '#A8A5FF',
  danger:   '#F87171',
  success:  '#34D399',
};

const font   = '"Inter", system-ui, sans-serif';
const mono   = '"JetBrains Mono", monospace';

// ─── Shared style objects ──────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    color: C.text,
    fontFamily: font,
    padding: '0',
  },
  inner: {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '56px 32px 80px',
  },

  // cards
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '14px',
    padding: '28px 32px',
    transition: 'border-color 0.2s',
  },

  // typography
  label: {
    fontFamily: mono,
    fontSize: '11px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.muted,
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: C.text,
    letterSpacing: '-0.02em',
    margin: 0,
  },

  // buttons
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 22px',
    fontFamily: font,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s, transform 0.1s',
    whiteSpace: 'nowrap',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    color: C.muted,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    padding: '10px 18px',
    fontFamily: font,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  // tabs
  tabActive: {
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontFamily: font,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabInactive: {
    background: 'transparent',
    color: C.muted,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    padding: '10px 20px',
    fontFamily: font,
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.15s',
  },

  // stat pill
  statWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statNum: {
    fontSize: '24px',
    fontWeight: 700,
    color: C.accent,
    lineHeight: 1,
  },
  statLab: {
    fontFamily: mono,
    fontSize: '11px',
    color: C.muted,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

// ─── Loading screen ────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', background: C.bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '20px', fontFamily: font,
  }}>
    <motion.div
      style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: `3px solid ${C.border}`, borderTopColor: C.accent,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
    <div style={{ color: C.text, fontSize: '16px', fontWeight: 500 }}>Loading profile…</div>
    <div style={{ color: C.muted, fontFamily: mono, fontSize: '12px' }}>fetching your study data</div>
  </div>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => (
  <div style={{
    width: '72px', height: '72px', borderRadius: '50%',
    background: C.raised, border: `2px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: 700, color: C.accent,
    flexShrink: 0,
  }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

// ─── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value, delay = 0 }) => (
  <div style={{ background: C.raised, borderRadius: '4px', height: '6px', overflow: 'hidden', width: '100%' }}>
    <motion.div
      style={{ height: '100%', background: C.accent, borderRadius: '4px' }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
    />
  </div>
);

// ─── Plan card ────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, index, isCompleted }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...S.card,
        borderColor: hovered ? C.borderHi : C.border,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.3 }}>
          {plan.fieldOfStudy}
        </h3>
        <span style={{
          fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em',
          color: isCompleted ? C.success : C.accent,
          background: isCompleted ? `${C.success}18` : `${C.accent}18`,
          border: `1px solid ${isCompleted ? C.success : C.accent}44`,
          borderRadius: '20px', padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {isCompleted ? '✓ done' : '● active'}
        </span>
      </div>

      {/* description */}
      {plan.description && (
        <p style={{ fontSize: '13px', color: C.muted, margin: 0, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {plan.description}
        </p>
      )}

      {/* progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ ...S.label }}>Progress</span>
          <span style={{ fontFamily: mono, fontSize: '12px', color: C.accent }}>{plan.progress}%</span>
        </div>
        <ProgressBar value={plan.progress} delay={index * 0.06} />
      </div>

      {/* date */}
      {plan.createdAt && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.faint }}>
          <FaCalendarAlt style={{ fontSize: '11px' }} />
          <span style={{ fontFamily: mono, fontSize: '11px' }}>
            {new Date(plan.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ─── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ tab, onCta }) => (
  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px' }}>
    <div style={{
      width: '56px', height: '56px', borderRadius: '50%',
      background: C.raised, border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px', color: C.faint, fontSize: '22px',
    }}>
      <FaBookOpen />
    </div>
    <div style={{ fontSize: '16px', fontWeight: 500, color: C.text, marginBottom: '6px' }}>
      No {tab} plans yet
    </div>
    <div style={{ fontSize: '13px', color: C.muted, marginBottom: '24px' }}>
      {tab === 'current'
        ? 'Create your first study plan to get started.'
        : 'Finished plans will appear here.'}
    </div>
    {tab === 'current' && (
      <button
        style={S.btnPrimary}
        onClick={onCta}
        onMouseEnter={e => e.currentTarget.style.background = C.accentHi}
        onMouseLeave={e => e.currentTarget.style.background = C.accent}
      >
        <FaPlus /> Create a Plan
      </button>
    )}
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
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
        toast.error('Please log in to view your profile');
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setStudyPlans(res.data.studyPlans);
        setLoading(false);
      } catch {
        toast.error('Failed to load profile. Please try again.');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <LoadingScreen />;

  const totalPlans = studyPlans.current.length + studyPlans.completed.length;
  const avgProgress = studyPlans.current.length > 0
    ? Math.round(studyPlans.current.reduce((s, p) => s + p.progress, 0) / studyPlans.current.length)
    : 0;

  return (
    <motion.div
      style={S.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={S.inner}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '48px' }}
        >
          <div style={S.label}>Your workspace</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: C.text,
            letterSpacing: '-0.03em', margin: '8px 0 10px', lineHeight: 1.05 }}>
            Welcome back,{' '}
            <span style={{ color: C.accent }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ fontSize: '15px', color: C.muted, margin: 0 }}>
            Track your study plans and monitor your learning progress.
          </p>
        </motion.div>

        {/* ── Profile card ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{ ...S.card, marginBottom: '24px' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: '24px' }}>

            {/* left: avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Avatar name={user?.name} />
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: C.text,
                  letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                  {user?.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px',
                  color: C.muted, fontSize: '13px', fontFamily: mono }}>
                  <FaGraduationCap />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* right: stats */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={S.statWrap}>
                <div style={S.statNum}>{totalPlans}</div>
                <div style={S.statLab}>Total Plans</div>
              </div>
              <div style={{ width: '1px', background: C.border, alignSelf: 'stretch' }} />
              <div style={S.statWrap}>
                <div style={{ ...S.statNum, color: C.success }}>{studyPlans.completed.length}</div>
                <div style={S.statLab}>Completed</div>
              </div>
              <div style={{ width: '1px', background: C.border, alignSelf: 'stretch' }} />
              <div style={S.statWrap}>
                <div style={{ ...S.statNum, color: C.accentHi }}>{avgProgress}%</div>
                <div style={S.statLab}>Avg Progress</div>
              </div>
            </div>
          </div>

          {/* divider */}
          <div style={{ height: '1px', background: C.border, margin: '24px 0' }} />

          <button
            style={S.btnPrimary}
            onClick={() => navigate('/study-planner')}
            onMouseEnter={e => { e.currentTarget.style.background = C.accentHi; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'none'; }}
          >
            <FaPlus /> Create New Study Plan
          </button>
        </motion.div>

        {/* ── Study plans ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          style={S.card}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          {/* section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBookOpen style={{ color: C.accent, fontSize: '18px' }} />
              <h2 style={S.sectionTitle}>Study Plans</h2>
            </div>

            {/* tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={activeTab === 'current' ? S.tabActive : S.tabInactive}
                onClick={() => setActiveTab('current')}
                onMouseEnter={e => { if (activeTab !== 'current') { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={e => { if (activeTab !== 'current') { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}
              >
                <FaChartLine />
                Current
                <span style={{
                  background: activeTab === 'current' ? 'rgba(255,255,255,0.2)' : C.raised,
                  borderRadius: '20px', padding: '1px 8px',
                  fontFamily: mono, fontSize: '11px',
                }}>
                  {studyPlans.current.length}
                </span>
              </button>

              <button
                style={activeTab === 'completed' ? S.tabActive : S.tabInactive}
                onClick={() => setActiveTab('completed')}
                onMouseEnter={e => { if (activeTab !== 'completed') { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={e => { if (activeTab !== 'completed') { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}
              >
                <FaTrophy />
                Completed
                <span style={{
                  background: activeTab === 'completed' ? 'rgba(255,255,255,0.2)' : C.raised,
                  borderRadius: '20px', padding: '1px 8px',
                  fontFamily: mono, fontSize: '11px',
                }}>
                  {studyPlans.completed.length}
                </span>
              </button>
            </div>
          </div>

          {/* plans grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {studyPlans[activeTab].length === 0 ? (
                <EmptyState tab={activeTab} onCta={() => navigate('/study-planner')} />
              ) : (
                studyPlans[activeTab].map((plan, i) => (
                  <PlanCard key={plan._id} plan={plan} index={i} isCompleted={activeTab === 'completed'} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Profile;