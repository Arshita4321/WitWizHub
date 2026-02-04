import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Button, Avatar, Chip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { 
  HelpCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import '../styles/QuestionSection.css';

// Consistent API base URL (same pattern as all other components)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const QuestionSection = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' });
  const [editQuestion, setEditQuestion] = useState({ id: null, title: '', description: '' });
  const [newAnswer, setNewAnswer] = useState({});
  const [editAnswer, setEditAnswer] = useState({ questionId: null, answerId: null, text: '' });
  const [expandedQuestions, setExpandedQuestions] = useState({});
  
  const token = localStorage.getItem('jwtToken');
  const name = localStorage.getItem('name');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('localStorage values:', {
      jwtToken: localStorage.getItem('jwtToken'),
      name: localStorage.getItem('name'),
      userId: localStorage.getItem('userId'),
      allKeys: Object.keys(localStorage),
    });
    if (!token || !userId) {
      handleError('Missing token or userId. Redirecting to login.');
      navigate('/login');
    }
  }, [token, userId, navigate]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token || !userId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('GET /api/questions response:', data);
        if (response.ok) {
          setQuestions(data);
        } else {
          handleError(data.message || 'Failed to fetch questions');
        }
      } catch (err) {
        console.error('Fetch questions error:', err);
        handleError('Failed to fetch questions');
      }
    };
    fetchQuestions();
  }, [token, userId]);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    const trimmedTitle = newQuestion.title.trim();
    const trimmedDescription = newQuestion.description.trim();
    if (!trimmedTitle || trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      handleError('Title must be between 3 and 200 characters');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (trimmedDescription.length > 1000) {
      handleError('Description cannot exceed 1000 characters');
      return;
    }
    const payload = { title: trimmedTitle, description: trimmedDescription, name, images: [] };
    console.log('POST /api/questions payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('POST /api/questions response:', { status: response.status, data });
      if (response.ok) {
        setQuestions([...questions, data]);
        setNewQuestion({ title: '', description: '' });
        handleSuccess('Question posted successfully');
      } else {
        handleError(data.message || 'Failed to post question', data.error?.details);
      }
    } catch (err) {
      console.error('Post question error:', err);
      handleError('Failed to post question');
    }
  };

  const handleEditQuestion = async (questionId, e) => {
    e.preventDefault();
    const trimmedTitle = editQuestion.title.trim();
    const trimmedDescription = editQuestion.description.trim();
    if (!trimmedTitle || trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      handleError('Title must be between 3 and 200 characters');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (trimmedDescription.length > 1000) {
      handleError('Description cannot exceed 1000 characters');
      return;
    }
    const payload = { title: trimmedTitle, description: trimmedDescription, name, images: [] };
    console.log('PUT /api/questions payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('PUT /api/questions response:', { status: response.status, data });
      if (response.ok) {
        setQuestions(questions.map((q) => (q._id === questionId ? data : q)));
        setEditQuestion({ id: null, title: '', description: '' });
        handleSuccess('Question updated successfully');
      } else {
        handleError(data.message || 'Failed to update question', data.error?.details);
      }
    } catch (err) {
      console.error('Edit question error:', err);
      handleError('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('DELETE /api/questions response:', { status: response.status, data });
      if (response.ok) {
        setQuestions(questions.filter((q) => q._id !== questionId));
        handleSuccess('Question deleted successfully');
      } else {
        handleError(data.message || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Delete question error:', err);
      handleError('Failed to delete question');
    }
  };

  const handlePostAnswer = async (questionId, e) => {
    e.preventDefault();
    const answerText = newAnswer[questionId]?.trim();
    if (!answerText) {
      handleError('Answer cannot be empty');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (answerText.length > 500) {
      handleError('Answer cannot exceed 500 characters');
      return;
    }
    const payload = { text: answerText, name, images: [] };
    console.log('POST /api/questions/answers payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('POST /api/questions/answers response:', { status: response.status, data });
      if (response.ok) {
        setQuestions(questions.map((q) => (q._id === questionId ? data : q)));
        setNewAnswer({ ...newAnswer, [questionId]: '' });
        handleSuccess('Answer posted successfully');
      } else {
        handleError(data.message || 'Failed to post answer', data.error?.details);
      }
    } catch (err) {
      console.error('Post answer error:', err);
      handleError('Failed to post answer');
    }
  };

  const handleEditAnswer = async (questionId, answerId, e) => {
    e.preventDefault();
    const trimmedText = editAnswer.text.trim();
    if (!trimmedText) {
      handleError('Answer cannot be empty');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (trimmedText.length > 500) {
      handleError('Answer cannot exceed 500 characters');
      return;
    }
    const payload = { text: trimmedText, name, images: [] };
    console.log('PUT /api/questions/answers payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/answers/${answerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('PUT /api/questions/answers response:', { status: response.status, data });
      if (response.ok) {
        setQuestions(questions.map((q) => (q._id === questionId ? data : q)));
        setEditAnswer({ questionId: null, answerId: null, text: '' });
        handleSuccess('Answer updated successfully');
      } else {
        handleError(data.message || 'Failed to update answer', data.error?.details);
      }
    } catch (err) {
      console.error('Edit answer error:', err);
      handleError('Failed to update answer');
    }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/answers/${answerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('DELETE /api/questions/answers response:', { status: response.status, data });
      if (response.ok) {
        setQuestions(questions.map((q) => (q._id === questionId ? data : q)));
        handleSuccess('Answer deleted successfully');
      } else {
        handleError(data.message || 'Failed to delete answer');
      }
    } catch (err) {
      console.error('Delete answer error:', err);
      handleError('Failed to delete answer');
    }
  };

  const toggleAnswers = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    return colors[name?.charCodeAt(0) % colors.length];
  };

  const getQuestionStatusColor = (answerCount) => {
    if (answerCount === 0) return 'from-red-500 to-pink-500';
    if (answerCount < 3) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getQuestionStatusIcon = (answerCount) => {
    if (answerCount === 0) return AlertCircle;
    if (answerCount < 3) return HelpCircle;
    return CheckCircle2;
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mr-4"
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            <Lightbulb className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Q&A Hub
          </h2>
        </div>
        <p className="text-gray-400 text-xl mb-6">Ask questions, share knowledge, and grow together</p>
        
        {/* Quick Stats */}
        <motion.div 
          className="flex justify-center space-x-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-full">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-medium">{questions.length} Questions</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium">
              {questions.reduce((acc, q) => acc + q.answers.length, 0)} Answers
            </span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-full">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Growing Community</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Question Input Form */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl"
          whileHover={{ y: -2, boxShadow: '0 25px 50px rgba(139, 69, 193, 0.3)' }}
        >
          <div className="flex items-center mb-6">
            <motion.div
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4"
              whileHover={{ rotate: 10 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white">Ask a New Question</h3>
          </div>
          
          <form onSubmit={handlePostQuestion} className="space-y-6">
            <div className="flex items-start space-x-4">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: getAvatarColor(name),
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <div className="flex-1 space-y-4">
                <TextField
                  fullWidth
                  label="Question Title"
                  placeholder="What would you like to know?"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      color: '#E5E7EB',
                      fontSize: '1.1rem',
                      '& fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.3)',
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.6)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#9333EA',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(147, 51, 234, 0.8)',
                      '&.Mui-focused': {
                        color: '#9333EA',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  placeholder="Provide more context for your question..."
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      color: '#E5E7EB',
                      '& fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.3)',
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.6)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#9333EA',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(147, 51, 234, 0.8)',
                      '&.Mui-focused': {
                        color: '#9333EA',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1,
                    },
                  }}
                />
                <motion.div
                  className="flex justify-end"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!token || !userId || !name || !newQuestion.title.trim()}
                    sx={{
                      background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                      borderRadius: '16px',
                      padding: '12px 32px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      minWidth: '150px',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 35px rgba(147, 51, 234, 0.4)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.4)',
                      },
                    }}
                    startIcon={<HelpCircle className="w-5 h-5" />}
                  >
                    Ask Question
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Questions List */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {questions.map((question, index) => {
            const StatusIcon = getQuestionStatusIcon(question.answers.length);
            return (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {editQuestion.id === question._id ? (
                  <motion.div
                    className="p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-blue-500/30 shadow-2xl"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="flex items-center mb-6">
                      <Edit3 className="w-6 h-6 text-blue-400 mr-3" />
                      <h3 className="text-xl font-bold text-white">Edit Question</h3>
                    </div>
                    <form onSubmit={(e) => handleEditQuestion(question._id, e)} className="space-y-4">
                      <TextField
                        fullWidth
                        label="Question Title"
                        value={editQuestion.title}
                        onChange={(e) => setEditQuestion({ ...editQuestion, title: e.target.value })}
                        variant="outlined"
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            color: '#E5E7EB',
                            '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.5)' },
                            '&:hover fieldset': { borderColor: 'rgba(59, 130, 246, 0.8)' },
                            '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(59, 130, 246, 0.8)' },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Description"
                        value={editQuestion.description}
                        onChange={(e) => setEditQuestion({ ...editQuestion, description: e.target.value })}
                        variant="outlined"
                        multiline
                        rows={3}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            color: '#E5E7EB',
                            '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.5)' },
                            '&:hover fieldset': { borderColor: 'rgba(59, 130, 246, 0.8)' },
                            '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(59, 130, 246, 0.8)' },
                        }}
                      />
                      <div className="flex space-x-3 justify-end">
                        <Button
                          type="submit"
                          sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '10px 24px',
                            fontWeight: 'bold',
                          }}
                        >
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => setEditQuestion({ id: null, title: '', description: '' })}
                          sx={{
                            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '10px 24px',
                            fontWeight: 'bold',
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    className="p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:border-white/20"
                    whileHover={{ y: -3 }}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: getAvatarColor(question.name),
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            border: '3px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {question.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-bold text-white text-xl">{question.name}</span>
                            <Chip
                              icon={<Clock className="w-3 h-3" />}
                              label={new Date(question.timestamp).toLocaleString()}
                              size="small"
                              sx={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#A78BFA',
                                fontSize: '0.75rem',
                              }}
                            />
                          </div>
                          <motion.h3 
                            className="text-2xl font-bold text-white mb-3 leading-tight"
                            whileHover={{ x: 5 }}
                          >
                            {question.title}
                          </motion.h3>
                          {question.description && (
                            <p className="text-gray-300 text-lg leading-relaxed">
                              {question.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className={`flex items-center space-x-2 px-3 py-2 bg-gradient-to-r ${getQuestionStatusColor(question.answers.length)} rounded-full`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <StatusIcon className="w-4 h-4 text-white" />
                          <span className="text-white font-medium text-sm">
                            {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                          </span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Action Buttons for Question Owner */}
                    {question.userId === userId && (
                      <motion.div
                        className="flex space-x-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0, x: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.button
                          onClick={() => {
                            console.log('Edit question clicked:', { questionId: question._id, userId, qUserId: question.userId });
                            setEditQuestion({ id: question._id, title: question.title, description: question.description });
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Edit3 className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400 font-medium">Edit Question</span>
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            console.log('Delete question clicked:', { questionId: question._id, userId, qUserId: question.userId });
                            handleDeleteQuestion(question._id);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 font-medium">Delete</span>
                        </motion.button>
                      </motion.div>
                    )}

                    <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '20px 0' }} />

                    {/* Answers Section */}
                    {question.answers && question.answers.length > 0 && (
                      <motion.div className="mb-6">
                        <motion.button
                          onClick={() => toggleAnswers(question._id)}
                          className="flex items-center space-x-3 text-teal-400 hover:text-teal-300 mb-6 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-semibold text-lg">
                            {expandedQuestions[question._id] ? 'Hide' : 'View'} {question.answers.length} answers
                          </span>
                          <motion.div
                            animate={{ rotate: expandedQuestions[question._id] ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-teal-400" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {expandedQuestions[question._id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 pl-6 border-l-2 border-teal-400/30"
                            >
                              {question.answers.map((answer, answerIndex) => (
                                <motion.div
                                  key={answer._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: answerIndex * 0.1 }}
                                  className="group/answer relative"
                                >
                                  {editAnswer.questionId === question._id && editAnswer.answerId === answer._id ? (
                                    <motion.div
                                      className="p-6 bg-gradient-to-br from-green-800/20 to-teal-800/20 rounded-2xl border border-green-400/20"
                                      initial={{ scale: 0.95 }}
                                      animate={{ scale: 1 }}
                                    >
                                      <form onSubmit={(e) => handleEditAnswer(question._id, answer._id, e)} className="space-y-4">
                                        <TextField
                                          fullWidth
                                          multiline
                                          rows={3}
                                          value={editAnswer.text}
                                          onChange={(e) => setEditAnswer({ ...editAnswer, text: e.target.value })}
                                          variant="outlined"
                                          sx={{
                                            '& .MuiOutlinedInput-root': {
                                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                              borderRadius: '16px',
                                              color: '#E5E7EB',
                                              '& fieldset': { borderColor: 'rgba(16, 185, 129, 0.5)' },
                                              '&:hover fieldset': { borderColor: 'rgba(16, 185, 129, 0.8)' },
                                              '&.Mui-focused fieldset': { borderColor: '#10B981' },
                                            },
                                          }}
                                        />
                                        <div className="flex space-x-2">
                                          <Button
                                            type="submit"
                                            sx={{
                                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                              color: 'white',
                                              borderRadius: '10px',
                                              padding: '8px 20px',
                                              fontWeight: 'bold',
                                            }}
                                          >
                                            Save Answer
                                          </Button>
                                          <Button
                                            onClick={() => setEditAnswer({ questionId: null, answerId: null, text: '' })}
                                            sx={{
                                              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                              color: 'white',
                                              borderRadius: '10px',
                                              padding: '8px 20px',
                                              fontWeight: 'bold',
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </form>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      className="p-6 bg-gradient-to-br from-white/3 to-white/8 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200"
                                      whileHover={{ x: 5, scale: 1.01 }}
                                    >
                                      <div className="flex items-start space-x-4">
                                        <Avatar
                                          sx={{
                                            width: 44,
                                            height: 44,
                                            background: getAvatarColor(answer.name),
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            border: '2px solid rgba(255, 255, 255, 0.1)',
                                          }}
                                        >
                                          {answer.name?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <span className="font-bold text-white text-lg">{answer.name}</span>
                                            <Chip
                                              icon={<Clock className="w-2 h-2" />}
                                              label={new Date(answer.timestamp).toLocaleString()}
                                              size="small"
                                              sx={{
                                                background: 'rgba(45, 212, 191, 0.2)',
                                                color: '#2DD4BF',
                                                fontSize: '0.7rem',
                                                height: '22px',
                                              }}
                                            />
                                          </div>
                                          <p className="text-gray-200 text-lg leading-relaxed break-words">
                                            {answer.text}
                                          </p>
                                          
                                          {answer.userId === userId && (
                                            <motion.div
                                              className="flex space-x-2 mt-4 opacity-0 group-hover/answer:opacity-100 transition-opacity duration-200"
                                            >
                                              <motion.button
                                                onClick={() => {
                                                  console.log('Edit answer clicked:', { questionId: question._id, answerId: answer._id, userId, answerUserId: answer.userId });
                                                  setEditAnswer({ questionId: question._id, answerId: answer._id, text: answer.text });
                                                }}
                                                className="flex items-center space-x-1 px-3 py-1 bg-teal-500/15 hover:bg-teal-500/25 rounded-lg transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                              >
                                                <Edit3 className="w-3 h-3 text-teal-400" />
                                                <span className="text-teal-400 text-sm font-medium">Edit</span>
                                              </motion.button>
                                              <motion.button
                                                onClick={() => {
                                                  console.log('Delete answer clicked:', { questionId: question._id, answerId: answer._id, userId, answerUserId: answer.userId });
                                                  handleDeleteAnswer(question._id, answer._id);
                                                }}
                                                className="flex items-center space-x-1 px-3 py-1 bg-red-500/15 hover:bg-red-500/25 rounded-lg transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                              >
                                                <Trash2 className="w-3 h-3 text-red-400" />
                                                <span className="text-red-400 text-sm font-medium">Delete</span>
                                              </motion.button>
                                            </motion.div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Answer Input */}
                    <motion.div
                      className="pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center mb-4">
                        <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-gray-300 font-medium">Share your knowledge</span>
                      </div>
                      <form onSubmit={(e) => handlePostAnswer(question._id, e)} className="flex items-end space-x-4">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: getAvatarColor(name),
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <TextField
                          fullWidth
                          placeholder="Write your answer..."
                          value={newAnswer[question._id] || ''}
                          onChange={(e) => setNewAnswer({ ...newAnswer, [question._id]: e.target.value })}
                          variant="outlined"
                          multiline
                          maxRows={4}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '20px',
                              color: '#E5E7EB',
                              fontSize: '1rem',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                borderWidth: '2px',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(45, 212, 191, 0.4)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#2DD4BF',
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputBase-input::placeholder': {
                              color: 'rgba(255, 255, 255, 0.4)',
                            },
                          }}
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={!token || !userId || !name || !newAnswer[question._id]?.trim()}
                            sx={{
                              background: 'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',
                              borderRadius: '16px',
                              padding: '12px 24px',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              minWidth: '120px',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #0D9488 0%, #059669 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 30px rgba(45, 212, 191, 0.4)',
                              },
                              '&:disabled': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.4)',
                              },
                            }}
                            startIcon={<CheckCircle2 className="w-5 h-5" />}
                          >
                            Answer
                          </Button>
                        </motion.div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {questions.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-3xl border border-purple-500/20 max-w-md mx-auto"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <HelpCircle className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Questions Yet</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Be the first to ask a question and start the conversation! 
                Share your curiosity with the community.
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuestionSection;