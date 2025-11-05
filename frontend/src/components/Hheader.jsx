import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import Button from '@mui/material/Button';
import { motion, AnimatePresence } from 'framer-motion';

function Hheader({ toggleVerticalHeader }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    toggleVerticalHeader();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    toggleVerticalHeader();
  };

  // Animation variants
  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    scrolled: { 
      backgroundColor: 'rgba(15, 13, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottomColor: 'rgba(45, 212, 191, 0.3)'
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  const navigationItems = [
    { to: '/premium', icon: StarIcon, label: 'Try Premium', isPremium: true },
    { to: '/faq', icon: HelpOutlineIcon, label: 'FAQ' },
    { to: '/profile', icon: PersonIcon, label: 'Profile' }
  ];

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gradient-to-r from-[#0F0D2A]/95 via-[#1E1B4B]/95 to-[#0F172A]/95 backdrop-blur-xl shadow-2xl border-b border-[#2DD4BF]/30' 
          : 'bg-gradient-to-r from-[#1E1B4B] via-[#2C2A66] to-[#1E1B4B] shadow-lg border-b border-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={toggleMobileMenu}
              className="text-gray-100 hover:text-[#2DD4BF] p-1.5 sm:p-2 rounded-full hover:bg-gray-900/50 transition-all duration-300 lg:hidden"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CloseIcon className="text-lg sm:text-xl" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuIcon className="text-lg sm:text-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Desktop Menu Toggle (for sidebar) */}
            <motion.button
              onClick={toggleVerticalHeader}
              className="hidden lg:block text-gray-100 hover:text-[#2DD4BF] p-2 rounded-full hover:bg-gray-900/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MenuIcon />
            </motion.button>

            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-1.5 sm:space-x-2">
              {({ isActive }) => (
                <>
                  <motion.div
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      isActive ? 'text-[#2DD4BF]' : 'text-gray-100'
                    } rounded-lg flex items-center justify-center bg-gradient-to-br from-[#2DD4BF]/20 to-[#A855F7]/20`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SchoolIcon className="text-base sm:text-lg" />
                  </motion.div>
                  <motion.span
                    className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${
                      isActive 
                        ? 'from-[#2DD4BF] to-[#A855F7]' 
                        : 'from-gray-100 to-gray-300'
                    } bg-clip-text text-transparent hover:from-[#2DD4BF] hover:to-[#A855F7] transition-all duration-300`}
                    whileHover={{ scale: 1.02 }}
                  >
                    WitWizHub
                  </motion.span>
                </>
              )}
            </NavLink>
          </div>

          {/* Right Section - Navigation */}
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center space-x-2 transition-all duration-300 ${
                      isActive ? 'text-[#2DD4BF]' : 'text-gray-100 hover:text-[#2DD4BF]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.isPremium ? (
                        <Button
                          variant="outlined"
                          startIcon={<item.icon className="text-sm" />}
                          sx={{
                            color: isActive ? '#2DD4BF' : '#E5E7EB',
                            borderColor: isActive ? '#2DD4BF' : '#64748B',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            padding: '8px 16px',
                            background: isActive 
                              ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
                              : 'transparent',
                            '&:hover': { 
                              borderColor: '#2DD4BF',
                              color: '#2DD4BF',
                              background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                              boxShadow: '0 4px 15px rgba(45, 212, 191, 0.2)'
                            },
                          }}
                          size="small"
                        >
                          {item.label}
                        </Button>
                      ) : (
                        <>
                          <item.icon className="text-lg" />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <motion.div
                              className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] rounded-full"
                              layoutId="activeIndicator"
                            />
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Mobile/Tablet Navigation (md breakpoint) */}
            <div className="flex lg:hidden items-center space-x-3">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `p-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'text-[#2DD4BF] bg-[#2DD4BF]/10' 
                      : 'text-gray-100 hover:text-[#2DD4BF] hover:bg-gray-900/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PersonIcon className="text-lg sm:text-xl" />
                  </motion.div>
                )}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="lg:hidden overflow-hidden"
            >
              <motion.div 
                className="bg-gradient-to-r from-[#2C2A66]/90 to-[#1E1B4B]/90 backdrop-blur-xl rounded-2xl mx-2 sm:mx-4 mb-4 p-4 sm:p-6 border border-[#2DD4BF]/20"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex flex-col space-y-4">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      custom={index}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <NavLink
                        to={item.to}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `group flex items-center space-x-3 p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-[#2DD4BF]/20 to-[#A855F7]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                              : 'text-gray-100 hover:bg-[#2C2A66]/50 hover:text-[#2DD4BF] border border-transparent hover:border-[#2DD4BF]/20'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <motion.div
                            className="flex items-center space-x-3 w-full"
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={`p-2 rounded-lg ${
                              isActive 
                                ? 'bg-[#2DD4BF]/20' 
                                : 'bg-gray-700/50 group-hover:bg-[#2DD4BF]/20'
                            }`}>
                              <item.icon className="text-lg" />
                            </div>
                            <span className="font-medium text-base sm:text-lg flex-1">
                              {item.label}
                            </span>
                            {item.isPremium && (
                              <motion.div
                                className="px-2 py-1 bg-gradient-to-r from-[#2DD4BF] to-[#A855F7] text-[#0F0D2A] text-xs font-bold rounded-full"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                NEW
                              </motion.div>
                            )}
                            {isActive && (
                              <motion.div
                                className="w-2 h-2 bg-[#2DD4BF] rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                          </motion.div>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Hheader;