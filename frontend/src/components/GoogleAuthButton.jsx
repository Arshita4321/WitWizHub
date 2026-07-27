import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { API_BASE_URL } from "../config/api.js";

const GoogleAuthButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/study-planner/google`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.href = res.data.url;
    } catch (err) {
      toast.error('Failed to connect Google Calendar');
      console.error(err);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={handleGoogleAuth}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          padding: '0.6rem 1rem',
          background: hovered ? '#263348' : '#1e293b',
          border: `1px solid ${isConnected ? '#10b981' : '#334155'}`,
          borderRadius: '0.5rem',
          color: isConnected ? '#6ee7b7' : '#94a3b8',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
          transition: 'all 0.15s',
        }}
      >
        {/* Calendar icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {isConnected ? 'Google Calendar Connected ✓' : 'Connect Google Calendar'}
      </button>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#475569', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Connect to sync study sessions with Google Calendar
      </p>
    </div>
  );
};

export default GoogleAuthButton;