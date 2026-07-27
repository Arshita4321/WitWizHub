import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, BookOpen, FlaskConical, Landmark, Atom, Globe, Music, Code2,
  Pencil, Trash2, ArrowRight, Star, Sparkles, ClipboardList, CloudUpload,
  Lightbulb, X, BookMarked,
} from 'lucide-react';
import { DESIGN_TOKENS } from '../styles/designTokens';

const typography = DESIGN_TOKENS.typography;
const spacing = DESIGN_TOKENS.spacing;
const borderRadius = DESIGN_TOKENS.borderRadius;
const shadows = DESIGN_TOKENS.shadows;

// Palette tuned to match the reference design
const PAGE_BG = '#080b16';
const PAGE_BG_2 = '#0d1224';
const CARD_BG = '#0c1020';
const CARD_BG_2 = '#0a0e1c';
const TEXT = '#f5f6fb';
const MUTED = '#8b93ab';
const FAINT = '#5b6178';
const BORDER = '#1c2138';

const cardThemes = [
  { hex: '#FB4570', soft: 'rgba(251, 69, 112, 0.14)', glow: 'rgba(251, 69, 112, 0.28)', icon: Calculator },
  { hex: '#8B5CF6', soft: 'rgba(139, 92, 246, 0.16)', glow: 'rgba(139, 92, 246, 0.30)', icon: BookOpen },
  { hex: '#3B82F6', soft: 'rgba(59, 130, 246, 0.16)', glow: 'rgba(59, 130, 246, 0.30)', icon: FlaskConical },
  { hex: '#22C55E', soft: 'rgba(34, 197, 94, 0.16)', glow: 'rgba(34, 197, 94, 0.30)', icon: Landmark },
  { hex: '#F59E0B', soft: 'rgba(245, 158, 11, 0.16)', glow: 'rgba(245, 158, 11, 0.30)', icon: Atom },
  { hex: '#22D3EE', soft: 'rgba(34, 211, 238, 0.16)', glow: 'rgba(34, 211, 238, 0.30)', icon: Globe },
  { hex: '#F472B6', soft: 'rgba(244, 114, 182, 0.16)', glow: 'rgba(244, 114, 182, 0.30)', icon: Music },
  { hex: '#A78BFA', soft: 'rgba(167, 139, 250, 0.16)', glow: 'rgba(167, 139, 250, 0.30)', icon: Code2 },
];

const getTheme = (index) => cardThemes[index % cardThemes.length];

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

  const styles = {
    page: {
      minHeight: '100vh',
      background: `radial-gradient(1100px 500px at 85% -5%, rgba(139,92,246,0.16), transparent 60%), radial-gradient(900px 500px at 10% 10%, rgba(59,130,246,0.10), transparent 55%), linear-gradient(180deg, ${PAGE_BG} 0%, ${PAGE_BG_2} 100%)`,
      color: TEXT,
      fontFamily: typography.fontFamily.sans,
      position: 'relative',
    },
    inner: { position: 'relative', zIndex: 1, maxWidth: '1180px', margin: '0 auto', padding: '56px 32px 64px' },

    heroRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[8], marginBottom: '48px', flexWrap: 'wrap' },
    heroLeft: { flex: '1 1 420px', minWidth: '300px' },
    title: { fontSize: 'clamp(38px, 5.4vw, 64px)', fontWeight: 800, lineHeight: 1.08, color: TEXT, letterSpacing: '-0.03em', margin: 0 },
    titleAccent: {
      background: 'linear-gradient(90deg, #8B5CF6 0%, #6D8CF7 30%, #38BDF8 55%, #34D399 80%, #A3E635 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: { fontSize: '17px', color: MUTED, lineHeight: 1.6, marginTop: '20px', maxWidth: '440px', fontWeight: 400 },
    heroRight: { flex: '0 0 auto', width: '360px', maxWidth: '100%' },

    formWrap: { marginBottom: '32px' },
    label: { fontSize: '13px', color: '#A78BFA', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: spacing[3], display: 'block' },
    formRow: { display: 'flex', gap: '14px', alignItems: 'stretch', flexWrap: 'wrap' },
    input: {
      flex: '1 1 320px', background: CARD_BG, border: `1.5px solid ${BORDER}`, borderRadius: '14px',
      color: TEXT, fontSize: '15px', padding: '16px 20px', outline: 'none',
      fontFamily: typography.fontFamily.sans, transition: 'all 0.25s ease',
    },
    btnPrimary: {
      background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 55%, #2DD4BF 100%)', color: '#0b0e1a', border: 'none', borderRadius: '999px',
      padding: '16px 30px', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
      fontFamily: typography.fontFamily.sans, whiteSpace: 'nowrap',
      transition: 'all 0.25s ease', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
      display: 'flex', alignItems: 'center', gap: '8px',
    },
    btnSecondary: {
      background: 'transparent', color: MUTED, border: `1px solid ${BORDER}`,
      borderRadius: borderRadius.lg, padding: spacing[3] + ' ' + spacing[4], fontSize: typography.fontSize.sm, cursor: 'pointer',
      fontFamily: typography.fontFamily.sans, transition: 'all 0.2s ease',
    },
    btnDanger: {
      background: 'transparent', color: '#F87171', border: `1px solid rgba(248,113,113,0.3)`,
      borderRadius: borderRadius.lg, padding: spacing[3] + ' ' + spacing[4], fontSize: typography.fontSize.sm, cursor: 'pointer',
      fontFamily: typography.fontFamily.sans, transition: 'all 0.2s ease',
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' },
    card: (theme) => ({
      background: `linear-gradient(160deg, ${CARD_BG} 0%, ${CARD_BG_2} 100%)`,
      border: `1.5px solid ${theme.hex}`,
      borderRadius: '20px',
      padding: '26px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
      transition: 'all 0.25s ease',
      boxShadow: `0 0 0 rgba(0,0,0,0)`,
    }),
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' },
    cardIndex: (theme) => ({
      fontFamily: typography.fontFamily.mono, fontSize: '13px',
      color: theme.hex, background: theme.soft,
      padding: '4px 10px', borderRadius: '8px',
      fontWeight: 700, letterSpacing: '0.02em',
    }),
    iconBadge: (theme) => ({
      width: '44px', height: '44px', borderRadius: '50%',
      background: theme.hex, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 6px 18px ${theme.glow}`, flexShrink: 0,
    }),
    cardTitle: { fontSize: '22px', fontWeight: 700, color: TEXT, marginBottom: '6px', lineHeight: 1.25 },
    cardMeta: { fontSize: '14px', color: MUTED },
    cardDivider: { height: '1px', background: BORDER, margin: '18px 0 16px' },
    cardActions: { display: 'flex', gap: '18px', alignItems: 'center' },
    cardBtn: {
      background: 'transparent', color: '#7E85A3', border: 'none', padding: '0',
      fontSize: '14px', cursor: 'pointer', fontFamily: typography.fontFamily.sans,
      transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500,
    },
    openLink: (theme) => ({
      marginLeft: 'auto', color: theme.hex, fontSize: '14px', fontWeight: 700,
      display: 'flex', alignItems: 'center', gap: '6px',
    }),

    proTip: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(15,17,32,0.4) 100%)',
      border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '26px 30px', flexWrap: 'wrap',
    },
    proTipLeft: { display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 320px' },
    proTipIcon: {
      width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
    },
    proTipTitle: { fontSize: '17px', fontWeight: 700, color: TEXT, marginBottom: '4px' },
    proTipText: { fontSize: '14.5px', color: MUTED, lineHeight: 1.5 },

    overlay: {
      position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(4,5,12,0.88)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 24px', overflowY: 'auto',
    },
    panel: {
      width: '100%', maxWidth: '860px', background: `linear-gradient(145deg, ${CARD_BG} 0%, ${CARD_BG_2} 100%)`, border: `1px solid ${BORDER}`,
      borderRadius: borderRadius['2xl'], overflow: 'hidden', marginTop: 'auto', marginBottom: 'auto',
      boxShadow: shadows.xl,
    },
    panelHeader: { padding: spacing[7] + ' ' + spacing[8] + ' ' + spacing[6], borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    panelEyebrow: { fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: '4px' },
    panelTitle: { fontSize: typography.fontSize['2xl'], fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' },
    panelBody: { padding: spacing[7] + ' ' + spacing[8] },

    noteFormWrap: { background: CARD_BG_2, borderRadius: borderRadius.lg, padding: spacing[5], marginBottom: spacing[7], border: `1px solid ${BORDER}` },
    textarea: {
      width: '100%', background: 'transparent', border: 'none', color: TEXT,
      fontSize: typography.fontSize.base, padding: '0', outline: 'none', resize: 'none', lineHeight: typography.lineHeight.relaxed,
      fontFamily: typography.fontFamily.sans, marginBottom: spacing[4],
      boxSizing: 'border-box',
    },
    noteToolbar: { display: 'flex', gap: spacing[3], alignItems: 'center', flexWrap: 'wrap', paddingTop: spacing[4], borderTop: `1px solid ${BORDER}` },
    colorDot: (color, selected) => ({
      width: '24px', height: '24px', borderRadius: '50%', background: penColors[color].hex,
      cursor: 'pointer', border: selected ? `2px solid ${TEXT}` : '2px solid transparent',
      outline: selected ? `2px solid ${penColors[color].hex}` : 'none',
      outlineOffset: '2px', transition: 'all 0.2s ease', flexShrink: 0,
      boxShadow: selected ? `0 0 8px ${penColors[color].hex}40` : 'none',
    }),
    thickLabel: { fontSize: typography.fontSize.xs, color: MUTED, fontFamily: typography.fontFamily.mono, marginLeft: 'auto' },
    slider: { accentColor: '#8B5CF6', cursor: 'pointer', width: '100px' },

    notesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing[4] },
    noteCard: (color) => ({
      background: `linear-gradient(135deg, ${PAGE_BG} 0%, ${CARD_BG} 100%)`, borderRadius: borderRadius.lg, padding: spacing[5],
      border: `1.5px solid ${penColors[color]?.hex || '#8B5CF6'}`,
      borderLeft: `5px solid ${penColors[color]?.hex || '#8B5CF6'}`,
      position: 'relative',
      transition: 'all 0.25s ease',
      boxShadow: `0 0 15px ${penColors[color]?.hex || '#8B5CF6'}30`,
    }),
    noteText: (color, thickness) => ({
      fontSize: `${12 + thickness * 0.4}px`, lineHeight: typography.lineHeight.relaxed,
      color: penColors[color]?.hex || '#8B5CF6',
      marginBottom: spacing[4], fontWeight: thickness > 5 ? typography.fontWeight.medium : typography.fontWeight.normal,
    }),
    noteActions: { display: 'flex', gap: spacing[2] },

    dialogOverlay: {
      position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(4,5,12,0.92)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing[6],
    },
    dialog: {
      background: `linear-gradient(145deg, ${CARD_BG} 0%, ${CARD_BG_2} 100%)`, border: `1px solid ${BORDER}`, borderRadius: borderRadius.xl,
      padding: spacing[8], width: '100%', maxWidth: '440px',
      boxShadow: shadows.xl,
    },
    dialogTitle: { fontSize: typography.fontSize.lg, fontWeight: 700, color: TEXT, marginBottom: spacing[5], letterSpacing: '-0.01em' },
    dialogActions: { display: 'flex', gap: spacing[3], justifyContent: 'flex-end', marginTop: spacing[6] },
    fieldLabel: { fontSize: typography.fontSize.xs, color: MUTED, fontFamily: typography.fontFamily.mono, marginBottom: spacing[2], display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase' },

    emptyState: { textAlign: 'center', padding: spacing[12] + ' ' + spacing[6], color: FAINT },
    emptyIcon: { fontSize: '48px', marginBottom: spacing[4], opacity: 0.5 },
    emptyText: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.mono, color: MUTED },
    emptySubtext: { fontSize: typography.fontSize.xs, color: FAINT, marginTop: spacing[2] },
  };

  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={styles.inner}>
        {/* Hero */}
        <div style={styles.heroRow}>
          <div style={styles.heroLeft}>
            <h1 style={styles.title}>
              Your Notes,<br />
              <span style={styles.titleAccent}>Kept Well.</span>
            </h1>
            <p style={styles.subtitle}>Organize your ideas, thoughts and learnings all in one place.</p>
          </div>

          <div style={styles.heroRight}>
            <BookIllustration />
          </div>
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
                e.target.style.borderColor = '#8B5CF6';
                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.18)';
              }}
              onBlur={e => {
                e.target.style.borderColor = BORDER;
                e.target.style.boxShadow = 'none';
              }}
            />
            <motion.button
              type="submit"
              style={styles.btnPrimary}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 28px rgba(99, 102, 241, 0.5)' }}
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
              const theme = getTheme(i);
              const Icon = theme.icon;
              return (
                <motion.div
                  key={subject._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  style={styles.card(theme)}
                  onClick={e => handleSubjectCardClick(subject, e)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = `0 16px 32px ${theme.glow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                  }}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.cardIndex(theme)}>{String(i + 1).padStart(2, '0')}</span>
                    <div style={styles.iconBadge(theme)}>
                      <Icon size={20} color="#fff" strokeWidth={2.25} />
                    </div>
                  </div>
                  <div style={styles.cardTitle}>{subject.name}</div>
                  <div style={styles.cardMeta}>{subject.notes.length} note{subject.notes.length !== 1 ? 's' : ''}</div>
                  <div style={styles.cardDivider} />
                  <div style={styles.cardActions}>
                    <button
                      style={styles.cardBtn}
                      onClick={e => { e.stopPropagation(); setEditSubject(subject); setOpenSubjectDialog(true); }}
                      onMouseEnter={e => e.currentTarget.style.color = theme.hex}
                      onMouseLeave={e => e.currentTarget.style.color = '#7E85A3'}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      style={{ ...styles.cardBtn, color: '#F87171' }}
                      onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'subject', subjectId: subject._id }); }}
                      onMouseEnter={e => e.currentTarget.style.color = '#FF6B6B'}
                      onMouseLeave={e => e.currentTarget.style.color = '#F87171'}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                    <span style={styles.openLink(theme)}>Open <ArrowRight size={14} /></span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {subjects.length === 0 && (
          <motion.div style={styles.emptyState} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.emptyIcon}>📚</div>
            <div style={styles.emptyText}>No subjects yet</div>
            <div style={styles.emptySubtext}>Create your first subject to start organizing notes</div>
          </motion.div>
        )}

        {/* Pro Tip */}
        <div style={styles.proTip}>
          <div style={styles.proTipLeft}>
            <div style={styles.proTipIcon}>
              <Lightbulb size={22} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={styles.proTipTitle}>Pro Tip</div>
              <div style={styles.proTipText}>Use subjects to group similar topics and find your notes faster.</div>
            </div>
          </div>
          <DeskIllustration />
        </div>
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
                  <div style={styles.panelEyebrow}>Subject</div>
                  <div style={styles.panelTitle}>{selectedSubject.name}</div>
                </div>
                <button
                  style={styles.btnSecondary}
                  onClick={() => setSelectedSubject(null)}
                  onMouseEnter={e => { e.target.style.color = '#EEEDF8'; e.target.style.borderColor = '#5856A0'; }}
                  onMouseLeave={e => { e.target.style.color = MUTED; e.target.style.borderColor = BORDER; }}
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        + Note
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Notes */}
                {selectedSubject.notes.length === 0 ? (
                  <motion.div style={styles.emptyState} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
                            const colorHex = penColors[note.penColor]?.hex || '#8B5CF6';
                            e.currentTarget.style.transform = 'translateX(6px) translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 8px 24px ${colorHex}40`;
                          }}
                          onMouseLeave={e => {
                            const colorHex = penColors[note.penColor]?.hex || '#8B5CF6';
                            e.currentTarget.style.transform = 'translateX(0) translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = `0 0 15px ${colorHex}30`;
                          }}
                        >
                          <p style={styles.noteText(note.penColor, note.penThickness)}>{note.content}</p>
                          <div style={styles.noteActions}>
                            <button
                              style={{ ...styles.cardBtn, color: '#7E7CA8' }}
                              onClick={() => { setEditNote(note); setOpenNoteDialog(true); }}
                              onMouseEnter={e => e.currentTarget.style.color = '#A8A5FF'}
                              onMouseLeave={e => e.currentTarget.style.color = '#7E7CA8'}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              style={{ ...styles.cardBtn, color: '#F87171' }}
                              onClick={() => setDeleteConfirm({ type: 'note', subjectId: selectedSubject._id, noteId: note._id })}
                              onMouseEnter={e => e.currentTarget.style.color = '#FF6B6B'}
                              onMouseLeave={e => e.currentTarget.style.color = '#F87171'}
                            >
                              <Trash2 size={13} /> Delete
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
              <label style={styles.fieldLabel}>Subject Name</label>
              <input
                style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
                value={editSubject?.name || ''}
                onChange={e => setEditSubject({ ...editSubject, name: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = BORDER}
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
              <label style={styles.fieldLabel}>Content</label>
              <textarea
                style={{ ...styles.textarea, background: CARD_BG_2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '12px 14px', width: '100%', boxSizing: 'border-box', marginBottom: '16px' }}
                rows={5}
                value={editNote?.content || ''}
                onChange={e => setEditNote({ ...editNote, content: e.target.value })}
                autoFocus
              />
              <label style={styles.fieldLabel}>Ink Color</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {Object.keys(penColors).map(color => (
                  <div key={color} style={styles.colorDot(color, editNote?.penColor === color)}
                    onClick={() => setEditNote({ ...editNote, penColor: color })} title={penColors[color].label} />
                ))}
              </div>
              <label style={styles.fieldLabel}>Weight: {editNote?.penThickness || 3}</label>
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
            <motion.div style={{ ...styles.dialog, maxWidth: '380px', borderColor: 'rgba(248,113,113,0.25)' }}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{ ...styles.dialogTitle, color: '#F87171' }}>Delete {deleteConfirm?.type}?</div>
              <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.6 }}>
                This {deleteConfirm?.type} will be permanently removed. There's no undo.
              </p>
              <div style={styles.dialogActions}>
                <button style={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Keep It</button>
                <button style={styles.btnDanger}
                  onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.subjectId, deleteConfirm.noteId)}
                  onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.12)'; e.target.style.color = '#F87171'; }}
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

// Decorative hero illustration: an open book with floating accents,
// echoing the reference artwork using lucide icons + CSS shapes.
const BookIllustration = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '260px' }}>
      {/* glow */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '18px', width: '260px', height: '40px',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.45) 0%, transparent 70%)',
        transform: 'translateX(-50%)', filter: 'blur(4px)',
      }} />

      {/* floating notepad icon (top-left) */}
      <div style={{
        position: 'absolute', top: '4px', left: '8%', width: '46px', height: '46px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(139,92,246,0.4)', transform: 'rotate(-8deg)',
      }}>
        <ClipboardList size={22} color="#fff" strokeWidth={2} />
      </div>

      {/* star (top-right) */}
      <div style={{ position: 'absolute', top: '0px', right: '4%' }}>
        <Star size={30} color="#A78BFA" fill="#A78BFA" strokeWidth={0} />
      </div>

      {/* sparkle */}
      <div style={{ position: 'absolute', top: '46px', left: '2%' }}>
        <Sparkles size={16} color="#C4B5FD" fill="#C4B5FD" strokeWidth={0} />
      </div>
      <div style={{ position: 'absolute', top: '96px', right: '30%' }}>
        <Sparkles size={12} color="#93C5FD" fill="#93C5FD" strokeWidth={0} />
      </div>

      {/* cloud upload (right) */}
      <div style={{
        position: 'absolute', bottom: '38px', right: '2%', width: '48px', height: '48px', borderRadius: '14px',
        background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CloudUpload size={24} color="#A78BFA" strokeWidth={2} />
      </div>

      {/* the book itself, centered */}
      <div style={{
        position: 'absolute', top: '38px', left: '50%', transform: 'translateX(-50%)',
        width: '200px', height: '150px', borderRadius: '18px',
        background: 'linear-gradient(160deg, #7C3AED 0%, #4C1D95 100%)',
        boxShadow: '0 20px 45px rgba(76,29,149,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '168px', height: '112px', borderRadius: '10px', background: '#F5F3FF',
          display: 'flex', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
        }}>
          <div style={{ flex: 1, borderRight: '1px solid #E4DBFF', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: '3px', borderRadius: '2px', background: '#E4DBFF', width: `${90 - i * 8}%` }} />
            ))}
          </div>
          <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '7px', position: 'relative' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: '3px', borderRadius: '2px', background: '#E4DBFF', width: `${85 - i * 6}%` }} />
            ))}
            {/* bookmark ribbon */}
            <div style={{
              position: 'absolute', top: '-16px', right: '18px', width: '16px', height: '58px',
              background: 'linear-gradient(180deg, #A78BFA, #7C3AED)',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
            }} />
          </div>
        </div>
        {/* pencil */}
        <div style={{
          position: 'absolute', bottom: '-14px', right: '18px', width: '58px', height: '10px',
          background: 'linear-gradient(90deg, #FBBF24, #F59E0B)', borderRadius: '3px',
          transform: 'rotate(-38deg)', boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            position: 'absolute', left: '-8px', top: '0', width: 0, height: 0,
            borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '8px solid #78350F',
          }} />
        </div>
      </div>
    </div>
  );
};

// Small decorative illustration used in the Pro Tip strip.
const DeskIllustration = () => {
  return (
    <div style={{ position: 'relative', width: '110px', height: '58px', flexShrink: 0, minWidth: '110px' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '58px', height: '38px', background: '#E5E7EB', borderRadius: '3px 6px 6px 3px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', bottom: '5px', left: '6px', width: '58px', height: '34px', background: '#F9FAFB', borderRadius: '3px 6px 6px 3px', boxShadow: '0 4px 10px rgba(0,0,0,0.25)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '34px', background: '#4C1D95', borderRadius: '4px', display: 'flex', justifyContent: 'center', gap: '4px', paddingTop: '4px' }}>
        <div style={{ width: '4px', height: '26px', background: '#22C55E', borderRadius: '2px', transform: 'rotate(-6deg)' }} />
        <div style={{ width: '4px', height: '30px', background: '#A78BFA', borderRadius: '2px' }} />
        <div style={{ width: '4px', height: '24px', background: '#F472B6', borderRadius: '2px', transform: 'rotate(6deg)' }} />
      </div>
    </div>
  );
};

export default Notes;