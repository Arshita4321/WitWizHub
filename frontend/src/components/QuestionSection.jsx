import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import '../styles/QuestionSection.css';

const QuestionSection = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' });
  const [editQuestion, setEditQuestion] = useState({ id: null, title: '', description: '' });
  const [newAnswer, setNewAnswer] = useState({});
  const [editAnswer, setEditAnswer] = useState({ questionId: null, answerId: null, text: '' });
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}/answers`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}/answers/${answerId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}/answers/${answerId}`, {
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

  return (
    <motion.div
      className="question-section-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="question-heading">Question Section</h2>
      <form onSubmit={handlePostQuestion} className="question-form">
        <TextField
          fullWidth
          label="Question Title"
          value={newQuestion.title}
          onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
          variant="outlined"
          required
          InputLabelProps={{ style: { color: '#E5E7EB' } }}
          InputProps={{
            style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderRadius: '8px' },
          }}
          style={{ marginBottom: '10px' }}
        />
        <TextField
          fullWidth
          label="Question Description (Optional)"
          value={newQuestion.description}
          onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
          variant="outlined"
          multiline
          rows={3}
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
          Post Question
        </Button>
      </form>
      <div>
        {questions.map((q) => (
          <div key={q._id} className="mb-4 pb-4 border-b border-gray-600">
            {editQuestion.id === q._id ? (
              <form onSubmit={(e) => handleEditQuestion(q._id, e)} className="mb-2">
                <TextField
                  fullWidth
                  label="Question Title"
                  value={editQuestion.title}
                  onChange={(e) => setEditQuestion({ ...editQuestion, title: e.target.value })}
                  variant="outlined"
                  required
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderRadius: '8px' },
                  }}
                  style={{ marginBottom: '10px' }}
                />
                <TextField
                  fullWidth
                  label="Question Description (Optional)"
                  value={editQuestion.description}
                  onChange={(e) => setEditQuestion({ ...editQuestion, description: e.target.value })}
                  variant="outlined"
                  multiline
                  rows={3}
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
                  onClick={() => setEditQuestion({ id: null, title: '', description: '' })}
                  sx={{ color: '#EC4899', marginTop: '10px' }}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="question-container">
                <div>
                  <h3 className="question-title">{q.title}</h3>
                  <p className="question-description">
                    <strong>{q.name}</strong>: {q.description}{' '}
                    <em className="question-timestamp">
                      ({new Date(q.timestamp).toLocaleString()})
                    </em>
                  </p>
                </div>
                {q.userId === userId && (
                  <div className="flex space-x-2">
                    <Button
                      sx={{ color: '#2DD4BF', fontSize: '0.8rem' }}
                      onClick={() => {
                        console.log('Edit question clicked:', { questionId: q._id, userId, qUserId: q.userId });
                        setEditQuestion({ id: q._id, title: q.title, description: q.description });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      sx={{ color: '#EC4899', fontSize: '0.8rem' }}
                      onClick={() => {
                        console.log('Delete question clicked:', { questionId: q._id, userId, qUserId: q.userId });
                        handleDeleteQuestion(q._id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="ml-6 mt-2">
              {q.answers.map((answer) => (
                <div key={answer._id} className="mb-2">
                  {editAnswer.questionId === q._id && editAnswer.answerId === answer._id ? (
                    <form onSubmit={(e) => handleEditAnswer(q._id, answer._id, e)}>
                      <TextField
                        fullWidth
                        value={editAnswer.text}
                        onChange={(e) => setEditAnswer({ ...editAnswer, text: e.target.value })}
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
                        onClick={() => setEditAnswer({ questionId: null, answerId: null, text: '' })}
                        sx={{ color: '#EC4899', marginTop: '10px' }}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <div className="answer-container">
                      <p className="answer-text">
                        <strong>{answer.name}</strong>: {answer.text}{' '}
                        <em className="question-timestamp">
                          ({new Date(answer.timestamp).toLocaleString()})
                        </em>
                      </p>
                      {answer.userId === userId && (
                        <div className="flex space-x-2">
                          <Button
                            sx={{ color: '#2DD4BF', fontSize: '0.8rem' }}
                            onClick={() => {
                              console.log('Edit answer clicked:', { questionId: q._id, answerId: answer._id, userId, answerUserId: answer.userId });
                              setEditAnswer({ questionId: q._id, answerId: answer._id, text: answer.text });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            sx={{ color: '#EC4899', fontSize: '0.8rem' }}
                            onClick={() => {
                              console.log('Delete answer clicked:', { questionId: q._id, answerId: answer._id, userId, answerUserId: answer.userId });
                              handleDeleteAnswer(q._id, answer._id);
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
              <form onSubmit={(e) => handlePostAnswer(q._id, e)} className="mt-2">
                <TextField
                  fullWidth
                  label="Answer"
                  value={newAnswer[q._id] || ''}
                  onChange={(e) => setNewAnswer({ ...newAnswer, [q._id]: e.target.value })}
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
                  Post Answer
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuestionSection;