import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

// Button styles consistent with Notes.jsx
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
    '&:hover': {
      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
      transform: 'translateY(-3px) scale(1.05)',
      boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
    },
    transition: 'all 0.3s ease',
  },
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwtToken'));
  const [tokenExpired, setTokenExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          setTokenExpired(true);
          setIsAuthenticated(false);
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('name');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token decoding failed:', error);
        setIsAuthenticated(false);
        setTokenExpired(true);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
      }
    };

    // Initial check
    checkToken();

    // Periodic check every 30 seconds
    const interval = setInterval(checkToken, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setIsAuthenticated(false);
    setTokenExpired(false);
    navigate('/login', { state: { from: location } });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
      <Dialog
        open={tokenExpired}
        onClose={() => {}}
        PaperProps={{
          style: {
            background: 'linear-gradient(135deg, rgba(255,107,107,0.3), rgba(255,154,158,0.2))',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 25px 50px rgba(255,0,0,0.3)',
          },
        }}
      >
        <DialogTitle className="text-white font-serif text-2xl text-center p-8">
          ⚠️ Session Expired ⚠️
        </DialogTitle>
        <DialogContent className="p-8 text-center">
          <p className="text-white text-lg font-light">
            Your session has expired. Please log in again to continue.
          </p>
        </DialogContent>
        <DialogActions className="p-8 gap-4 justify-center">
          <Button
            onClick={handleLogout}
            sx={buttonStyles.dreamy}
          >
            Log In Again
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
};

export default AuthProvider;