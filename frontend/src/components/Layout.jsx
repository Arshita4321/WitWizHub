import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Hheader from './Hheader';
import Vheader from './Vheader';
import Footer from './Footer';
import ChatbotIcon from './ChatbotIcon';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const [isVerticalHeaderOpen, setIsVerticalHeaderOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const toggleVerticalHeader = () => {
    setIsVerticalHeaderOpen(!isVerticalHeaderOpen);
  };

  // Check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('jwtToken');   // ← Must match Login page
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!(token && userId));
  };

  // Run on mount and when route changes
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    
    setIsLoggedIn(false);
    setIsVerticalHeaderOpen(false);
    
    // Force redirect to login
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Hheader 
        toggleVerticalHeader={toggleVerticalHeader}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <Vheader 
        isOpen={isVerticalHeaderOpen} 
        toggleVerticalHeader={toggleVerticalHeader} 
      />
      
      <div className="flex-grow p-8">
        <Outlet />
      </div>
      
      <Footer />
      <ChatbotIcon />
    </div>
  );
};

export default Layout;