import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';

function Hheader({ toggleVerticalHeader }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    toggleVerticalHeader();
  };

  return (
    <header className="bg-gradient-dark text-gray-100 shadow-md sticky top-0 z-40 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={toggleMobileMenu}
              className="text-gray-100 hover:text-pink-500 p-2 rounded-full hover:bg-gray-900 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MenuIcon />
            </motion.button>
            <NavLink to="/" className="flex items-center space-x-2">
              {({ isActive }) => (
                <motion.div
                  className={`w-8 h-8 ${isActive ? 'text-teal-400' : 'text-gray-100'} rounded-lg flex items-center justify-center`}
                  whileHover={{ scale: 1.1 }}
                >
                  <SchoolIcon />
                </motion.div>
              )}
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xl font-bold ${isActive ? 'text-teal-400' : 'text-gray-100'} hover:text-teal-400 transition-colors duration-300`
              }
            >
              WitWizHub
            </NavLink>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <NavLink
                to="/premium"
                className={({ isActive }) =>
                  `text-gray-100 hover:text-pink-500 transition-colors duration-300 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                {({ isActive }) => (
                  <Button
                    variant="outlined"
                    sx={{
                      color: isActive ? '#EC4899' : '#E5E7EB', /* pink-500, gray-100 */
                      borderColor: isActive ? '#EC4899' : '#E5E7EB',
                      '&:hover': { borderColor: '#DB2777', color: '#DB2777' }, /* pink-600 */
                    }}
                  >
                    Try Premium
                  </Button>
                )}
              </NavLink>
              <NavLink
                to="/faq"
                className={({ isActive }) =>
                  `text-gray-100 hover:text-pink-500 transition-colors duration-300 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                <HelpOutlineIcon className="mr-1" /> FAQ
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `text-gray-100 hover:text-pink-500 transition-colors duration-300 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                <PersonIcon />
              </NavLink>
            </div>
          </div>
        </div>
        <motion.div
          className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-900 p-4 rounded-lg mt-2`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col space-y-2">
            <NavLink
              to="/premium"
              className={({ isActive }) =>
                `text-gray-100 hover:text-pink-500 transition-colors duration-300 ${isActive ? 'text-pink-500' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {({ isActive }) => (
                <Button
                  variant="outlined"
                  sx={{
                    color: isActive ? '#EC4899' : '#E5E7EB',
                    borderColor: isActive ? '#EC4899' : '#E5E7EB',
                    '&:hover': { borderColor: '#DB2777', color: '#DB2777' },
                  }}
                  size="small"
                >
                  Try Premium
                </Button>
              )}
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `text-gray-100 hover:text-pink-500 transition-colors duration-300 ${isActive ? 'text-pink-500' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HelpOutlineIcon className="mr-1" /> FAQ
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `text-gray-100 hover:text-pink-500 transition-colors duration-300 ${isActive ? 'text-pink-500' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PersonIcon className="mr-1" /> Profile
            </NavLink>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

export default Hheader;