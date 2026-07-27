import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaCalendarAlt, FaTrophy, FaBookOpen, FaChartLine,
  FaClipboardList, FaCheckCircle, FaEnvelope, FaEllipsisV, FaChevronRight,
  FaClock, FaFire, FaCode, FaSquareRootAlt, FaAtom, FaFlask, FaDna,
  FaPalette, FaLanguage,
} from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';
import profileHero from '../assets/profile-hero.png';

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:        '#07071a',
  surface:   '#121228',
  surfaceLo: '#0c0c20',
  raised:    '#1a1a38',
  border:    '#232145',
  borderHi:  '#4A3FA0',
  text:      '#F3F2FA',
  muted:     '#8B88AE',
  faint:     '#5C5A82',
  accent:    '#7B61F0',
  accentHi:  '#9483F5',
  accentBg:  'rgba(123,97,240,0.14)',
  gradFrom:  '#8B6FF0',
  gradTo:    '#5A47E0',
  success:   '#34D399',
  successBg: 'rgba(52,211,153,0.13)',
  info:      '#60A5FA',
  infoBg:    'rgba(96,165,250,0.13)',
  warn:      '#FB923C',
  warnBg:    'rgba(251,146,60,0.13)',
};

const font = '"Inter", system-ui, sans-serif';
const gradientText = `linear-gradient(135deg, ${C.gradFrom}, #6E8CF5)`;
const gradientBtn = `linear-gradient(135deg, ${C.gradFrom}, ${C.gradTo})`;

// ─── Shared style objects ───────────────────────────────────────────────────
const S = {
  page: { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: font },
  inner: { maxWidth: '1180px', margin: '0 auto', padding: '48px 32px 80px' },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '18px',
    padding: '28px 32px',
    transition: 'border-color 0.2s',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.accentHi,
  },
  sectionTitle: { fontSize: '22px', fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: 0 },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '10px',
    background: gradientBtn, color: '#fff', border: 'none', borderRadius: '12px',
    padding: '14px 24px', fontFamily: font, fontSize: '15px', fontWeight: 600,
    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', whiteSpace: 'nowrap',
    boxShadow: '0 8px 24px rgba(123,97,240,0.28)',
  },
  tabActive: {
    background: gradientBtn, color: '#fff', border: 'none', borderRadius: '10px',
    padding: '10px 18px', fontFamily: font, fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '9px',
  },
  tabInactive: {
    background: C.surfaceLo, color: C.muted, border: `1px solid ${C.border}`, borderRadius: '10px',
    padding: '10px 18px', fontFamily: font, fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '9px', transition: 'all 0.15s',
  },
};

// ─── Loading screen ─────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'column', gap: '20px', fontFamily: font }}>
    <motion.div
      style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accent }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
    <div style={{ color: C.text, fontSize: '16px', fontWeight: 500 }}>Loading profile…</div>
    <div style={{ color: C.muted, fontSize: '12px' }}>fetching your study data</div>
  </div>
);

// ─── Avatar ─────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => (
  <div style={{
    width: '72px', height: '72px', borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.gradFrom}, ${C.gradTo})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: 700, color: '#fff', flexShrink: 0,
    boxShadow: '0 8px 20px rgba(123,97,240,0.3)',
  }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

// ─── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ value, delay = 0 }) => (
  <div style={{ background: C.raised, borderRadius: '5px', height: '8px', overflow: 'hidden', width: '100%' }}>
    <motion.div
      style={{ height: '100%', background: gradientBtn, borderRadius: '5px' }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
    />
  </div>
);

// ─── Stat block (profile card) ──────────────────────────────────────────────
const StatBlock = ({ icon, iconBg, iconColor, value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '52px', height: '52px', borderRadius: '14px', background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: iconColor, fontSize: '20px', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px', whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  </div>
);

const VDivider = ({ height = 44 }) => (
  <div style={{ width: '1px', height: `${height}px`, background: C.border, margin: '0 28px', flexShrink: 0 }} />
);

// ─── Subject icon picker ─────────────────────────────────────────────────────
const getSubjectIcon = (field = '') => {
  const f = field.toLowerCase();
  if (f.includes('comput') || f.includes('program') || f.includes('code') || f.includes('software')) return FaCode;
  if (f.includes('math')) return FaSquareRootAlt;
  if (f.includes('physic')) return FaAtom;
  if (f.includes('chem')) return FaFlask;
  if (f.includes('bio')) return FaDna;
  if (f.includes('art') || f.includes('design')) return FaPalette;
  if (f.includes('lang') || f.includes('english') || f.includes('literat')) return FaLanguage;
  return FaBookOpen;
};

// ─── Plan card ────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, index, isCompleted, onView }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = getSubjectIcon(plan.fieldOfStudy);

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
        display: 'flex', flexDirection: 'column', gap: '18px',
      }}
    >
      {/* top row: icon + title/status + kebab */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', background: C.accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accentHi,
            fontSize: '18px', flexShrink: 0,
          }}>
            <Icon />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: C.text, margin: '0 0 6px', lineHeight: 1.2 }}>
              {plan.fieldOfStudy}
            </h3>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 600, color: isCompleted ? C.success : '#4ADE80',
              background: isCompleted ? C.successBg : 'rgba(74,222,128,0.13)',
              borderRadius: '20px', padding: '3px 10px', whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: isCompleted ? C.success : '#4ADE80', display: 'inline-block',
              }} />
              {isCompleted ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
        <button
          onClick={() => toast('More actions coming soon')}
          style={{
            background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer',
            padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.raised; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}
        >
          <FaEllipsisV />
        </button>
      </div>

      {/* progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>
            Progress
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{plan.progress}%</span>
        </div>
        <ProgressBar value={plan.progress} delay={index * 0.06} />
      </div>

      {/* bottom row: date + view plan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {plan.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: C.faint, fontSize: '13px' }}>
            <FaCalendarAlt style={{ fontSize: '12px' }} />
            {new Date(plan.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
        <button
          onClick={() => onView(plan)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: C.raised, color: C.text, border: `1px solid ${C.border}`,
            borderRadius: '9px', padding: '9px 16px', fontFamily: font, fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', marginLeft: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.background = C.border; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.raised; }}
        >
          View Plan <FaChevronRight style={{ fontSize: '11px' }} />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Quick Insights card ─────────────────────────────────────────────────────
const InsightRow = ({ icon, iconBg, iconColor, label, value, valueColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '44px', height: '44px', borderRadius: '12px', background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor,
      fontSize: '16px', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '13px', color: C.muted, marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  </div>
);

const QuickInsights = ({ mostActiveDay, totalStudyTime, longestStreak }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: 0.15 }}
    style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '22px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FaChartLine style={{ color: C.accentHi, fontSize: '17px' }} />
      <h3 style={{ fontSize: '17px', fontWeight: 700, color: C.text, margin: 0 }}>Quick Insights</h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <InsightRow icon={<FaCalendarAlt />} iconBg={C.accentBg} iconColor={C.accentHi}
        label="Most Active Day" value={mostActiveDay} valueColor={C.accentHi} />
      <InsightRow icon={<FaClock />} iconBg={C.successBg} iconColor={C.success}
        label="Total Study Time" value={totalStudyTime} valueColor={C.success} />
      <InsightRow icon={<FaFire />} iconBg={C.warnBg} iconColor={C.warn}
        label="Longest Streak" value={longestStreak} valueColor={C.accentHi} />
    </div>
  </motion.div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
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
      {tab === 'current' ? 'Create your first study plan to get started.' : 'Finished plans will appear here.'}
    </div>
    {tab === 'current' && (
      <button
        style={S.btnPrimary}
        onClick={onCta}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <FaPlus /> Create a Plan
      </button>
    )}
  </div>
);

// ─── Insights computation (derived from real plan data) ────────────────────
const computeInsights = (allPlans) => {
  if (!allPlans.length) {
    return { mostActiveDay: '—', totalStudyTime: '0h 0m', longestStreak: '0 days' };
  }
  const dayCounts = {};
  const dateSet = new Set();
  let totalMinutes = 0;

  allPlans.forEach(p => {
    const d = new Date(p.createdAt || Date.now());
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
    dateSet.add(d.toISOString().slice(0, 10));
    // estimated study minutes contributed by each plan based on its progress
    totalMinutes += Math.round((p.progress || 0) * 2.5) + 60;
  });

  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0];

  const sortedDates = Array.from(dateSet).map(s => new Date(s).getTime()).sort((a, b) => a - b);
  let longest = sortedDates.length ? 1 : 0;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.round((sortedDates[i] - sortedDates[i - 1]) / 86400000);
    if (diffDays === 1) { current += 1; longest = Math.max(longest, current); }
    else if (diffDays > 1) { current = 1; }
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return {
    mostActiveDay,
    totalStudyTime: `${h}h ${m}m`,
    longestStreak: `${longest} day${longest === 1 ? '' : 's'}`,
  };
};

// ─── Main component ────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [studyPlans, setStudyPlans] = useState({ current: [], completed: [] });
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
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

  const insights = computeInsights([...studyPlans.current, ...studyPlans.completed]);
  const handleViewPlan = () => navigate('/study-planner');

  return (
    <motion.div style={S.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .profile-hero-img { display: block; }
        @media (max-width: 900px) { .profile-hero-img { display: none; } }
        @media (max-width: 640px) { .profile-stats-row { flex-direction: column; align-items: flex-start !important; } }
      `}</style>

      <div style={S.inner}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', marginBottom: '44px' }}
        >
          <div>
            <div style={S.label}>Your Workspace</div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: C.text,
              letterSpacing: '-0.03em', margin: '10px 0 12px', lineHeight: 1.05 }}>
              Welcome back,{' '}
              <span style={{
                background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {user?.name?.split(' ')[0]}
              </span>
            </h1>
            <p style={{ fontSize: '16px', color: C.muted, margin: 0 }}>
              Track your study plans and monitor your learning progress.
            </p>
          </div>
          <img
            src={profileHero}
            alt=""
            className="profile-hero-img"
            style={{ width: '280px', maxWidth: '32vw', height: 'auto', flexShrink: 0, userSelect: 'none' }}
          />
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
          <div className="profile-stats-row" style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
          }}>
            {/* left: avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Avatar name={user?.name} />
              <div>
                <h2 style={{ fontSize: '23px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                  {user?.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '14px' }}>
                  <FaEnvelope style={{ fontSize: '12px' }} />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* right: stats */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <StatBlock icon={<FaClipboardList />} iconBg={C.accentBg} iconColor={C.accentHi}
                value={totalPlans} label="Total Plans" />
              <VDivider />
              <StatBlock icon={<FaCheckCircle />} iconBg={C.successBg} iconColor={C.success}
                value={studyPlans.completed.length} label="Completed" />
              <VDivider />
              <StatBlock icon={<FaChartLine />} iconBg={C.infoBg} iconColor={C.info}
                value={`${avgProgress}%`} label="Avg Progress" />
            </div>
          </div>

          <div style={{ height: '1px', background: C.border, margin: '26px 0' }} />

          <button
            style={S.btnPrimary}
            onClick={() => navigate('/study-planner')}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
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
              <FaBookOpen style={{ color: C.accentHi, fontSize: '18px' }} />
              <h2 style={S.sectionTitle}>Study Plans</h2>
            </div>

            {/* tabs */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={activeTab === 'current' ? S.tabActive : S.tabInactive}
                onClick={() => setActiveTab('current')}
                onMouseEnter={e => { if (activeTab !== 'current') { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={e => { if (activeTab !== 'current') { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; } }}
              >
                <FaChartLine />
                Current
                <span style={{
                  background: activeTab === 'current' ? 'rgba(255,255,255,0.22)' : C.raised,
                  borderRadius: '20px', padding: '1px 9px', fontSize: '12px', fontWeight: 700,
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
                  background: activeTab === 'completed' ? 'rgba(255,255,255,0.22)' : C.raised,
                  borderRadius: '20px', padding: '1px 9px', fontSize: '12px', fontWeight: 700,
                }}>
                  {studyPlans.completed.length}
                </span>
              </button>
            </div>
          </div>

          {/* plans grid + quick insights */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                alignItems: 'start',
              }}
            >
              {studyPlans[activeTab].length === 0 ? (
                <>
                  <EmptyState tab={activeTab} onCta={() => navigate('/study-planner')} />
                  <QuickInsights {...insights} />
                </>
              ) : (
                <>
                  {studyPlans[activeTab].map((plan, i) => (
                    <PlanCard key={plan._id} plan={plan} index={i} isCompleted={activeTab === 'completed'} onView={handleViewPlan} />
                  ))}
                  <QuickInsights {...insights} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Profile;