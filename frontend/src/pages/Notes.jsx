import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextField, Select, MenuItem, Slider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NightlightIcon from '@mui/icons-material/Nightlight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Notes = () => {
  const [subjects, setSubjects] = useState([
    { _id: '1', name: 'Mathematics', notes: [
      { _id: 'n1', content: 'Calculus is the study of continuous change', penColor: 'purple', penThickness: 3 },
      { _id: 'n2', content: 'Remember: derivatives and integrals are inverse operations', penColor: 'blue', penThickness: 2 }
    ]},
    { _id: '2', name: 'Literature', notes: [
      { _id: 'n3', content: 'Shakespeare\'s metaphors paint vivid imagery', penColor: 'red', penThickness: 4 }
    ]},
    { _id: '3', name: 'Science', notes: [] },
    { _id: '4', name: 'History', notes: [] }
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newNote, setNewNote] = useState({ content: '', penColor: 'purple', penThickness: 3 });
  const [editSubject, setEditSubject] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isNightMode, setIsNightMode] = useState(false);

  // Simulate backend operations with state updates
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    
    const newSub = {
      _id: Date.now().toString(),
      name: newSubject,
      notes: []
    };
    setSubjects([...subjects, newSub]);
    setNewSubject('');
  };

  const handleAddNote = (subjectId, e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    
    const note = {
      _id: `n${Date.now()}`,
      content: newNote.content,
      penColor: newNote.penColor,
      penThickness: newNote.penThickness,
      createdAt: new Date()
    };
    
    setSubjects(subjects.map(s => 
      s._id === subjectId ? { ...s, notes: [...s.notes, note] } : s
    ));
    
    if (selectedSubject?._id === subjectId) {
      setSelectedSubject({ ...selectedSubject, notes: [...selectedSubject.notes, note] });
    }
    
    setNewNote({ content: '', penColor: 'purple', penThickness: 3 });
  };

  const handleUpdateSubject = () => {
    if (!editSubject?.name.trim()) return;
    
    setSubjects(subjects.map(s => 
      s._id === editSubject._id ? { ...s, name: editSubject.name } : s
    ));
    
    if (selectedSubject?._id === editSubject._id) {
      setSelectedSubject({ ...selectedSubject, name: editSubject.name });
    }
    
    setOpenSubjectDialog(false);
    setEditSubject(null);
  };

  const handleUpdateNote = () => {
    if (!editNote?.content.trim() || !selectedSubject) {
      console.log('Update note failed: Invalid note or no selected subject', { editNote, selectedSubject });
      return;
    }
    
    setSubjects(subjects.map(s =>
      s._id === selectedSubject._id ? {
        ...s,
        notes: s.notes.map(n =>
          n._id === editNote._id ? editNote : n
        )
      } : s
    ));
    
    setSelectedSubject({
      ...selectedSubject,
      notes: selectedSubject.notes.map(n =>
        n._id === editNote._id ? editNote : n
      )
    });
    
    setOpenNoteDialog(false);
    setEditNote(null);
  };

  const handleDelete = (type, subjectId, noteId = null) => {
    if (type === 'subject') {
      setSubjects(subjects.filter(s => s._id !== subjectId));
      if (selectedSubject?._id === subjectId) {
        setSelectedSubject(null);
      }
    } else {
      setSubjects(subjects.map(s =>
        s._id === subjectId ? { ...s, notes: s.notes.filter(n => n._id !== noteId) } : s
      ));
      if (selectedSubject?._id === subjectId) {
        setSelectedSubject({ 
          ...selectedSubject, 
          notes: selectedSubject.notes.filter(n => n._id !== noteId) 
        });
      }
    }
    setDeleteConfirm(null);
  };

  const handleSubjectCardClick = (subject, e) => {
    // Only handle card click if the target is not a button or inside a button
    if (e.target.closest('button') || e.target.closest('.MuiButtonBase-root')) {
      return;
    }
    setSelectedSubject(subject);
  };

  const handleEditSubjectClick = (e, subject) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Edit subject clicked:', subject);
    setEditSubject(subject);
    setOpenSubjectDialog(true);
  };

  const handleDeleteSubjectClick = (e, subjectId) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete subject clicked:', subjectId);
    setDeleteConfirm({ type: 'subject', subjectId });
  };

  const handleEditNoteClick = (e, note) => {
    e.stopPropagation();
    e.preventDefault();
    if (!note || !selectedSubject) {
      console.log('Edit note failed: Invalid note or no selected subject', { note, selectedSubject });
      return;
    }
    console.log('Edit note clicked:', note);
    setEditNote(note);
    setOpenNoteDialog(true);
  };

  const handleDeleteNoteClick = (e, subjectId, noteId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!subjectId || !noteId || !selectedSubject) {
      console.log('Delete note failed: Invalid subjectId, noteId, or no selected subject', { subjectId, noteId, selectedSubject });
      return;
    }
    console.log('Delete note clicked:', { subjectId, noteId });
    setDeleteConfirm({ type: 'note', subjectId, noteId });
  };

  const penColors = {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    pink: '#EC4899',
    emerald: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
    indigo: '#6366F1',
    teal: '#14B8A6'
  };

  const FloatingParticle = ({ delay = 0 }) => (
    <motion.div
      className="absolute w-2 h-2 bg-white/30 rounded-full pointer-events-none"
      initial={{ 
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
        y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
        opacity: 0 
      }}
      animate={{ 
        y: -20, 
        opacity: [0, 1, 0],
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
      }}
      transition={{ 
        duration: 8 + Math.random() * 4, 
        delay, 
        repeat: Infinity,
        ease: "linear" 
      }}
    />
  );

  const GlowingOrb = ({ size = "w-32 h-32", color = "bg-purple-500/20", delay = 0 }) => (
    <motion.div
      className={`absolute ${size} ${color} rounded-full blur-xl pointer-events-none`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [1, 1.5, 1], 
        opacity: [0.3, 0.6, 0.3],
        x: [0, 100, -50, 0],
        y: [0, -80, 60, 0]
      }}
      transition={{ 
        duration: 10 + delay, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
    />
  );

  const buttonStyles = {
    dreamy: {
      borderRadius: '25px',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 10,
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        transition: 'left 0.5s',
      },
      '&:hover': {
        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
        transform: 'translateY(-3px) scale(1.05)',
        boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
        zIndex: 20,
        '&:before': {
          left: '100%',
        }
      },
      '&:active': {
        transform: 'translateY(-1px) scale(1.02)',
      },
      transition: 'all 0.3s ease',
    },
    magical: {
      borderRadius: '30px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      color: '#4a1a4a',
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      boxShadow: '0 8px 25px rgba(255, 154, 158, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      zIndex: 10,
      '&:hover': {
        background: 'linear-gradient(135deg, #fecfef 0%, #ff9a9e 100%)',
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 12px 30px rgba(255, 154, 158, 0.4)',
        zIndex: 20,
      },
      transition: 'all 0.3s ease',
    },
    danger: {
      borderRadius: '30px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%)',
      color: 'white',
      fontFamily: '"Quicksand", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
      position: 'relative',
      zIndex: 10,
      '&:hover': {
        background: 'linear-gradient(135deg, #ffa8a8 0%, #ff6b6b 100%)',
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 12px 30px rgba(255, 107, 107, 0.4)',
        zIndex: 20,
      },
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isNightMode 
        ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400'
    }`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
        <GlowingOrb size="w-64 h-64" color="bg-purple-500/20" delay={0} />
        <GlowingOrb size="w-48 h-48" color="bg-pink-500/20" delay={2} />
        <GlowingOrb size="w-80 h-80" color="bg-indigo-500/15" delay={4} />
        <GlowingOrb size="w-40 h-40" color="bg-yellow-400/25" delay={6} />
      </div>

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none"></div>

      {/* Day/Night Toggle */}
      <motion.button
        onClick={() => setIsNightMode(!isNightMode)}
        className="fixed top-6 right-6 z-50 p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isNightMode ? <WbSunnyIcon className="w-6 h-6" /> : <NightlightIcon className="w-6 h-6" />}
      </motion.button>

      <div className="relative z-10 p-8">
        {/* Magical Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-white mb-4 font-serif relative"
            style={{
              textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fecfef 50%, #667eea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{ 
              textShadow: [
                '0 0 30px rgba(255,255,255,0.5)',
                '0 0 60px rgba(255,255,255,0.8)', 
                '0 0 30px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨ Enchanted Library ✨
          </motion.h1>
          <motion.p 
            className="text-xl text-white/90 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Where dreams meet knowledge
          </motion.p>
        </motion.div>

        {/* Add Subject Form - Floating Glass Card */}
        <motion.div
          className="max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <form onSubmit={handleAddSubject} className="relative">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <TextField
                  fullWidth
                  label="Create New Subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#667eea',
                      fontFamily: '"Quicksand", sans-serif',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Quicksand", sans-serif',
                      fontSize: '1.1rem',
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AutoAwesomeIcon className="w-5 h-5" />}
                  sx={buttonStyles.dreamy}
                  className="min-w-[180px] h-14"
                >
                  Create Magic
                </Button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Subjects Grid - Magical Cards */}
        <motion.div
          className="max-w-7xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject._id}
                  className="group relative cursor-pointer"
                  initial={{ opacity: 0, y: 100, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -50, scale: 0.8 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -20, 
                    rotateY: 5,
                    rotateX: 5,
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  onClick={(e) => handleSubjectCardClick(subject, e)}
                >
                  <div className="relative bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl h-48 flex flex-col justify-between overflow-hidden">
                    
                    {/* Floating icons */}
                    <motion.div
                      className="absolute top-4 right-4 text-white/50 pointer-events-none"
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                      }}
                    >
                      <AutoStoriesIcon className="w-8 h-8" />
                    </motion.div>

                    <motion.div
                      className="absolute top-2 left-2 text-yellow-300/70 pointer-events-none"
                      animate={{ 
                        scale: [0.8, 1.2, 0.8],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    >
                      <StarIcon className="w-4 h-4" />
                    </motion.div>

                    <div>
                      <motion.h3 
                        className="text-2xl font-bold text-white mb-2 font-serif pointer-events-none"
                        style={{
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                      >
                        {subject.name}
                      </motion.h3>
                      <p className="text-white/70 text-sm pointer-events-none">
                        {subject.notes.length} magical notes
                      </p>
                    </div>

                    {/* Button container with proper z-index and event handling */}
                    <div className="flex gap-3 relative z-20">
                      <button
                        onClick={(e) => handleEditSubjectClick(e, subject)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold text-sm hover:from-pink-500 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <EditIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubjectClick(e, subject._id)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold text-sm hover:from-red-500 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <DeleteIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>

                    {/* Shimmer effect on hover - behind buttons */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Selected Subject - Expanded Magical View */}
        <AnimatePresence>
          {selectedSubject && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedSubject(null);
                }
              }}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
              
              <motion.div
                className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"
                initial={{ scale: 0.5, opacity: 0, rotateX: -20 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateX: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-white/20">
                  <motion.h2 
                    className="text-4xl font-bold text-white font-serif"
                    style={{
                      textShadow: '0 2px 20px rgba(255,255,255,0.3)'
                    }}
                    initial={{ x: -50 }}
                    animate={{ x: 0 }}
                  >
                    ✨ {selectedSubject.name}
                  </motion.h2>
                  <Button
                    onClick={() => setSelectedSubject(null)}
                    startIcon={<CloseIcon />}
                    sx={{
                      ...buttonStyles.magical,
                      minWidth: 'auto',
                      borderRadius: '50px',
                      padding: '12px'
                    }}
                  >
                    Close
                  </Button>
                </div>

                <div className="p-8">
                  {/* Add Note Form */}
                  <motion.div
                    className="mb-12"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/30">
                      <form onSubmit={(e) => handleAddNote(selectedSubject._id, e)}>
                        <TextField
                          fullWidth
                          label="Create a magical note..."
                          multiline
                          rows={4}
                          value={newNote.content}
                          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                          variant="outlined"
                          className="mb-6"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '20px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(10px)',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#667eea',
                              fontFamily: '"Quicksand", sans-serif',
                            },
                            '& .MuiInputBase-input': {
                              fontFamily: '"Quicksand", sans-serif',
                            }
                          }}
                        />
                        
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                          <Select
                            value={newNote.penColor}
                            onChange={(e) => setNewNote({ ...newNote, penColor: e.target.value })}
                            className="md:w-48"
                            sx={{
                              borderRadius: '15px',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '& .MuiSelect-select': {
                                fontFamily: '"Quicksand", sans-serif',
                              }
                            }}
                          >
                            {Object.keys(penColors).map((color) => (
                              <MenuItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: penColors[color] }}
                                  ></div>
                                  {color.charAt(0).toUpperCase() + color.slice(1)}
                                </div>
                              </MenuItem>
                            ))}
                          </Select>
                          
                          <div className="flex-1">
                            <label className="text-white font-medium mb-2 block font-sans">
                              Magic Intensity: {newNote.penThickness}
                            </label>
                            <Slider
                              value={newNote.penThickness}
                              onChange={(e, value) => setNewNote({ ...newNote, penThickness: value })}
                              min={1}
                              max={10}
                              step={1}
                              marks
                              valueLabelDisplay="auto"
                              sx={{
                                color: penColors[newNote.penColor],
                                '& .MuiSlider-thumb': {
                                  background: penColors[newNote.penColor],
                                  boxShadow: `0 0 10px ${penColors[newNote.penColor]}`,
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<FavoriteIcon className="w-5 h-5" />}
                          sx={buttonStyles.dreamy}
                          fullWidth
                        >
                          Add Magical Note
                        </Button>
                      </form>
                    </div>
                  </motion.div>

                  {/* Notes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {selectedSubject.notes.map((note, index) => (
                        <motion.div
                          key={note._id}
                          className="group relative"
                          initial={{ 
                            opacity: 0, 
                            scale: 0.5, 
                            rotateY: -90,
                            y: 100 
                          }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            rotateY: 0,
                            y: 0 
                          }}
                          exit={{ 
                            opacity: 0, 
                            scale: 0.3, 
                            rotateY: 90,
                            y: -50 
                          }}
                          transition={{ 
                            duration: 0.6,
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            rotateZ: Math.random() > 0.5 ? 2 : -2,
                            y: -10
                          }}
                        >
                          <div 
                            className="relative p-6 rounded-3xl shadow-2xl border-2 border-white/30 min-h-[200px] backdrop-blur-xl overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${penColors[note.penColor]}20, ${penColors[note.penColor]}10)`,
                              borderColor: penColors[note.penColor],
                            }}
                          >
                            {/* Floating sparkles */}
                            <motion.div
                              className="absolute top-2 right-2 text-white/50 pointer-events-none"
                              animate={{ 
                                rotate: 360,
                                scale: [0.8, 1.2, 0.8]
                              }}
                              transition={{ 
                                rotate: { duration: 8, repeat: Infinity },
                                scale: { duration: 2, repeat: Infinity, delay: index * 0.1 }
                              }}
                            >
                              <AutoAwesomeIcon className="w-5 h-5" />
                            </motion.div>

                            <p 
                              className="text-white leading-relaxed mb-6 font-sans pointer-events-none"
                              style={{
                                color: penColors[note.penColor],
                                fontWeight: Math.min(note.penThickness * 100 + 400, 900),
                                fontSize: `${Math.min(1 + note.penThickness / 8, 1.5)}rem`,
                                textShadow: `0 2px 8px ${penColors[note.penColor]}30`,
                              }}
                            >
                              {note.content}
                            </p>

                            <div className="flex gap-3 mt-auto relative z-20">
                              <button
                                onClick={(e) => handleEditNoteClick(e, note)}
                                className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold text-sm hover:from-pink-500 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                              >
                                <EditIcon className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDeleteNoteClick(e, selectedSubject._id, note._id)}
                                className="px-4 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold text-sm hover:from-red-500 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                              >
                                <DeleteIcon className="w-4 h-4" />
                                Delete
                              </button>
                            </div>

                            {/* Magical shimmer effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"
                                style={{
                                  background: `linear-gradient(90deg, transparent, ${penColors[note.penColor]}40, transparent)`
                                }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Subject Dialog */}
        <Dialog 
          open={openSubjectDialog} 
          onClose={() => setOpenSubjectDialog(false)}
          PaperProps={{
            style: {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: -20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: 20 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DialogTitle className="text-white font-serif text-2xl text-center p-8">
              ✨ Edit Subject Magic ✨
            </DialogTitle>
            <DialogContent className="p-8">
              <TextField
                fullWidth
                label="Subject Name"
                value={editSubject?.name || ''}
                onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontFamily: '"Quicksand", sans-serif',
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: '"Quicksand", sans-serif',
                    fontSize: '1.1rem',
                  }
                }}
              />
            </DialogContent>
            <DialogActions className="p-8 gap-4">
              <Button
                onClick={() => setOpenSubjectDialog(false)}
                sx={buttonStyles.magical}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubject}
                sx={buttonStyles.dreamy}
              >
                Save Magic
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog 
          open={openNoteDialog} 
          onClose={() => setOpenNoteDialog(false)}
          PaperProps={{
            style: {
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              maxWidth: '600px',
              width: '100%'
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 20 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DialogTitle className="text-white font-serif text-2xl text-center p-8">
              ✨ Edit Note Magic ✨
            </DialogTitle>
            <DialogContent className="p-8">
              <TextField
                fullWidth
                label="Note Content"
                multiline
                rows={4}
                value={editNote?.content || ''}
                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                variant="outlined"
                className="mb-6"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#667eea',
                    fontFamily: '"Quicksand", sans-serif',
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: '"Quicksand", sans-serif',
                  }
                }}
              />
              <div className="flex flex-col gap-6 mt-6">
                <Select
                  fullWidth
                  value={editNote?.penColor || 'purple'}
                  onChange={(e) => setEditNote({ ...editNote, penColor: e.target.value })}
                  sx={{
                    borderRadius: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& .MuiSelect-select': {
                      fontFamily: '"Quicksand", sans-serif',
                    }
                  }}
                >
                  {Object.keys(penColors).map((color) => (
                    <MenuItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: penColors[color] }}
                        ></div>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Magic Intensity: {editNote?.penThickness || 3}
                  </label>
                  <Slider
                    value={editNote?.penThickness || 3}
                    onChange={(e, value) => setEditNote({ ...editNote, penThickness: value })}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{
                      color: penColors[editNote?.penColor || 'purple'],
                      '& .MuiSlider-thumb': {
                        background: penColors[editNote?.penColor || 'purple'],
                        boxShadow: `0 0 10px ${penColors[editNote?.penColor || 'purple']}`,
                      }
                    }}
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions className="p-8 gap-4">
              <Button
                onClick={() => setOpenNoteDialog(false)}
                sx={buttonStyles.magical}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateNote}
                sx={buttonStyles.dreamy}
              >
                Save Magic
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={!!deleteConfirm} 
          onClose={() => setDeleteConfirm(null)}
          PaperProps={{
            style: {
              background: 'linear-gradient(135deg, rgba(255,107,107,0.3), rgba(255,154,158,0.2))',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(255,0,0,0.3)',
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateZ: -10 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateZ: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DialogTitle className="text-white font-serif text-2xl text-center p-8">
              ⚠️ Confirm Deletion ⚠️
            </DialogTitle>
            <DialogContent className="p-8 text-center">
              <p className="text-white text-lg font-light">
                Are you sure you want to delete this magical {deleteConfirm?.type}?
              </p>
              <p className="text-white/70 text-sm mt-2">
                This action cannot be undone...
              </p>
            </DialogContent>
            <DialogActions className="p-8 gap-4 justify-center">
              <Button
                onClick={() => setDeleteConfirm(null)}
                sx={buttonStyles.magical}
              >
                Keep It
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.subjectId, deleteConfirm.noteId)}
                sx={buttonStyles.danger}
              >
                Delete Forever
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      </div>
    </div>
  );
};

export default Notes;