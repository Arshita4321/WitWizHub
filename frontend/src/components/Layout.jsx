import React, { useEffect, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Hheader from './Hheader';
import Vheader from './Vheader';
import Footer from './Footer';
import ChatbotIcon from './ChatbotIcon';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const [isVerticalHeaderOpen, setIsVerticalHeaderOpen] = useState(false);
  const location = useLocation();

  const toggleVerticalHeader = () => setIsVerticalHeaderOpen(!isVerticalHeaderOpen);

  useEffect(() => {
    console.log('Layout rendered, pathname:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-dark">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Hheader toggleVerticalHeader={toggleVerticalHeader} />
      <Vheader isOpen={isVerticalHeaderOpen} toggleVerticalHeader={toggleVerticalHeader} />
      
      <div className="flex-grow p-8">
        {/* 🔹 This is where child routes will be displayed */}
        <Outlet />
      </div>
      
      <Footer />
      <ChatbotIcon />
    </div>
  );
};

export default Layout;
