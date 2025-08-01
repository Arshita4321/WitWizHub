import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextField, Select, MenuItem, Slider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notes = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newNote, setNewNote] = useState({ content: '', penColor: 'black', penThickness: 1 });
  const [editSubject, setEditSubject] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchSubjects();
    }
  }, [token, navigate]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data);
    } catch (err) {
      console.error('Fetch subjects error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      alert('Failed to fetch subjects. Please try again.');
    }
  };

  const fetchSubjectById = async (subjectId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error('Fetch subject error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      throw err;
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      alert('Subject name cannot be empty');
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notes`,
        { name: newSubject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        setSubjects([...subjects, response.data]);
        setNewSubject('');
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error('Add subject error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      alert(err.response?.data?.message || 'Failed to add subject');
    }
  };

  const handleAddNote = async (subjectId, e) => {
    e.preventDefault();
    if (!newNote.content.trim()) {
      alert('Note content cannot be empty');
      return;
    }
    try {
      const optimisticNote = {
        _id: `temp-${Date.now()}`,
        content: newNote.content,
        penColor: newNote.penColor,
        penThickness: newNote.penThickness,
        createdAt: new Date(),
      };
      setSubjects(subjects.map((s) =>
        s._id === subjectId ? { ...s, notes: [...s.notes, optimisticNote] } : s
      ));
      if (selectedSubject?._id === subjectId) {
        setSelectedSubject({ ...selectedSubject, notes: [...selectedSubject.notes, optimisticNote] });
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notes/${subjectId}/notes`,
        {
          content: newNote.content,
          penColor: newNote.penColor,
          penThickness: newNote.penThickness,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 204) {
        try {
          const updatedSubject = await fetchSubjectById(subjectId);
          setSubjects(subjects.map((s) => (s._id === subjectId ? updatedSubject : s)));
          if (selectedSubject?._id === subjectId) {
            setSelectedSubject(updatedSubject);
          }
          setNewNote({ content: '', penColor: 'black', penThickness: 1 });
        } catch (fetchErr) {
          console.error('Post-add fetch error:', {
            message: fetchErr.message,
            response: fetchErr.response ? {
              status: fetchErr.response.status,
              data: fetchErr.response.data,
              headers: fetchErr.response.headers,
            } : null,
          });
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error('Add note error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      setSubjects(subjects.map((s) =>
        s._id === subjectId ? { ...s, notes: s.notes.filter((n) => !n._id.startsWith('temp-')) } : s
      ));
      if (selectedSubject?._id === subjectId) {
        setSelectedSubject({ ...selectedSubject, notes: selectedSubject.notes.filter((n) => !n._id.startsWith('temp-')) });
      }
      alert(err.response?.data?.message || 'Failed to add note');
    }
  };

  const handleUpdateSubject = async () => {
    if (!editSubject?.name.trim()) {
      alert('Subject name cannot be empty');
      return;
    }
    try {
      setSubjects(subjects.map((s) =>
        s._id === editSubject._id ? { ...s, name: editSubject.name } : s
      ));
      if (selectedSubject?._id === editSubject._id) {
        setSelectedSubject({ ...selectedSubject, name: editSubject.name });
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${editSubject._id}`,
        { name: editSubject.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpenSubjectDialog(false);
      setEditSubject(null);

      if (response.status === 200 || response.status === 204) {
        try {
          const updatedSubject = await fetchSubjectById(editSubject._id);
          setSubjects(subjects.map((s) => (s._id === editSubject._id ? updatedSubject : s)));
          if (selectedSubject?._id === editSubject._id) {
            setSelectedSubject(updatedSubject);
          }
        } catch (fetchErr) {
          console.error('Post-update subject fetch error:', {
            message: fetchErr.message,
            response: fetchErr.response ? {
              status: fetchErr.response.status,
              data: fetchErr.response.data,
              headers: fetchErr.response.headers,
            } : null,
          });
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error('Update subject error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      setSubjects(subjects.map((s) =>
        s._id === editSubject._id ? { ...s, name: subjects.find((sub) => sub._id === editSubject._id).name } : s
      ));
      if (selectedSubject?._id === editSubject._id) {
        setSelectedSubject({ ...selectedSubject, name: subjects.find((sub) => sub._id === editSubject._id).name });
      }
      setOpenSubjectDialog(false);
      setEditSubject(null);
      alert(err.response?.data?.message || 'Failed to update subject');
    }
  };

  const handleUpdateNote = async () => {
    if (!editNote?.content.trim()) {
      alert('Note content cannot be empty');
      return;
    }
    try {
      setSubjects(subjects.map((s) =>
        s._id === selectedSubject._id ? {
          ...s,
          notes: s.notes.map((n) =>
            n._id === editNote._id ? { ...n, content: editNote.content, penColor: editNote.penColor, penThickness: editNote.penThickness } : n
          ),
        } : s
      ));
      if (selectedSubject) {
        setSelectedSubject({
          ...selectedSubject,
          notes: selectedSubject.notes.map((n) =>
            n._id === editNote._id ? { ...n, content: editNote.content, penColor: editNote.penColor, penThickness: editNote.penThickness } : n
          ),
        });
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${selectedSubject._id}/notes/${editNote._id}`,
        {
          content: editNote.content,
          penColor: editNote.penColor,
          penThickness: editNote.penThickness,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpenNoteDialog(false);
      setEditNote(null);

      if (response.status === 200 || response.status === 204) {
        try {
          const updatedSubject = await fetchSubjectById(selectedSubject._id);
          setSubjects(subjects.map((s) => (s._id === selectedSubject._id ? updatedSubject : s)));
          setSelectedSubject(updatedSubject);
        } catch (fetchErr) {
          console.error('Post-update note fetch error:', {
            message: fetchErr.message,
            response: fetchErr.response ? {
              status: fetchErr.response.status,
              data: fetchErr.response.data,
              headers: fetchErr.response.headers,
            } : null,
          });
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error('Update note error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      setSubjects(subjects.map((s) =>
        s._id === selectedSubject._id ? {
          ...s,
          notes: s.notes.map((n) =>
            n._id === editNote._id ? subjects.find((sub) => sub._id === selectedSubject._id).notes.find((note) => note._id === editNote._id) : n
          ),
        } : s
      ));
      if (selectedSubject) {
        setSelectedSubject({
          ...selectedSubject,
          notes: selectedSubject.notes.map((n) =>
            n._id === editNote._id ? subjects.find((sub) => sub._id === selectedSubject._id).notes.find((note) => note._id === editNote._id) : n
          ),
        });
      }
      setOpenNoteDialog(false);
      setEditNote(null);
      alert(err.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDelete = async (type, subjectId, noteId = null) => {
    try {
      if (type === 'subject') {
        setSubjects(subjects.filter((s) => s._id !== subjectId));
        if (selectedSubject?._id === subjectId) {
          setSelectedSubject(null);
        }

        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status !== 200 && response.status !== 204) {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } else {
        setSubjects(subjects.map((s) =>
          s._id === subjectId ? { ...s, notes: s.notes.filter((n) => n._id !== noteId) } : s
        ));
        if (selectedSubject?._id === subjectId) {
          setSelectedSubject({ ...selectedSubject, notes: selectedSubject.notes.filter((n) => n._id !== noteId) });
        }

        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${subjectId}/notes/${noteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status !== 200 && response.status !== 204) {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
      });
      if (type === 'subject') {
        const updatedSubject = await fetchSubjectById(subjectId).catch(() => null);
        if (updatedSubject) {
          setSubjects([...subjects, updatedSubject].sort((a, b) => a._id.localeCompare(b._id)));
          if (selectedSubject?._id === subjectId) {
            setSelectedSubject(updatedSubject);
          }
        }
      } else {
        const updatedSubject = await fetchSubjectById(subjectId).catch(() => null);
        if (updatedSubject) {
          setSubjects(subjects.map((s) => (s._id === subjectId ? updatedSubject : s)));
          if (selectedSubject?._id === subjectId) {
            setSelectedSubject(updatedSubject);
          }
        }
      }
      alert(err.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const handleSubjectCardClick = (subject, e) => {
    if (e.target.closest('.MuiButtonBase-root')) {
      return;
    }
    setSelectedSubject(subject);
  };

  const subjectBorderColors = ['#2E4F4F', '#6B21A8', '#B91C1C', '#1E40AF'];
  const noteBackgroundColors = ['#FFFF99', '#FFCCCB', '#CCFF99', '#99CCFF'];
  const penColors = {
    black: '#000000',
    blue: '#1E40AF',
    red: '#B91C1C',
    green: '#15803D',
    purple: '#6B21A8',
  };

  // Button styles using MUI sx prop
  const buttonStyles = {
    edit: {
      borderRadius: '12px',
      padding: { xs: '4px 8px', sm: '6px 12px' },
      background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
      color: 'white',
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      fontWeight: 500,
      textTransform: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
      '& .MuiButton-startIcon': {
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.2)' },
      },
    },
    delete: {
      borderRadius: '12px',
      padding: { xs: '4px 8px', sm: '6px 12px' },
      background: 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
      color: 'white',
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      fontWeight: 500,
      textTransform: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
      '& .MuiButton-startIcon': {
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.2)' },
      },
    },
    save: {
      borderRadius: '12px',
      padding: { xs: '6px 12px', sm: '8px 16px' },
      background: 'linear-gradient(90deg, #2E4F4F 0%, #1A3C3C 100%)',
      color: 'white',
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem' },
      fontWeight: 500,
      textTransform: 'none',
      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(90deg, #2E4F4F 0%, #134747 100%)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
    },
    cancel: {
      borderRadius: '12px',
      padding: { xs: '6px 12px', sm: '8px 16px' },
      background: '#FFFF99',
      color: '#4A3728',
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem' },
      fontWeight: 500,
      textTransform: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: '#FFF083',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
    },
    add: {
      borderRadius: '12px',
      padding: { xs: '6px 12px', sm: '8px 16px' },
      background: 'linear-gradient(90deg, #2E4F4F 0%, #1A3C3C 100%)',
      color: 'white',
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem' },
      fontWeight: 500,
      textTransform: 'none',
      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(90deg, #2E4F4F 0%, #134747 100%)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
      '& .MuiButton-startIcon': {
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.2)' },
      },
    },
    close: {
      borderRadius: '12px',
      padding: { xs: '6px 12px', sm: '8px 16px' },
      background: 'linear-gradient(90deg, #2E4F4F 0%, #1A3C3C 100%)',
      color: 'white',
      fontFamily: 'Roboto, sans-serif',
      fontSize: { xs: '0.875rem', sm: '1rem' },
      fontWeight: 500,
      textTransform: 'none',
      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(90deg, #2E4F4F 0%, #134747 100%)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
        transform: 'scale(1.05)',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
      '& .MuiButton-startIcon': {
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.2)' },
      },
    },
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-b from-amber-900/90 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2210%22 viewBox%3D%220 0 60 10%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect x%3D%220%22 y%3D%220%22 width%3D%2260%22 height%3D%2210%22 fill%3D%22%23332211%22 fill-opacity%3D%220.2%22%2F%3E%3Cpath d%3D%22M0 5 h60 M0 2 h60 M0 8 h60%22 stroke%3D%22%23443322%22 stroke-width%3D%220.5%22 stroke-opacity%3D%220.3%22%2F%3E%3C%2Fsvg%3E')] bg-repeat"></div>
      <motion.h1
        className="relative text-3xl sm:text-4xl md:text-5xl font-lora text-white mb-8 sm:mb-10 md:mb-12 text-center drop-shadow-2xl tracking-wide"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        Your Digital Library
      </motion.h1>

      <motion.form
        onSubmit={handleAddSubject}
        className="relative mb-8 sm:mb-10 md:mb-12 flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-gradient-to-br from-white/95 to-amber-100/95 p-4 sm:p-6 rounded-3xl shadow-2xl hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TextField
          fullWidth
          label="New Subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          variant="outlined"
          className="rounded-2xl bg-white/80"
          InputProps={{ className: 'font-roboto text-[#4A3728] text-sm sm:text-base' }}
          InputLabelProps={{ className: 'text-[#4A3728] text-sm sm:text-base' }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          sx={buttonStyles.add}
        >
          Add Subject
        </Button>
      </motion.form>

      <motion.div
        className="relative p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white/90 to-amber-50/90 rounded-3xl shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {subjects.map((subject, index) => (
              <motion.div
                key={subject._id}
                className="relative p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white to-amber-50/80 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-[color] border-opacity-80"
                style={{ borderColor: subjectBorderColors[index % 4] }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                whileHover={{
                  scale: 1.05,
                  rotateX: 5,
                  rotateY: 5,
                  boxShadow: `0 0 20px ${subjectBorderColors[index % 4]}`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleSubjectCardClick(subject, e)}
              >
                <h3
                  className="font-lora text-base sm:text-lg md:text-xl text-center text-[#4A3728] mb-3 tracking-tight"
                  style={{ textShadow: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textShadow = `0 0 8px ${subjectBorderColors[index % 4]}`)}
                  onMouseLeave={(e) => (e.currentTarget.style.textShadow = 'none')}
                >
                  {subject.name}
                </h3>
                <div className="flex justify-center gap-2 sm:gap-3">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditSubject(subject);
                      setOpenSubjectDialog(true);
                    }}
                    sx={buttonStyles.edit}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ type: 'subject', subjectId: subject._id });
                    }}
                    sx={buttonStyles.delete}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {selectedSubject && (
        <motion.div
          className="relative mt-8 sm:mt-10 md:mt-12 bg-gradient-to-br from-white/95 to-amber-100/95 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-lora text-[#4A3728] mb-6 tracking-tight">{selectedSubject.name}</h2>
          <Button
            onClick={() => setSelectedSubject(null)}
            startIcon={<CloseIcon />}
            sx={buttonStyles.close}
            className="absolute top-4 right-4"
          >
            Close
          </Button>
          <form
            onSubmit={(e) => handleAddNote(selectedSubject._id, e)}
            className="mb-8 flex flex-col gap-4 sm:gap-6 bg-white/90 p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <TextField
              fullWidth
              label="Note Content"
              multiline
              rows={4}
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              variant="outlined"
              className="rounded-2xl bg-white/80"
              InputProps={{ className: 'font-roboto text-[#4A3728] text-sm sm:text-base' }}
              InputLabelProps={{ className: 'text-[#4A3728] text-sm sm:text-base' }}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={newNote.penColor}
                onChange={(e) => setNewNote({ ...newNote, penColor: e.target.value })}
                className="bg-white rounded-2xl"
                inputProps={{ className: 'font-roboto text-sm sm:text-base' }}
              >
                {Object.keys(penColors).map((color) => (
                  <MenuItem
                    key={color}
                    value={color}
                    style={{ backgroundColor: penColors[color], color: 'white' }}
                    className="font-roboto"
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              <div className="flex-1">
                <label className="font-roboto text-[#4A3728] text-sm">Pen Thickness</label>
                <Slider
                  value={newNote.penThickness}
                  onChange={(e, value) => setNewNote({ ...newNote, penThickness: value })}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  className="text-[#2E4F4F]"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              sx={buttonStyles.add}
            >
              Add Note
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {selectedSubject.notes.map((note, index) => (
                <motion.div
                  key={note._id}
                  className="relative p-4 sm:p-5 rounded-2xl shadow-lg bg-gradient-to-br from-[color] to-[color]/70 border border-gray-200/50"
                  style={{
                    backgroundColor: noteBackgroundColors[index % 4],
                    color: penColors[note.penColor],
                    fontWeight: Math.min(note.penThickness * 150, 900), // Increased rate, capped at 900
                    fontSize: `${Math.min(1 + note.penThickness / 5, 3)}rem`, // Increased rate, capped at 3rem
                    transform: `rotate(${index % 2 === 0 ? 3 : -3}deg)`,
                    boxShadow: '4px 4px 12px rgba(0,0,0,0.2)',
                    clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)',
                  }}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  whileHover={{ y: -5, rotate: 0, boxShadow: '6px 6px 15px rgba(0,0,0,0.3)' }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
                >
                  <p className="font-roboto text-sm sm:text-base">{note.content}</p>
                  <div className="flex justify-center gap-2 sm:gap-3 mt-3">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setEditNote(note);
                        setOpenNoteDialog(true);
                      }}
                      sx={buttonStyles.edit}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteConfirm({ type: 'note', subjectId: selectedSubject._id, noteId: note._id })}
                      sx={buttonStyles.delete}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <Dialog open={openSubjectDialog} onClose={() => setOpenSubjectDialog(false)} classes={{ paper: 'bg-gradient-to-br from-white to-amber-100/95 rounded-3xl shadow-2xl max-w-md w-full' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DialogTitle className="font-lora text-[#4A3728] text-lg sm:text-xl tracking-tight">Edit Subject</DialogTitle>
          <DialogContent className="p-4 sm:p-6">
            <TextField
              fullWidth
              label="Subject Name"
              value={editSubject?.name || ''}
              onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
              variant="outlined"
              className="rounded-2xl bg-white/80"
              InputProps={{ className: 'font-roboto text-[#4A3728] text-sm sm:text-base' }}
              InputLabelProps={{ className: 'text-[#4A3728] text-sm sm:text-base' }}
            />
          </DialogContent>
          <DialogActions className="p-4 sm:p-6">
            <Button
              onClick={() => setOpenSubjectDialog(false)}
              sx={buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubject}
              sx={buttonStyles.save}
            >
              Save
            </Button>
          </DialogActions>
        </motion.div>
      </Dialog>

      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} classes={{ paper: 'bg-gradient-to-br from-white to-amber-100/95 rounded-3xl shadow-2xl max-w-md w-full' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DialogTitle className="font-lora text-[#4A3728] text-lg sm:text-xl tracking-tight">Edit Note</DialogTitle>
          <DialogContent className="p-4 sm:p-6">
            <TextField
              fullWidth
              label="Note Content"
              multiline
              rows={4}
              value={editNote?.content || ''}
              onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
              variant="outlined"
              className="rounded-2xl bg-white/80"
              InputProps={{ className: 'font-roboto text-[#4A3728] text-sm sm:text-base' }}
              InputLabelProps={{ className: 'text-[#4A3728] text-sm sm:text-base' }}
            />
            <Select
              fullWidth
              value={editNote?.penColor || 'black'}
              onChange={(e) => setEditNote({ ...editNote, penColor: e.target.value })}
              className="bg-white rounded-2xl mt-4"
              inputProps={{ className: 'font-roboto text-sm sm:text-base' }}
            >
              {Object.keys(penColors).map((color) => (
                <MenuItem
                  key={color}
                  value={color}
                  style={{ backgroundColor: penColors[color], color: 'white' }}
                  className="font-roboto"
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </MenuItem>
              ))}
            </Select>
            <div className="mt-4">
              <label className="font-roboto text-[#4A3728] text-sm">Pen Thickness</label>
              <Slider
                value={editNote?.penThickness || 1}
                onChange={(e, value) => setEditNote({ ...editNote, penThickness: value })}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                className="text-[#2E4F4F]"
              />
            </div>
          </DialogContent>
          <DialogActions className="p-4 sm:p-6">
            <Button
              onClick={() => setOpenNoteDialog(false)}
              sx={buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNote}
              sx={buttonStyles.save}
            >
              Save
            </Button>
          </DialogActions>
        </motion.div>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} classes={{ paper: 'bg-gradient-to-br from-white to-amber-100/95 rounded-3xl shadow-2xl max-w-md w-full' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DialogTitle className="font-lora text-[#4A3728] text-lg sm:text-xl tracking-tight">Confirm Delete</DialogTitle>
          <DialogContent className="p-4 sm:p-6">
            <p className="font-roboto text-[#4A3728] text-sm sm:text-base">
              Are you sure you want to delete this {deleteConfirm?.type}?
            </p>
          </DialogContent>
          <DialogActions className="p-4 sm:p-6">
            <Button
              onClick={() => setDeleteConfirm(null)}
              sx={buttonStyles.cancel}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.subjectId, deleteConfirm.noteId)}
              sx={buttonStyles.delete}
            >
              Delete
            </Button>
          </DialogActions>
        </motion.div>
      </Dialog>
    </div>
  );
};

export default Notes;