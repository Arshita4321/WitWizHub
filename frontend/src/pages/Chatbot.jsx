import React, { useState, useEffect, useRef, Component } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaEdit, FaTrash, FaHistory, FaPlus } from 'react-icons/fa';
import { BsRobot } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from "../config/api.js";

// Use environment variable (VITE_API_URL) with localhost fallback


class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-[#EF4444] text-center p-4">
          <p>Something went wrong: {this.state.error?.message}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [saveHistory, setSaveHistory] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChatTitle, setCurrentChatTitle] = useState('');
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const titleInputRef = useRef(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('No JWT token found in localStorage');
      toast.error('Please log in to view chat history', { duration: 4000 });
      return;
    }

    try {
      console.log('Fetching chat history...');
      const res = await axios.get(`${API_BASE_URL}/api/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Chat history response:', res.data);
      setChatHistory(res.data);
      if (res.data.length === 0) {
        console.log('No chats found in history');
      }
    } catch (err) {
      console.error('Error fetching chat history:', err.response?.data || err.message);
      toast.error('Failed to load chat history', { duration: 4000 });
    }
  };

  const fetchChatMessages = async (chatId) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('No JWT token found');
      toast.error('Please log in to view chat messages', { duration: 4000 });
      return;
    }

    try {
      console.log('Fetching messages for chatId:', chatId);
      const res = await axios.get(`${API_BASE_URL}/api/chatbot/history/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched messages:', res.data);
      setMessages(res.data.map(msg => ({
        _id: msg._id,
        sender: msg.sender,
        text: msg.text,
        videoLink: msg.videoLink,
        clarification: msg.clarification,
        responseType: msg.responseType,
        error: msg.error,
        timestamp: new Date(msg.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      })));
      const chat = chatHistory.find(c => c.chatId === chatId) || { title: res.data[0]?.title || '' };
      setCurrentChatTitle(chat.title);
      setCurrentChatId(chatId);
      setShowHistoryModal(false);
    } catch (err) {
      console.error('Error fetching chat messages:', err.response?.data || err.message);
      toast.error('Failed to load chat messages', { duration: 4000 });
    }
  };

  const startNewChat = () => {
    const newChatId = uuidv4();
    console.log('Starting new chat with ID:', newChatId);
    setMessages([]);
    setCurrentChatId(newChatId);
    setCurrentChatTitle('');
    setShowTitlePrompt(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) {
      toast.error('Please enter a chat title', { duration: 4000 });
      return;
    }
    console.log('Setting chat title:', newChatTitle, 'for chatId:', currentChatId);
    setCurrentChatTitle(newChatTitle);
    setNewChatTitle('');
    setShowTitlePrompt(false);
    fetchHistory(); // Refresh history to include new chat
  };

  useEffect(() => {
    fetchHistory();
    startNewChat();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) {
      toast.error('Please enter a message', { duration: 4000 });
      return;
    }

    const token = localStorage.getItem('jwtToken');
    console.log('Sending message:', { question: input, chatId: currentChatId, title: currentChatTitle, saveHistory, token: token ? 'Present' : 'Missing' });
    if (!token) {
      toast.error('Please log in to use the chatbot', { duration: 4000 });
      return;
    }

    if (!currentChatId || !currentChatTitle) {
      toast.error('Please start a new chat with a title', { duration: 4000 });
      return;
    }

    const userMsg = { 
      sender: 'user', 
      text: input, 
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      tempId: uuidv4() // Temporary ID for local rendering
    };
    if (editingIndex !== null) {
      setMessages(prev => prev.slice(0, editingIndex).concat([userMsg]));
      setEditingIndex(null);
      setInput('');
    } else {
      setMessages(prev => [...prev, userMsg]);
      setInput('');
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chatbot/ask`,
        { question: input, chatId: currentChatId, title: currentChatTitle, saveHistory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Backend response:', res.data);
      const botMessage = {
        _id: res.data._id,
        sender: 'bot',
        text: res.data.response,
        videoLink: res.data.videoLink,
        clarification: res.data.clarification,
        responseType: res.data.type,
        error: res.data.error,
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
      };
      // Replace user message with tempId with one containing backend _id
      setMessages(prev => prev.map(msg => 
        msg.tempId === userMsg.tempId 
          ? { ...msg, _id: res.data.userMessageId || msg.tempId, tempId: undefined }
          : msg
      ).concat([botMessage]));
      if (saveHistory) await fetchHistory();
    } catch (err) {
      console.error('Chatbot error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Failed to get response', { duration: 4000 });
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Failed to get response. Please try again.', error: true, timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) }
      ]);
    }
  };

  const editMessage = (index, text) => {
    console.log('Editing message at index:', index, 'with text:', text);
    setInput(text);
    setEditingIndex(index);
  };

  const deleteMessage = async (index) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('No JWT token found');
      toast.error('Please log in to delete messages', { duration: 4000 });
      return;
    }

    const message = messages[index];
    const messageId = message?._id;
    if (!messageId || messageId === message.tempId) {
      console.error('No valid message ID for index:', index, 'Message:', message);
      toast.error('Cannot delete message: Message not yet saved to server', { duration: 4000 });
      // Remove locally if not yet saved to backend
      setMessages(prev => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      console.log('Attempting to delete message with ID:', messageId);
      await axios.delete(`${API_BASE_URL}/api/chatbot/history/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.filter((_, i) => i !== index));
      toast.success('Message deleted successfully', { duration: 4000 });
      await fetchHistory();
    } catch (err) {
      console.error('Error deleting message:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error(`Failed to delete message: ${err.response?.data?.error || err.message}`, { duration: 4000 });
    }
  };

  const clearHistory = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('No JWT token found');
      toast.error('Please log in to clear history', { duration: 4000 });
      return;
    }

    try {
      console.log('Clearing chat history');
      await axios.delete(`${API_BASE_URL}/api/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setChatHistory([]);
      setCurrentChatId(null);
      setCurrentChatTitle('');
      setShowHistoryModal(false);
      toast.success('Chat history cleared', { duration: 4000 });
      startNewChat();
    } catch (err) {
      console.error('Error clearing history:', err.response?.data || err.message);
      toast.error('Failed to clear chat history', { duration: 4000 });
    }
  };

  const deleteChat = async (chatId) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('No JWT token found');
      toast.error('Please log in to delete chats', { duration: 4000 });
      return;
    }

    try {
      console.log('Deleting chat with ID:', chatId);
      await axios.delete(`${API_BASE_URL}/api/chatbot/history/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatHistory(prev => prev.filter(chat => chat.chatId !== chatId));
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
        setCurrentChatTitle('');
        startNewChat();
      }
      toast.success('Chat deleted', { duration: 4000 });
      await fetchHistory();
    } catch (err) {
      console.error('Error deleting chat:', err.response?.data || err.message);
      toast.error('Failed to delete chat', { duration: 4000 });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('Current state:', { messages, currentChatId, currentChatTitle, chatHistory });
  }, [messages, currentChatId, currentChatTitle, chatHistory]);

  return (
    <ErrorBoundary>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] p-4">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl rounded-3xl shadow-2xl backdrop-blur-lg bg-[#1E1B4B]/30 border border-[#2DD4BF]/20 flex flex-col h-[80vh]"
        >
          {/* Header */}
          <div className="p-5 flex items-center gap-3 bg-[#1E1B4B]/50 rounded-t-3xl border-b border-[#2DD4BF]/30">
            <BsRobot className="text-3xl text-[#A855F7]" />
            <h2 className="text-2xl font-['Dancing_Script'] text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] tracking-wide flex-1">
              {currentChatTitle || 'StudyBuddy Chat'}
            </h2>
            <motion.button
              onClick={() => setShowHistoryModal(true)}
              className="bg-[#2DD4BF] hover:bg-[#10B981] transition-colors p-2 rounded-full shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(45, 212, 191, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              title="View Chat History"
            >
              <FaHistory className="text-white text-sm" />
            </motion.button>
            <motion.button
              onClick={startNewChat}
              className="bg-[#A855F7] hover:bg-[#9333EA] transition-colors p-2 rounded-full shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              title="Create New Chat"
            >
              <FaPlus className="text-white text-sm" />
            </motion.button>
            <motion.button
              onClick={clearHistory}
              className="bg-[#EC4899] hover:bg-[#F87171] transition-colors p-2 rounded-full shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(236, 72, 153, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              title="Clear Chat History"
            >
              <FaTrash className="text-white text-sm" />
            </motion.button>
            <label className="flex items-center gap-2 text-[#E5E7EB] text-sm">
              <input
                type="checkbox"
                checked={saveHistory}
                onChange={() => setSaveHistory(!saveHistory)}
                className="accent-[#2DD4BF]"
              />
              Save History
            </label>
          </div>

          {/* Title Prompt Modal */}
          {showTitlePrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0F172A]/80 flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-[#1E1B4B] p-6 rounded-2xl border border-[#2DD4BF]/30"
              >
                <h3 className="text-lg text-[#E5E7EB] mb-4">Enter Chat Title</h3>
                <form onSubmit={handleTitleSubmit}>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    placeholder="e.g., Math Study Session"
                    className="w-full px-4 py-2 rounded-full bg-[#0F172A]/90 text-[#E5E7EB] placeholder-[#E5E7EB]/70 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] text-sm mb-4"
                  />
                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      className="bg-[#EC4899] hover:bg-[#F87171] transition-colors px-4 py-2 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Chat
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowTitlePrompt(false)}
                      className="bg-[#6B7280] hover:bg-[#4B5563] transition-colors px-4 py-2 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* History Modal */}
          {showHistoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0F172A]/80 flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-[#1E1B4B] p-6 rounded-2xl border border-[#2DD4BF]/30 w-full max-w-md max-h-[60vh] overflow-y-auto"
              >
                <h3 className="text-lg text-[#E5E7EB] mb-4">Chat History</h3>
                {chatHistory.length === 0 ? (
                  <p className="text-[#E5E7EB]/70 text-sm">No chats found.</p>
                ) : (
                  <ul className="space-y-2">
                    {chatHistory.map(chat => (
                      <li key={chat.chatId} className="flex items-center gap-2">
                        <motion.button
                          onClick={() => fetchChatMessages(chat.chatId)}
                          className="flex-1 text-left px-4 py-2 bg-[#0F172A]/90 text-[#E5E7EB] rounded-lg hover:bg-[#2DD4BF]/20 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="font-medium">{chat.title}</span>
                          <p className="text-[#E5E7EB]/70 text-xs">
                            {new Date(chat.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
                          </p>
                        </motion.button>
                        <motion.button
                          onClick={() => deleteChat(chat.chatId)}
                          className="bg-[#EF4444] hover:bg-[#DC2626] transition-colors p-2 rounded-full shadow-lg"
                          whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)' }}
                          whileTap={{ scale: 0.95 }}
                          title="Delete Chat"
                        >
                          <FaTrash className="text-white text-sm" />
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                )}
                <motion.button
                  onClick={() => setShowHistoryModal(false)}
                  className="mt-4 bg-[#6B7280] hover:bg-[#4B5563] transition-colors px-4 py-2 rounded-full w-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#E5E7EB] text-center text-sm"
              >
                {currentChatTitle ? 'Start your conversation!' : 'Create a new chat to begin.'}
              </motion.div>
            )}
            {messages.map((msg, index) => (
              <motion.div
                key={msg._id || msg.tempId || index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} relative group`}
              >
                {msg.sender === 'bot' && (
                  <div className="bg-[#A855F7]/30 p-2 rounded-full">
                    <BsRobot className="text-lg text-[#A855F7]" />
                  </div>
                )}
                <div
                  className={`max-w-xs p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] text-[#E5E7EB]'
                      : msg.error
                      ? 'bg-[#EF4444]/20 text-[#EF4444]'
                      : 'bg-[#1E1B4B]/60 text-[#E5E7EB]'
                  }`}
                >
                  {msg.text}
                  {msg.videoLink && (
                    <a
                      href={msg.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2DD4BF] hover:underline text-sm mt-2 block"
                    >
                      {msg.videoLink.includes('youtube.com') ? 'Watch Video' : msg.videoLink}
                    </a>
                  )}
                  {msg.clarification && (
                    <p className="text-[#10B981] text-sm mt-2 font-medium">{msg.clarification}</p>
                  )}
                  <p className="text-[#E5E7EB]/70 text-xs mt-1">{msg.timestamp}</p>
                </div>
                <div className="absolute right-0 top-0 -mt-2 -mr-2 flex gap-1">
                  {msg.sender === 'user' && (
                    <motion.button
                      onClick={() => editMessage(index, msg.text)}
                      className="bg-[#2DD4BF]/50 text-[#E5E7EB] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit Message"
                    >
                      <FaEdit className="text-sm" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => deleteMessage(index)}
                    className="bg-[#EF4444]/50 text-[#E5E7EB] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete Message"
                  >
                    <FaTrash className="text-sm" />
                  </motion.button>
                </div>
                {msg.sender === 'user' && (
                  <div className="bg-[#2DD4BF]/30 p-2 rounded-full">
                    <AiOutlineUser className="text-lg text-[#2DD4BF]" />
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-[#1E1B4B]/50 border-t border-[#2DD4BF]/30 rounded-b-3xl flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-3 rounded-full bg-[#0F172A]/90 text-[#E5E7EB] placeholder-[#E5E7EB]/70 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] text-sm"
            />
            <motion.button
              onClick={sendMessage}
              className="bg-[#EC4899] hover:bg-[#F87171] transition-colors p-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(236, 72, 153, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPaperPlane className="text-white text-sm" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default Chatbot;