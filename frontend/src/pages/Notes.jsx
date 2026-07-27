import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DESIGN_TOKENS } from '../styles/designTokens';

const T = DESIGN_TOKENS.colors;
const typography = DESIGN_TOKENS.typography;
const spacing = DESIGN_TOKENS.spacing;
const borderRadius = DESIGN_TOKENS.borderRadius;
const shadows = DESIGN_TOKENS.shadows;

const Notes = () => {
  const [subjects, setSubjects] = useState([
    { _id: '1', name: 'Mathematics', notes: [
      { _id: 'n1', content: 'Calculus is the study of continuous change', penColor: 'amber', penThickness: 3 },
      { _id: 'n2', content: 'Remember: derivatives and integrals are inverse operations', penColor: 'blue', penThickness: 2 }
    ]},
    { _id: '2', name: 'Literature', notes: [
      { _id: 'n3', content: "Shakespeare's metaphors paint vivid imagery", penColor: 'rose', penThickness: 4 }
    ]},
    { _id: '3', name: 'Science', notes: [] },
    { _id: '4', name: 'History', notes: [] }
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newNote, setNewNote] = useState({ content: '', penColor: 'amber', penThickness: 3 });
  const [editSubject, setEditSubject] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const penColors = {
    amber:   { hex: '#F59E0B', label: 'Amber'   },
    blue:    { hex: '#60A5FA', label: 'Blue'     },
    rose:    { hex: '#FB7185', label: 'Rose'     },
    emerald: { hex: '#34D399', label: 'Emerald'  },
    violet:  { hex: '#A78BFA', label: 'Violet'   },
    slate:   { hex: '#94A3B8', label: 'Slate'    },
  };

  const cardBorderColors = [
    { hex: '#F472B6', glow: 'rgba(244, 114, 182, 0.4)' },  // Pink
    { hex: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)' },  // Purple
    { hex: '#60A5FA', glow: 'rgba(96, 165, 250, 0.4)' },  // Blue
    { hex: '#34D399', glow: 'rgba(52, 211, 153, 0.4)' },  // Emerald
    { hex: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' },  // Amber
    { hex: '#FB7185', glow: 'rgba(251, 113, 133, 0.4)' },  // Rose
    { hex: '#22D3EE', glow: 'rgba(34, 211, 238, 0.4)' },  // Cyan
    { hex: '#F87171', glow: 'rgba(248, 113, 113, 0.4)' },  // Red
  ];

  const getCardColor = (index) => cardBorderColors[index % cardBorderColors.length];

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    setSubjects([...subjects, { _id: Date.now().toString(), name: newSubject, notes: [] }]);
    setNewSubject('');
  };

  const handleAddNote = (subjectId, e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    const note = { _id: `n${Date.now()}`, content: newNote.content, penColor: newNote.penColor, penThickness: newNote.penThickness, createdAt: new Date() };
    setSubjects(subjects.map(s => s._id === subjectId ? { ...s, notes: [...s.notes, note] } : s));
    if (selectedSubject?._id === subjectId) setSelectedSubject({ ...selectedSubject, notes: [...selectedSubject.notes, note] });
    setNewNote({ content: '', penColor: 'amber', penThickness: 3 });
  };

  const handleUpdateSubject = () => {
    if (!editSubject?.name.trim()) return;
    setSubjects(subjects.map(s => s._id === editSubject._id ? { ...s, name: editSubject.name } : s));
    if (selectedSubject?._id === editSubject._id) setSelectedSubject({ ...selectedSubject, name: editSubject.name });
    setOpenSubjectDialog(false);
    setEditSubject(null);
  };

  const handleUpdateNote = () => {
    if (!editNote?.content.trim() || !selectedSubject) return;
    setSubjects(subjects.map(s => s._id === selectedSubject._id ? { ...s, notes: s.notes.map(n => n._id === editNote._id ? editNote : n) } : s));
    setSelectedSubject({ ...selectedSubject, notes: selectedSubject.notes.map(n => n._id === editNote._id ? editNote : n) });
    setOpenNoteDialog(false);
    setEditNote(null);
  };

  const handleDelete = (type, subjectId, noteId = null) => {
    if (type === 'subject') {
      setSubjects(subjects.filter(s => s._id !== subjectId));
      if (selectedSubject?._id === subjectId) setSelectedSubject(null);
    } else {
      setSubjects(subjects.map(s => s._id === subjectId ? { ...s, notes: s.notes.filter(n => n._id !== noteId) } : s));
      if (selectedSubject?._id === subjectId) setSelectedSubject({ ...selectedSubject, notes: selectedSubject.notes.filter(n => n._id !== noteId) });
    }
    setDeleteConfirm(null);
  };

  const handleSubjectCardClick = (subject, e) => {
    if (e.target.closest('button')) return;
    setSelectedSubject(subject);
  };

  const C = {
    bg:       T.bg,
    surface:  T.surface,
    raised:   T.card,
    border:   T.border,
    borderHi: T.borderHi,
    text:     T.text,
    muted:    T.textMuted,
    faint:    T.textDim,
    accent:   T.accent,
    accentHi: T.accentLt,
    accentFg: '#FFFFFF',
    danger:   T.danger,
    dangerBg: T.danger + '20',
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, ' + C.bg + ' 0%, #1a1f3c 50%, ' + C.bg + ' 100%)',
      color: C.text,
      fontFamily: typography.fontFamily.sans,
      position: 'relative',
    },
    grain: {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
      backgroundSize: '256px 256px', opacity: 0.5,
    },
    inner: { position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 32px 80px' },
    header: { marginBottom: spacing[12] },
    wordmark: { fontSize: typography.fontSize.xs, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, fontFamily: typography.fontFamily.mono, marginBottom: spacing[8] },
    title: { fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight, color: C.text, letterSpacing: '-0.03em', marginBottom: spacing[3] },
    titleAccent: { 
      background: 'linear-gradient(135deg, #F472B6 0%, #A78BFA 25%, #60A5FA 50%, #34D399 75%, #FBBF24 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: { fontSize: typography.fontSize.base, color: C.muted, fontFamily: typography.fontFamily.mono },
    divider: { width: '40px', height: '1px', background: C.border, margin: spacing[8] + ' 0' },

    formWrap: { marginBottom: '56px' },
    formRow: { display: 'flex', gap: '12px', alignItems: 'stretch' },
    input: {
      flex: 1, background: 'linear-gradient(135deg, ' + C.surface + ' 0%, ' + C.raised + ' 100%)', border: `2px solid ${C.border}`, borderRadius: borderRadius.lg,
      color: C.text, fontSize: typography.fontSize.base, padding: spacing[4] + ' ' + spacing[5], outline: 'none',
      fontFamily: typography.fontFamily.sans, transition: 'all 0.3s ease',
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 50%, #34D399 100%)', color: C.accentFg, border: 'none', borderRadius: borderRadius.lg,
      padding: spacing[4] + ' ' + spacing[6], fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm, cursor: 'pointer',
      fontFamily: typography.fontFamily.sans, letterSpacing: '0.01em', whiteSpace: 'nowrap',
      transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(167, 139, 250, 0.3)',
    },
    btnSecondary: {
      background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
      borderRadius: borderRadius.lg, padding: spacing[3] + ' ' + spacing[4], fontSize: typography.fontSize.sm, cursor: 'pointer',
      fontFamily: typography.fontFamily.sans, transition: 'all 0.2s ease',
    },
    btnDanger: {
      background: 'transparent', color: C.danger, border: `1px solid ${C.dangerBg}`,
      borderRadius: borderRadius.lg, padding: spacing[3] + ' ' + spacing[4], fontSize: typography.fontSize.sm, cursor: 'pointer',
      fontFamily: typography.fontFamily.sans, transition: 'all 0.2s ease',
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
    card: (colorIndex) => ({
      background: 'linear-gradient(145deg, ' + C.surface + ' 0%, ' + C.raised + ' 100%)', 
      border: `2px solid ${cardBorderColors[colorIndex % cardBorderColors.length].hex}`,
      borderRadius: borderRadius.xl,
      padding: spacing[6], cursor: 'pointer', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: `0 0 20px ${cardBorderColors[colorIndex % cardBorderColors.length].glow}20`,
    }),
    cardIndex: (colorIndex) => ({ 
      fontFamily: typography.fontFamily.mono, fontSize: typography.fontSize.xs, 
      color: cardBorderColors[colorIndex % cardBorderColors.length].hex, 
      marginBottom: spacing[4], letterSpacing: '0.1em',
      fontWeight: typography.fontWeight.semibold,
      textShadow: `0 0 10px ${cardBorderColors[colorIndex % cardBorderColors.length].glow}`,
    }),
    cardTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: C.text, marginBottom: spacing[2], lineHeight: typography.lineHeight.tight },
    cardMeta: { fontSize: typography.fontSize.sm, color: C.muted, fontFamily: typography.fontFamily.mono },
    cardActions: { display: 'flex', gap: spacing[2], marginTop: spacing[5], paddingTop: spacing[4], borderTop: `1px solid ${C.borderHi}` },
    cardBtn: {
      background: 'transparent', color: C.muted, border: 'none', padding: spacing[1] + ' ' + spacing[2],
      fontSize: typography.fontSize.xs, cursor: 'pointer', fontFamily: typography.fontFamily.sans,
      borderRadius: borderRadius.sm, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: spacing[1],
    },

    overlay: {
      position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,9,28,0.88)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 24px', overflowY: 'auto',
    },
    panel: {
      width: '100%', maxWidth: '860px', background: 'linear-gradient(145deg, ' + C.surface + ' 0%, ' + C.raised + ' 100%)', border: `1px solid ${C.borderHi}`,
      borderRadius: borderRadius['2xl'], overflow: 'hidden', marginTop: 'auto', marginBottom: 'auto',
      boxShadow: shadows.xl,
    },
    panelHeader: { padding: spacing[7] + ' ' + spacing[8] + ' ' + spacing[6], borderBottom: `1px solid ${C.borderHi}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    panelTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.semibold, color: C.text, letterSpacing: '-0.02em' },
    panelBody: { padding: spacing[7] + ' ' + spacing[8] },

    noteFormWrap: { background: 'linear-gradient(135deg, ' + C.raised + ' 0%, ' + C.surface + ' 100%)', borderRadius: borderRadius.lg, padding: spacing[5], marginBottom: spacing[7], border: `1px solid ${C.borderHi}`, boxShadow: shadows.md },
    textarea: {
      width: '100%', background: 'transparent', border: 'none', color: C.text,
      fontSize: typography.fontSize.base, padding: '0', outline: 'none', resize: 'none', lineHeight: typography.lineHeight.relaxed,
      fontFamily: typography.fontFamily.sans, marginBottom: spacing[4],
      boxSizing: 'border-box',
    },
    noteToolbar: { display: 'flex', gap: spacing[3], alignItems: 'center', flexWrap: 'wrap', paddingTop: spacing[4], borderTop: `1px solid ${C.borderHi}` },
    colorDot: (color, selected) => ({
      width: '24px', height: '24px', borderRadius: '50%', background: penColors[color].hex,
      cursor: 'pointer', border: selected ? `2px solid ${C.text}` : '2px solid transparent',
      outline: selected ? `2px solid ${penColors[color].hex}` : 'none',
      outlineOffset: '2px', transition: 'all 0.2s ease', flexShrink: 0,
      boxShadow: selected ? `0 0 8px ${penColors[color].hex}40` : 'none',
    }),
    thickLabel: { fontSize: typography.fontSize.xs, color: C.muted, fontFamily: typography.fontFamily.mono, marginLeft: 'auto' },
    slider: { accentColor: C.accent, cursor: 'pointer', width: '100px' },

    notesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing[4] },
    noteCard: (color) => ({
      background: 'linear-gradient(135deg, ' + C.bg + ' 0%, ' + C.surface + ' 100%)', borderRadius: borderRadius.lg, padding: spacing[5],
      border: `2px solid ${penColors[color]?.hex || C.accent}`,
      borderLeft: `5px solid ${penColors[color]?.hex || C.accent}`,
      position: 'relative',
      transition: 'all 0.25s ease',
      boxShadow: `0 0 15px ${penColors[color]?.hex || C.accent}30`,
    }),
    noteText: (color, thickness) => ({
      fontSize: `${12 + thickness * 0.4}px`, lineHeight: typography.lineHeight.relaxed,
      color: penColors[color]?.hex || C.accent,
      marginBottom: spacing[4], fontWeight: thickness > 5 ? typography.fontWeight.medium : typography.fontWeight.normal,
    }),
    noteActions: { display: 'flex', gap: spacing[2] },

    dialogOverlay: {
      position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,9,28,0.92)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing[6],
    },
    dialog: {
      background: 'linear-gradient(145deg, ' + C.surface + ' 0%, ' + C.raised + ' 100%)', border: `1px solid ${C.borderHi}`, borderRadius: borderRadius.xl,
      padding: spacing[8], width: '100%', maxWidth: '440px',
      boxShadow: shadows.xl,
    },
    dialogTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: C.text, marginBottom: spacing[5], letterSpacing: '-0.01em' },
    dialogActions: { display: 'flex', gap: spacing[3], justifyContent: 'flex-end', marginTop: spacing[6] },
    label: { fontSize: typography.fontSize.xs, color: C.muted, fontFamily: typography.fontFamily.mono, marginBottom: spacing[2], display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase' },
    select: {
      background: 'linear-gradient(135deg, ' + C.raised + ' 0%, ' + C.surface + ' 100%)', border: `1px solid ${C.border}`, color: C.text,
      borderRadius: borderRadius.lg, padding: spacing[3] + ' ' + spacing[3], fontSize: typography.fontSize.sm, outline: 'none',
      fontFamily: typography.fontFamily.sans, cursor: 'pointer', width: '100%',
    },
    emptyState: { textAlign: 'center', padding: spacing[12] + ' ' + spacing[6], color: C.faint },
    emptyIcon: { fontSize: '48px', marginBottom: spacing[4], opacity: 0.5 },
    emptyText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.mono, color: C.muted },
    emptySubtext: { fontSize: typography.fontSize.xs, color: C.faint, marginTop: spacing[2] },
  };

  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={styles.grain} />

      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.header}>
          {/* <div style={styles.wordmark}>Enchanted Library — v2.0</div> */}
          <h1 style={styles.title}>
            Your Notes,<br />
            <span style={styles.titleAccent}>Kept Well.</span>
          </h1>
          {/* <p style={styles.subtitle}>// {subjects.length} subjects · {subjects.reduce((a, s) => a + s.notes.length, 0)} notes total</p> */}
          <div style={styles.divider} />
        </div>

        {/* Add Subject */}
        <div style={styles.formWrap}>
          <label style={styles.label}>New Subject</label>
          <form onSubmit={handleAddSubject} style={styles.formRow}>
            <input
              style={styles.input}
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              placeholder="e.g. Quantum Physics, Economics..."
              onFocus={e => {
                e.target.style.borderColor = '#A78BFA';
                e.target.style.boxShadow = '0 0 20px rgba(167, 139, 250, 0.3)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
            <motion.button
              type="submit"
              style={styles.btnPrimary}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(167, 139, 250, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              + Add Subject
            </motion.button>
          </form>
        </div>

        {/* Subjects Grid */}
        <div style={styles.grid}>
          <AnimatePresence>
            {subjects.map((subject, i) => {
              const cardColor = getCardColor(i);
              return (
              <motion.div
                key={subject._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                style={styles.card(i)}
                onClick={e => handleSubjectCardClick(subject, e)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cardColor.hex;
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${cardColor.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = cardColor.hex;
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${cardColor.glow}20`;
                }}
              >
                <div style={styles.cardIndex(i)}>{String(i + 1).padStart(2, '0')}</div>
                <div style={styles.cardTitle}>{subject.name}</div>
                <div style={styles.cardMeta}>{subject.notes.length} note{subject.notes.length !== 1 ? 's' : ''}</div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.cardBtn}
                    onClick={e => { e.stopPropagation(); setEditSubject(subject); setOpenSubjectDialog(true); }}
                    onMouseEnter={e => e.target.style.color = cardColor.hex}
                    onMouseLeave={e => e.target.style.color = '#7E7CA8'}
                  >
                    ↗ Edit
                  </button>
                  <button
                    style={{ ...styles.cardBtn, color: '#4A2050' }}
                    onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'subject', subjectId: subject._id }); }}
                    onMouseEnter={e => e.target.style.color = '#F87171'}
                    onMouseLeave={e => e.target.style.color = '#4A2050'}
                  >
                    × Delete
                  </button>
                  <span style={{ ...styles.cardMeta, marginLeft: 'auto' }}>Open →</span>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {subjects.length === 0 && (
          <motion.div
            style={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={styles.emptyIcon}>📚</div>
            <div style={styles.emptyText}>No subjects yet</div>
            <div style={styles.emptySubtext}>Create your first subject to start organizing notes</div>
          </motion.div>
        )}
      </div>

      {/* Subject Panel */}
      <AnimatePresence>
        {selectedSubject && (
          <motion.div
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedSubject(null); }}
          >
            <motion.div
              style={styles.panel}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div style={styles.panelHeader}>
                <div>
                  <div style={{ ...styles.wordmark, marginBottom: '4px' }}>Subject</div>
                  <div style={styles.panelTitle}>{selectedSubject.name}</div>
                </div>
                <button
                  style={styles.btnSecondary}
                  onClick={() => setSelectedSubject(null)}
                  onMouseEnter={e => { e.target.style.color = '#EEEDF8'; e.target.style.borderColor = '#5856A0'; }}
                  onMouseLeave={e => { e.target.style.color = '#7E7CA8'; e.target.style.borderColor = '#38365E'; }}
                >
                  Close ×
                </button>
              </div>

              <div style={styles.panelBody}>
                {/* Add Note */}
                <div style={styles.noteFormWrap}>
                  <form onSubmit={e => handleAddNote(selectedSubject._id, e)}>
                    <textarea
                      style={styles.textarea}
                      rows={4}
                      value={newNote.content}
                      onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Write a note..."
                    />
                    <div style={styles.noteToolbar}>
                      {Object.keys(penColors).map(color => (
                        <div
                          key={color}
                          style={styles.colorDot(color, newNote.penColor === color)}
                          onClick={() => setNewNote({ ...newNote, penColor: color })}
                          title={penColors[color].label}
                        />
                      ))}
                      <span style={styles.thickLabel}>weight: {newNote.penThickness}</span>
                      <input type="range" min={1} max={10} step={1} value={newNote.penThickness} style={styles.slider}
                        onChange={e => setNewNote({ ...newNote, penThickness: Number(e.target.value) })} />
                      <motion.button type="submit" style={{ ...styles.btnPrimary, padding: '10px 20px', fontSize: '13px', marginLeft: 'auto' }}
                        whileHover={{ scale: 1.02, background: '#A8A5FF' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        + Note
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Notes */}
                {selectedSubject.notes.length === 0 ? (
                  <motion.div
                    style={styles.emptyState}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.emptyIcon}>📝</div>
                    <div style={styles.emptyText}>No notes yet</div>
                    <div style={styles.emptySubtext}>Add your first note above</div>
                  </motion.div>
                ) : (
                  <div style={styles.notesGrid}>
                    <AnimatePresence>
                      {selectedSubject.notes.map((note, i) => (
                        <motion.div
                          key={note._id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          style={styles.noteCard(note.penColor)}
                          onMouseEnter={e => {
                            const colorHex = penColors[note.penColor]?.hex || C.accent;
                            e.currentTarget.style.transform = 'translateX(6px) translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 8px 24px ${colorHex}40`;
                            e.currentTarget.style.borderColor = colorHex;
                          }}
                          onMouseLeave={e => {
                            const colorHex = penColors[note.penColor]?.hex || C.accent;
                            e.currentTarget.style.transform = 'translateX(0) translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = `0 0 15px ${colorHex}30`;
                            e.currentTarget.style.borderColor = colorHex;
                          }}
                        >
                          <p style={styles.noteText(note.penColor, note.penThickness)}>{note.content}</p>
                          <div style={styles.noteActions}>
                            <button
                              style={{ ...styles.cardBtn, color: '#7E7CA8' }}
                              onClick={() => { setEditNote(note); setOpenNoteDialog(true); }}
                              onMouseEnter={e => e.target.style.color = '#A8A5FF'}
                              onMouseLeave={e => e.target.style.color = '#7E7CA8'}
                            >
                              ↗ Edit
                            </button>
                            <button
                              style={{ ...styles.cardBtn, color: '#4A2850' }}
                              onClick={() => setDeleteConfirm({ type: 'note', subjectId: selectedSubject._id, noteId: note._id })}
                              onMouseEnter={e => e.target.style.color = '#F87171'}
                              onMouseLeave={e => e.target.style.color = '#4A2850'}
                            >
                              × Delete
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subject Dialog */}
      <AnimatePresence>
        {openSubjectDialog && (
          <motion.div style={styles.dialogOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={styles.dialog} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={styles.dialogTitle}>Rename Subject</div>
              <label style={styles.label}>Subject Name</label>
              <input
                style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
                value={editSubject?.name || ''}
                onChange={e => setEditSubject({ ...editSubject, name: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#8B87FF'}
                onBlur={e => e.target.style.borderColor = '#38365E'}
                autoFocus
              />
              <div style={styles.dialogActions}>
                <button style={styles.btnSecondary} onClick={() => setOpenSubjectDialog(false)}>Cancel</button>
                <button style={styles.btnPrimary} onClick={handleUpdateSubject}>Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Note Dialog */}
      <AnimatePresence>
        {openNoteDialog && (
          <motion.div style={styles.dialogOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ ...styles.dialog, maxWidth: '520px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={styles.dialogTitle}>Edit Note</div>
              <label style={styles.label}>Content</label>
              <textarea
                style={{ ...styles.textarea, background: '#2C2A52', border: '1px solid #38365E', borderRadius: '8px', padding: '12px 14px', width: '100%', boxSizing: 'border-box', marginBottom: '16px' }}
                rows={5}
                value={editNote?.content || ''}
                onChange={e => setEditNote({ ...editNote, content: e.target.value })}
                autoFocus
              />
              <label style={styles.label}>Ink Color</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {Object.keys(penColors).map(color => (
                  <div key={color} style={styles.colorDot(color, editNote?.penColor === color)}
                    onClick={() => setEditNote({ ...editNote, penColor: color })} title={penColors[color].label} />
                ))}
              </div>
              <label style={styles.label}>Weight: {editNote?.penThickness || 3}</label>
              <input type="range" min={1} max={10} step={1} value={editNote?.penThickness || 3} style={{ ...styles.slider, width: '100%' }}
                onChange={e => setEditNote({ ...editNote, penThickness: Number(e.target.value) })} />
              <div style={styles.dialogActions}>
                <button style={styles.btnSecondary} onClick={() => setOpenNoteDialog(false)}>Cancel</button>
                <button style={styles.btnPrimary} onClick={handleUpdateNote}>Save Note</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div style={styles.dialogOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ ...styles.dialog, maxWidth: '380px', borderColor: '#3A2020' }}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{ ...styles.dialogTitle, color: '#F87171' }}>Delete {deleteConfirm?.type}?</div>
              <p style={{ fontSize: '14px', color: '#5C5751', lineHeight: 1.6 }}>
                This {deleteConfirm?.type} will be permanently removed. There's no undo.
              </p>
              <div style={styles.dialogActions}>
                <button style={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Keep It</button>
                <button style={styles.btnDanger}
                  onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.subjectId, deleteConfirm.noteId)}
                  onMouseEnter={e => { e.target.style.background = '#3A2020'; e.target.style.color = '#F87171'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#F87171'; }}
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;