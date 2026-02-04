import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Button, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { Send, Edit3, Trash2, Reply, MessageSquare, Clock, User, Sparkles } from 'lucide-react';
import '../styles/ChatSection.css';
import { API_BASE_URL } from "../config/api.js";

const ChatSection = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newReply, setNewReply] = useState({});
  const [editMessage, setEditMessage] = useState({ id: null, text: '' });
  const [editReply, setEditReply] = useState({ messageId: null, replyId: null, text: '' });
  const [expandedReplies, setExpandedReplies] = useState({});
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem('jwtToken');
  const name = localStorage.getItem('name');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    const fetchMessages = async () => {
      if (!token || !userId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log('GET /api/messages response:', data);
        if (response.ok) {
          setMessages(data);
        } else {
          handleError(data.message || 'Failed to fetch messages');
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
        handleError('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, [token, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePostMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage && trimmedMessage !== '') {
      handleError('Message cannot be empty (unless intentionally blank)');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (trimmedMessage.length > 500) {
      handleError('Message cannot exceed 500 characters');
      return;
    }
    const payload = { text: trimmedMessage, name, images: [] };
    console.log('POST /api/messages payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('POST /api/messages response:', { status: response.status, data });
      if (response.ok) {
        setMessages([...messages, data]);
        setNewMessage('');
        handleSuccess('Message posted successfully');
      } else {
        handleError(data.message || 'Failed to post message', data.error?.details);
      }
    } catch (err) {
      console.error('Post message error:', err);
      handleError('Failed to post message');
    }
  };

  const handleEditMessage = async (messageId, e) => {
    e.preventDefault();
    const trimmedText = editMessage.text.trim();
    if (!trimmedText && trimmedText !== '') {
      handleError('Message cannot be empty (unless intentionally blank)');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (trimmedText.length > 500) {
      handleError('Message cannot exceed 500 characters');
      return;
    }
    const payload = { text: trimmedText, name, images: [] };
    console.log('PUT /api/messages payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('PUT /api/messages response:', { status: response.status, data });
      if (response.ok) {
        setMessages(messages.map((msg) => (msg._id === messageId ? data : msg)));
        setEditMessage({ id: null, text: '' });
        handleSuccess('Message updated successfully');
      } else {
        handleError(data.message || 'Failed to update message', data.error?.details);
      }
    } catch (err) {
      console.error('Edit message error:', err);
      handleError('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('DELETE /api/messages response:', { status: response.status, data });
      if (response.ok) {
        setMessages(messages.filter((msg) => msg._id !== messageId));
        handleSuccess('Message deleted successfully');
      } else {
        handleError(data.message || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Delete message error:', err);
      handleError('Failed to delete message');
    }
  };

  const handlePostReply = async (messageId, e) => {
    e.preventDefault();
    const replyText = newReply[messageId]?.trim();
    if (!replyText) {
      handleError('Reply cannot be empty');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (replyText.length > 500) {
      handleError('Reply cannot exceed 500 characters');
      return;
    }
    const payload = { text: replyText, name, images: [] };
    console.log('POST /api/messages/replies payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('POST /api/messages/replies response:', { status: response.status, data });
      if (response.ok) {
        setMessages(messages.map((msg) => (msg._id === messageId ? data : msg)));
        setNewReply({ ...newReply, [messageId]: '' });
        handleSuccess('Reply posted successfully');
      } else {
        handleError(data.message || 'Failed to post reply', data.error?.details);
      }
    } catch (err) {
      console.error('Post reply error:', err);
      handleError('Failed to post reply');
    }
  };

  const handleEditReply = async (messageId, replyId, e) => {
    e.preventDefault();
    const trimmedText = editReply.text.trim();
    if (!trimmedText) {
      handleError('Reply cannot be empty');
      return;
    }
    if (!name || name.length < 3 || name.length > 100) {
      handleError('Name must be between 3 and 100 characters');
      return;
    }
    if (trimmedText.length > 500) {
      handleError('Reply cannot exceed 500 characters');
      return;
    }
    const payload = { text: trimmedText, name, images: [] };
    console.log('PUT /api/messages/replies payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/replies/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('PUT /api/messages/replies response:', { status: response.status, data });
      if (response.ok) {
        setMessages(messages.map((msg) => (msg._id === messageId ? data : msg)));
        setEditReply({ messageId: null, replyId: null, text: '' });
        handleSuccess('Reply updated successfully');
      } else {
        handleError(data.message || 'Failed to update reply', data.error?.details);
      }
    } catch (err) {
      console.error('Edit reply error:', err);
      handleError('Failed to update reply');
    }
  };

  const handleDeleteReply = async (messageId, replyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('DELETE /api/messages/replies response:', { status: response.status, data });
      if (response.ok) {
        setMessages(messages.map((msg) => (msg._id === messageId ? data : msg)));
        handleSuccess('Reply deleted successfully');
      } else {
        handleError(data.message || 'Failed to delete reply');
      }
    } catch (err) {
      console.error('Delete reply error:', err);
      handleError('Failed to delete reply');
    }
  };

  const toggleReplies = (messageId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
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

  return (
    <motion.div
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl mr-4"
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            <MessageSquare className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Live Chat
          </h2>
        </div>
        <p className="text-gray-400 text-lg">Join the conversation and connect with fellow innovators</p>
      </motion.div>

      {/* Message Input Form */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <form onSubmit={handlePostMessage} className="relative">
          <div className="flex items-end space-x-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: getAvatarColor(name),
                fontSize: '1.2rem',
                fontWeight: 'bold',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div className="flex-1 relative">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Share your thoughts with the community..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    color: '#E5E7EB',
                    fontSize: '1.1rem',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(45, 212, 191, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2DD4BF',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                }}
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={!token || !userId || !name || !newMessage.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #2DD4BF 0%, #38BDF8 100%)',
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  minWidth: '120px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0D9488 0%, #0284C7 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 30px rgba(45, 212, 191, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.4)',
                  },
                }}
                startIcon={<Send className="w-5 h-5" />}
              >
                Send
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        className="space-y-6 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative"
            >
              {editMessage.id === msg._id ? (
                <motion.div
                  className="p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <form onSubmit={(e) => handleEditMessage(msg._id, e)} className="space-y-4">
                    <TextField
                      fullWidth
                      multiline
                      value={editMessage.text}
                      onChange={(e) => setEditMessage({ ...editMessage, text: e.target.value })}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          color: '#E5E7EB',
                          '& fieldset': {
                            borderColor: 'rgba(147, 51, 234, 0.5)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(147, 51, 234, 0.8)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#9333EA',
                          },
                        },
                      }}
                    />
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        sx={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          borderRadius: '12px',
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditMessage({ id: null, text: '' })}
                        sx={{
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          color: 'white',
                          borderRadius: '12px',
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  className="p-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:border-white/20"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start space-x-4">
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        background: getAvatarColor(msg.name),
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {msg.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-white text-lg">{msg.name}</span>
                        <Chip
                          icon={<Clock className="w-3 h-3" />}
                          label={new Date(msg.timestamp).toLocaleString()}
                          size="small"
                          sx={{
                            background: 'rgba(45, 212, 191, 0.2)',
                            color: '#2DD4BF',
                            fontSize: '0.75rem',
                            '& .MuiChip-icon': {
                              color: '#2DD4BF',
                            },
                          }}
                        />
                      </div>
                      <p className="text-gray-200 text-lg leading-relaxed break-words">
                        {msg.text}
                      </p>
                      
                      {/* Action buttons */}
                      {msg.userId === userId && (
                        <motion.div
                          className="flex space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 0, x: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.button
                            onClick={() => {
                              console.log('Edit message clicked:', { messageId: msg._id, userId, msgUserId: msg.userId });
                              setEditMessage({ id: msg._id, text: msg.text });
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Edit3 className="w-3 h-3 text-teal-400" />
                            <span className="text-teal-400 text-sm">Edit</span>
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              console.log('Delete message clicked:', { messageId: msg._id, userId, msgUserId: msg.userId });
                              handleDeleteMessage(msg._id);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                            <span className="text-red-400 text-sm">Delete</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Reply Section */}
                  {msg.replies && msg.replies.length > 0 && (
                    <motion.div className="mt-6 pl-6 border-l-2 border-gradient-to-b from-teal-400/50 to-purple-400/50">
                      <motion.button
                        onClick={() => toggleReplies(msg._id)}
                        className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 mb-4 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Reply className="w-4 h-4" />
                        <span className="font-medium">
                          {expandedReplies[msg._id] ? 'Hide' : 'Show'} {msg.replies.length} replies
                        </span>
                        <motion.div
                          animate={{ rotate: expandedReplies[msg._id] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {expandedReplies[msg._id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            {msg.replies.map((reply, replyIndex) => (
                              <motion.div
                                key={reply._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: replyIndex * 0.1 }}
                                className="group/reply relative"
                              >
                                {editReply.messageId === msg._id && editReply.replyId === reply._id ? (
                                  <motion.div
                                    className="p-4 bg-gradient-to-br from-purple-800/20 to-blue-800/20 rounded-2xl border border-purple-400/20"
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                  >
                                    <form onSubmit={(e) => handleEditReply(msg._id, reply._id, e)} className="space-y-3">
                                      <TextField
                                        fullWidth
                                        multiline
                                        value={editReply.text}
                                        onChange={(e) => setEditReply({ ...editReply, text: e.target.value })}
                                        variant="outlined"
                                        sx={{
                                          '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '12px',
                                            color: '#E5E7EB',
                                            '& fieldset': {
                                              borderColor: 'rgba(147, 51, 234, 0.3)',
                                            },
                                          },
                                        }}
                                      />
                                      <div className="flex space-x-2">
                                        <Button
                                          type="submit"
                                          size="small"
                                          sx={{
                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                            color: 'white',
                                            borderRadius: '8px',
                                          }}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          onClick={() => setEditReply({ messageId: null, replyId: null, text: '' })}
                                          size="small"
                                          sx={{
                                            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                            color: 'white',
                                            borderRadius: '8px',
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </form>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    className="p-4 bg-gradient-to-br from-white/3 to-white/8 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200"
                                    whileHover={{ x: 5 }}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <Avatar
                                        sx={{
                                          width: 36,
                                          height: 36,
                                          background: getAvatarColor(reply.name),
                                          fontSize: '0.9rem',
                                          fontWeight: 'bold',
                                          border: '2px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                      >
                                        {reply.name?.charAt(0).toUpperCase() || 'U'}
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-semibold text-white text-sm">{reply.name}</span>
                                          <Chip
                                            icon={<Clock className="w-2 h-2" />}
                                            label={new Date(reply.timestamp).toLocaleString()}
                                            size="small"
                                            sx={{
                                              background: 'rgba(139, 92, 246, 0.2)',
                                              color: '#A78BFA',
                                              fontSize: '0.7rem',
                                              height: '20px',
                                            }}
                                          />
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed break-words">
                                          {reply.text}
                                        </p>
                                        
                                        {reply.userId === userId && (
                                          <motion.div
                                            className="flex space-x-2 mt-2 opacity-0 group-hover/reply:opacity-100 transition-opacity duration-200"
                                          >
                                            <motion.button
                                              onClick={() => {
                                                console.log('Edit reply clicked:', { messageId: msg._id, replyId: reply._id, userId, replyUserId: reply.userId });
                                                setEditReply({ messageId: msg._id, replyId: reply._id, text: reply.text });
                                              }}
                                              className="flex items-center space-x-1 px-2 py-1 bg-teal-500/15 hover:bg-teal-500/25 rounded-md transition-colors"
                                              whileHover={{ scale: 1.05 }}
                                            >
                                              <Edit3 className="w-2 h-2 text-teal-400" />
                                              <span className="text-teal-400 text-xs">Edit</span>
                                            </motion.button>
                                            <motion.button
                                              onClick={() => {
                                                console.log('Delete reply clicked:', { messageId: msg._id, replyId: reply._id, userId, replyUserId: reply.userId });
                                                handleDeleteReply(msg._id, reply._id);
                                              }}
                                              className="flex items-center space-x-1 px-2 py-1 bg-red-500/15 hover:bg-red-500/25 rounded-md transition-colors"
                                              whileHover={{ scale: 1.05 }}
                                            >
                                              <Trash2 className="w-2 h-2 text-red-400" />
                                              <span className="text-red-400 text-xs">Delete</span>
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

                  {/* Reply Input */}
                  <motion.div
                    className="mt-4 pl-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <form onSubmit={(e) => handlePostReply(msg._id, e)} className="flex items-center space-x-3">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          background: getAvatarColor(name),
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          border: '2px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <TextField
                        fullWidth
                        placeholder="Write a reply..."
                        value={newReply[msg._id] || ''}
                        onChange={(e) => setNewReply({ ...newReply, [msg._id]: e.target.value })}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            color: '#E5E7EB',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(45, 212, 191, 0.3)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2DD4BF',
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
                          disabled={!token || !userId || !name || !newReply[msg._id]?.trim()}
                          sx={{
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                            borderRadius: '12px',
                            minWidth: '80px',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                            },
                            '&:disabled': {
                              background: 'rgba(255, 255, 255, 0.05)',
                            },
                          }}
                        >
                          Reply
                        </Button>
                      </motion.div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Empty State */}
      {messages.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="p-8 bg-gradient-to-br from-teal-900/20 to-cyan-900/20 backdrop-blur-xl rounded-3xl border border-teal-500/20 max-w-md mx-auto"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-center mb-6">
              <motion.div
                className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <MessageSquare className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Messages Yet</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Start the conversation! Share your thoughts and connect with the community.
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatSection;