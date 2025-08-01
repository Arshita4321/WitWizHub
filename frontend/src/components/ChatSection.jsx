import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import '../styles/ChatSection.css';

const ChatSection = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newReply, setNewReply] = useState({});
  const [editMessage, setEditMessage] = useState({ id: null, text: '' });
  const [editReply, setEditReply] = useState({ messageId: null, replyId: null, text: '' });
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
    const fetchMessages = async () => {
      if (!token || !userId) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}/replies`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}/replies/${replyId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}/replies/${replyId}`, {
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

  return (
    <motion.div
      className="chat-container"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="chat-heading">Chat Section</h2>
      <form onSubmit={handlePostMessage} className="message-form">
        <TextField
          fullWidth
          label="New Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          InputLabelProps={{ style: { color: '#E5E7EB' } }}
          InputProps={{
            style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderRadius: '8px' },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          className="post-button"
          disabled={!token || !userId || !name}
        >
          Post Message
        </Button>
      </form>
      <div>
        {messages.map((msg) => (
          <div key={msg._id} className="mb-4 pb-4 border-b border-gray-600">
            {editMessage.id === msg._id ? (
              <form onSubmit={(e) => handleEditMessage(msg._id, e)} className="mb-2">
                <TextField
                  fullWidth
                  value={editMessage.text}
                  onChange={(e) => setEditMessage({ ...editMessage, text: e.target.value })}
                  variant="outlined"
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderRadius: '8px' },
                  }}
                />
                <Button
                  type="submit"
                  sx={{ color: '#2DD4BF', marginTop: '10px', marginRight: '10px' }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditMessage({ id: null, text: '' })}
                  sx={{ color: '#EC4899', marginTop: '10px' }}
                >
                  Cancel
                </Button>
              </form>
            )

: (
              <div className="message-container">
                <p className="message-text">
                  <strong>{msg.name}</strong>: {msg.text}{' '}
                  <em className="message-timestamp">
                    ({new Date(msg.timestamp).toLocaleString()})
                  </em>
                </p>
                {msg.userId === userId && (
                  <div className="flex space-x-2">
                    <Button
                      sx={{ color: '#2DD4BF', fontSize: '0.8rem' }}
                      onClick={() => {
                        console.log('Edit message clicked:', { messageId: msg._id, userId, msgUserId: msg.userId });
                        setEditMessage({ id: msg._id, text: msg.text });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      sx={{ color: '#EC4899', fontSize: '0.8rem' }}
                      onClick={() => {
                        console.log('Delete message clicked:', { messageId: msg._id, userId, msgUserId: msg.userId });
                        handleDeleteMessage(msg._id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="ml-6 mt-2">
              {msg.replies.map((reply) => (
                <div key={reply._id} className="mb-2">
                  {editReply.messageId === msg._id && editReply.replyId === reply._id ? (
                    <form onSubmit={(e) => handleEditReply(msg._id, reply._id, e)}>
                      <TextField
                        fullWidth
                        value={editReply.text}
                        onChange={(e) => setEditReply({ ...editReply, text: e.target.value })}
                        variant="outlined"
                        InputLabelProps={{ style: { color: '#E5E7EB' } }}
                        InputProps={{
                          style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderRadius: '8px' },
                        }}
                      />
                      <Button
                        type="submit"
                        sx={{ color: '#2DD4BF', marginTop: '10px', marginRight: '10px' }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditReply({ messageId: null, replyId: null, text: '' })}
                        sx={{ color: '#EC4899', marginTop: '10px' }}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <div className="reply-container">
                      <p className="reply-text">
                        <strong>{reply.name}</strong>: {reply.text}{' '}
                        <em className="message-timestamp">
                          ({new Date(reply.timestamp).toLocaleString()})
                        </em>
                      </p>
                      {reply.userId === userId && (
                        <div className="flex space-x-2">
                          <Button
                            sx={{ color: '#2DD4BF', fontSize: '0.8rem' }}
                            onClick={() => {
                              console.log('Edit reply clicked:', { messageId: msg._id, replyId: reply._id, userId, replyUserId: reply.userId });
                              setEditReply({ messageId: msg._id, replyId: reply._id, text: reply.text });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            sx={{ color: '#EC4899', fontSize: '0.8rem' }}
                            onClick={() => {
                              console.log('Delete reply clicked:', { messageId: msg._id, replyId: reply._id, userId, replyUserId: reply.userId });
                              handleDeleteReply(msg._id, reply._id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <form onSubmit={(e) => handlePostReply(msg._id, e)} className="mt-2">
                <TextField
                  fullWidth
                  label="Reply"
                  value={newReply[msg._id] || ''}
                  onChange={(e) => setNewReply({ ...newReply, [msg._id]: e.target.value })}
                  variant="outlined"
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderRadius: '8px' },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  className="post-button"
                  disabled={!token || !userId || !name}
                >
                  Post Reply
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ChatSection;