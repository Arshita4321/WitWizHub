import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NoteIcon from '@mui/icons-material/Note';
import ForumIcon from '@mui/icons-material/Forum';
import QuizIcon from '@mui/icons-material/Quiz';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'framer-motion';
import { handleError } from '../utils';

function Vheader({ isOpen, toggleVerticalHeader }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwtToken'));
  const navRef = useRef(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('jwtToken'));
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        toggleVerticalHeader();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleVerticalHeader]);

  const handleLogout = () => {
    console.log('Vheader: Logging out, clearing localStorage');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    toggleVerticalHeader();
    navigate('/login');
  };

  return (
    <div className="vheader">
      <motion.nav
        ref={navRef}
        className={`w-64 bg-gradient-dark text-gray-100 h-screen p-4 fixed top-0 left-0 z-50 shadow-lg ${
          isOpen ? 'block' : 'hidden'
        } md:block`}
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <div className="nav-container flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-teal-400">WitWizHub</h1>
          <motion.button
            onClick={toggleVerticalHeader}
            className="text-gray-100 hover:text-pink-500 p-2 rounded-full hover:bg-gray-900 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </motion.button>
        </div>
        <ul className="space-y-2">
          {[
            { path: '/profile', icon: <PersonIcon className="mr-2" />, label: 'My Profile' },
            { path: '/home', icon: <InfoIcon className="mr-2" />, label: 'About' },
            { path: '/study-planner', icon: <CalendarTodayIcon className="mr-2" />, label: 'Study Planner' },
            { path: '/notes', icon: <NoteIcon className="mr-2" />, label: 'My Notes' },
            { path: '/forum', icon: <ForumIcon className="mr-2" />, label: 'Conversation Forum' },
            { path: '/quiz', icon: <QuizIcon className="mr-2" />, label: 'Quiz' },
            { path: '/contact', icon: <ContactMailIcon className="mr-2" />, label: 'Contact Us' },
            ...(isAuthenticated
              ? [
                  {
                    path: '#',
                    icon: <LogoutIcon className="mr-2" />,
                    label: 'Logout',
                    onClick: handleLogout,
                  },
                ]
              : [
                  { path: '/login', icon: <LoginIcon className="mr-2" />, label: 'Login' },
                  { path: '/signup', icon: <LoginIcon className="mr-2" />, label: 'Signup' },
                ]),
          ].map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center py-2 px-4 rounded-lg hover:bg-gradient-accent hover:text-pink-500 transition-all duration-300 transform hover:scale-105 w-full text-left text-gray-100"
                  aria-label={item.label}
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link flex items-center py-2 px-4 rounded-lg hover:bg-gradient-accent hover:text-pink-500 transition-all duration-300 transform hover:scale-105 ${
                      isActive ? 'bg-gradient-accent text-pink-500' : 'text-gray-100'
                    }`
                  }
                  onClick={toggleVerticalHeader}
                  aria-label={item.label}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              )}
            </motion.li>
          ))}
        </ul>
      </motion.nav>
    </div>
  );
}

export default Vheader;