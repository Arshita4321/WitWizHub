import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_BASE_URL } from "../config/api.js";

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  surface:   '#1e293b',
  surfaceHi: '#263348',
  border:    '#334155',
  borderFocus:'#6366f1',
  text:      '#f1f5f9',
  textMuted: '#94a3b8',
  textDim:   '#64748b',
  accent:    '#6366f1',
  accentHover:'#4f46e5',
  danger:    '#ef4444',
  dangerBg:  'rgba(239,68,68,0.08)',
  dangerBorder:'rgba(239,68,68,0.3)',
};

const inputStyle = {
  width: '100%',
  background: '#0f172a',
  border: `1px solid ${T.border}`,
  borderRadius: '0.5rem',
  color: T.text,
  fontSize: '0.875rem',
  padding: '0.6rem 0.85rem',
  outline: 'none',
  fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: T.textMuted,
  marginBottom: '0.35rem',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const StudyPlanForm = ({ onPlanCreated }) => {
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', deadline: '', topics: [''] }]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
      if (!token) throw new Error('No authentication token found');

      const formattedSubjects = subjects.map((subject) => ({
        name: subject.name,
        deadline: subject.deadline,
        topics: subject.topics.map((topic) => ({ name: topic })),
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/study-planner/plans`,
        { fieldOfStudy, subjects: formattedSubjects },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPlanCreated(response.data);
      setFieldOfStudy('');
      setSubjects([{ name: '', deadline: '', topics: [''] }]);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create study plan');
      setLoading(false);
      toast.error('Failed to create plan');
      console.error('Create plan error:', err);
    }
  };

  const getFocusStyle = (id) =>
    focusedField === id ? { borderColor: T.borderFocus, boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' } : {};

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, sans-serif' }}>
          New Plan
        </span>
        <div style={{ flex: 1, height: '1px', background: T.border }} />
      </div>

      {error && (
        <div style={{ background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: '0.5rem', padding: '0.7rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {error}
        </div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Field of Study */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Field of Study *</label>
          <input
            type="text"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            placeholder="e.g. Computer Science, Mathematics"
            required
            style={{ ...inputStyle, ...getFocusStyle('fieldOfStudy') }}
            onFocus={() => setFocusedField('fieldOfStudy')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {/* Subjects */}
        {subjects.map((subject, subjectIndex) => (
          <div
            key={subjectIndex}
            style={{
              background: '#162032',
              border: `1px solid ${T.border}`,
              borderRadius: '0.625rem',
              padding: '1.1rem',
              marginBottom: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: T.textMuted, fontFamily: 'Inter, system-ui, sans-serif' }}>
                Subject {subjectIndex + 1}
              </span>
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subjectIndex)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.dangerBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  ✕ Remove
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Subject Name *</label>
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(subjectIndex, 'name', e.target.value)}
                  placeholder="e.g. Algorithms"
                  required
                  style={{ ...inputStyle, ...getFocusStyle(`sub-name-${subjectIndex}`) }}
                  onFocus={() => setFocusedField(`sub-name-${subjectIndex}`)}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              <div>
                <label style={labelStyle}>Deadline *</label>
                <input
                  type="date"
                  value={subject.deadline}
                  onChange={(e) => handleSubjectChange(subjectIndex, 'deadline', e.target.value)}
                  required
                  style={{ ...inputStyle, colorScheme: 'dark', ...getFocusStyle(`sub-date-${subjectIndex}`) }}
                  onFocus={() => setFocusedField(`sub-date-${subjectIndex}`)}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Topics */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Topics</label>
              {subject.topics.map((topic, topicIndex) => (
                <div key={topicIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => handleTopicChange(subjectIndex, topicIndex, e.target.value)}
                    placeholder={`Topic ${topicIndex + 1}`}
                    required
                    style={{ ...inputStyle, flex: 1, ...getFocusStyle(`topic-${subjectIndex}-${topicIndex}`) }}
                    onFocus={() => setFocusedField(`topic-${subjectIndex}-${topicIndex}`)}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(subjectIndex, topicIndex)}
                    disabled={subject.topics.length === 1}
                    style={{
                      background: 'transparent', border: `1px solid ${T.border}`,
                      color: subject.topics.length === 1 ? T.textDim : '#f87171',
                      borderRadius: '0.375rem', width: '2rem', height: '2rem',
                      cursor: subject.topics.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                    title="Remove topic"
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddTopic(subjectIndex)}
                style={{
                  background: 'transparent', border: `1px dashed ${T.border}`,
                  color: T.textMuted, borderRadius: '0.375rem', padding: '0.35rem 0.75rem',
                  cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
                  marginTop: '0.25rem', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
              >
                + Add Topic
              </button>
            </div>
          </div>
        ))}

        {/* Add Subject */}
        <button
          type="button"
          onClick={handleAddSubject}
          style={{
            background: 'transparent', border: `1px dashed ${T.border}`,
            color: T.textMuted, borderRadius: '0.5rem', padding: '0.5rem 1rem',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
            width: '100%', marginBottom: '1rem', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
        >
          + Add Another Subject
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '0.7rem',
            background: loading ? '#3730a3' : T.accent,
            color: '#fff', border: 'none',
            borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif', transition: 'background 0.15s',
            opacity: loading ? 0.75 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.accentHover; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.accent; }}
        >
          {loading ? 'Creating plan…' : 'Create Study Plan'}
        </button>
      </motion.form>
    </div>
  );
};

export default StudyPlanForm;