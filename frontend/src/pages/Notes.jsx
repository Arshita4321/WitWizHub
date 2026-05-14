import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    accentFg: '#FFFFFF',
    danger:   '#F87171',
    dangerBg: '#2D1F42',
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '"Inter", system-ui, sans-serif',
      position: 'relative',
    },
    grain: {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
      backgroundSize: '256px 256px', opacity: 0.5,
    },
    inner: { position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 32px 80px' },
    header: { marginBottom: '64px' },
    wordmark: { fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, fontFamily: '"JetBrains Mono", monospace', marginBottom: '32px' },
    title: { fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 700, lineHeight: 1.05, color: C.text, letterSpacing: '-0.03em', marginBottom: '12px' },
    titleAccent: { color: C.accent },
    subtitle: { fontSize: '16px', color: C.muted, fontFamily: '"JetBrains Mono", monospace' },
    divider: { width: '40px', height: '1px', background: C.border, margin: '32px 0' },

    formWrap: { marginBottom: '56px' },
    formRow: { display: 'flex', gap: '12px', alignItems: 'stretch' },
    input: {
      flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px',
      color: C.text, fontSize: '15px', padding: '14px 18px', outline: 'none',
      fontFamily: '"Inter", system-ui, sans-serif', transition: 'border-color 0.15s',
    },
    btnPrimary: {
      background: C.accent, color: C.accentFg, border: 'none', borderRadius: '8px',
      padding: '14px 24px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
      fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '0.01em', whiteSpace: 'nowrap',
      transition: 'background 0.15s, transform 0.1s',
    },
    btnSecondary: {
      background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
      borderRadius: '8px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer',
      fontFamily: '"Inter", system-ui, sans-serif', transition: 'all 0.15s',
    },
    btnDanger: {
      background: 'transparent', color: C.danger, border: `1px solid ${C.dangerBg}`,
      borderRadius: '8px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer',
      fontFamily: '"Inter", system-ui, sans-serif', transition: 'all 0.15s',
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
    card: {
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px',
      padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, background 0.2s',
    },
    cardIndex: { fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: C.faint, marginBottom: '16px', letterSpacing: '0.1em' },
    cardTitle: { fontSize: '20px', fontWeight: 600, color: C.text, marginBottom: '8px', lineHeight: 1.2 },
    cardMeta: { fontSize: '13px', color: C.muted, fontFamily: '"JetBrains Mono", monospace' },
    cardActions: { display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${C.border}` },
    cardBtn: {
      background: 'transparent', color: C.muted, border: 'none', padding: '4px 8px',
      fontSize: '12px', cursor: 'pointer', fontFamily: '"Inter", system-ui, sans-serif',
      borderRadius: '4px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '4px',
    },

    overlay: {
      position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,9,28,0.88)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 24px', overflowY: 'auto',
    },
    panel: {
      width: '100%', maxWidth: '860px', background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: '16px', overflow: 'hidden', marginTop: 'auto', marginBottom: 'auto',
    },
    panelHeader: { padding: '28px 32px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    panelTitle: { fontSize: '22px', fontWeight: 600, color: C.text, letterSpacing: '-0.02em' },
    panelBody: { padding: '28px 32px' },

    noteFormWrap: { background: C.raised, borderRadius: '10px', padding: '20px', marginBottom: '28px', border: `1px solid ${C.border}` },
    textarea: {
      width: '100%', background: 'transparent', border: 'none', color: C.text,
      fontSize: '15px', padding: '0', outline: 'none', resize: 'none', lineHeight: 1.6,
      fontFamily: '"Inter", system-ui, sans-serif', marginBottom: '16px',
      boxSizing: 'border-box',
    },
    noteToolbar: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '14px', borderTop: `1px solid ${C.border}` },
    colorDot: (color, selected) => ({
      width: '20px', height: '20px', borderRadius: '50%', background: penColors[color].hex,
      cursor: 'pointer', border: selected ? `2px solid ${C.text}` : '2px solid transparent',
      outline: selected ? `2px solid ${penColors[color].hex}` : 'none',
      outlineOffset: '2px', transition: 'all 0.15s', flexShrink: 0,
    }),
    thickLabel: { fontSize: '12px', color: C.muted, fontFamily: '"JetBrains Mono", monospace', marginLeft: 'auto' },
    slider: { accentColor: C.accent, cursor: 'pointer', width: '100px' },

    notesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' },
    noteCard: (color) => ({
      background: C.bg, borderRadius: '10px', padding: '18px',
      border: `1px solid ${penColors[color]?.hex || C.accent}22`,
      borderLeft: `3px solid ${penColors[color]?.hex || C.accent}`,
      position: 'relative',
    }),
    noteText: (color, thickness) => ({
      fontSize: `${12 + thickness * 0.4}px`, lineHeight: 1.65,
      color: penColors[color]?.hex || C.accent,
      marginBottom: '14px', fontWeight: thickness > 5 ? 500 : 400,
    }),
    noteActions: { display: 'flex', gap: '6px' },

    dialogOverlay: {
      position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,9,28,0.92)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    },
    dialog: {
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px',
      padding: '32px', width: '100%', maxWidth: '440px',
    },
    dialogTitle: { fontSize: '18px', fontWeight: 600, color: C.text, marginBottom: '20px', letterSpacing: '-0.01em' },
    dialogActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' },
    label: { fontSize: '12px', color: C.muted, fontFamily: '"JetBrains Mono", monospace', marginBottom: '8px', display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase' },
    select: {
      background: C.raised, border: `1px solid ${C.border}`, color: C.text,
      borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none',
      fontFamily: '"Inter", system-ui, sans-serif', cursor: 'pointer', width: '100%',
    },
    emptyState: { textAlign: 'center', padding: '48px 24px', color: C.faint },
    emptyIcon: { fontSize: '32px', marginBottom: '12px' },
    emptyText: { fontSize: '14px', fontFamily: '"JetBrains Mono", monospace' },
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
              onFocus={e => e.target.style.borderColor = '#8B87FF'}
              onBlur={e => e.target.style.borderColor = '#38365E'}
            />
            <button
              type="submit"
              style={styles.btnPrimary}
              onMouseEnter={e => { e.target.style.background = '#A8A5FF'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.background = '#8B87FF'; e.target.style.transform = 'none'; }}
            >
              + Add Subject
            </button>
          </form>
        </div>

        {/* Subjects Grid */}
        <div style={styles.grid}>
          <AnimatePresence>
            {subjects.map((subject, i) => (
              <motion.div
                key={subject._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                style={styles.card}
                onClick={e => handleSubjectCardClick(subject, e)}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#5856A0'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#38365E'}
              >
                <div style={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</div>
                <div style={styles.cardTitle}>{subject.name}</div>
                <div style={styles.cardMeta}>{subject.notes.length} note{subject.notes.length !== 1 ? 's' : ''}</div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.cardBtn}
                    onClick={e => { e.stopPropagation(); setEditSubject(subject); setOpenSubjectDialog(true); }}
                    onMouseEnter={e => e.target.style.color = '#A8A5FF'}
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
            ))}
          </AnimatePresence>
        </div>

        {subjects.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◻</div>
            <div style={styles.emptyText}>No subjects yet. Add one above.</div>
          </div>
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
                      <button type="submit" style={{ ...styles.btnPrimary, padding: '10px 20px', fontSize: '13px', marginLeft: 'auto' }}
                        onMouseEnter={e => e.target.style.background = '#A8A5FF'}
                        onMouseLeave={e => e.target.style.background = '#8B87FF'}
                      >
                        + Note
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notes */}
                {selectedSubject.notes.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyText}>No notes in this subject yet.</div>
                  </div>
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