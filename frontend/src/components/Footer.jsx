import React from 'react';
import { NavLink } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { motion } from 'framer-motion';
import InstagramIcon from '@mui/icons-material/Instagram';
import SchoolIcon from '@mui/icons-material/School';

function Footer() {
  return (
    <motion.footer
      className="bg-gradient-dark text-gray-100 py-8 mt-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <NavLink to="/" className="flex items-center">
            <span className="flex items-center text-teal-400 text-xl">
              <SchoolIcon />
              <h3 className="text-xl font-bold text-teal-400 mb-4">WitWizHub</h3>
            </span>
          </NavLink>
          <p className="text-gray-200">Your ultimate platform for smart learning and collaboration.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-teal-400 mb-4 text-left">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `transition-colors duration-300 text-gray-100 hover:text-pink-500 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `transition-colors duration-300 text-gray-100 hover:text-pink-500 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                Contact Us
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/faq"
                className={({ isActive }) =>
                  `transition-colors duration-300 text-gray-100 hover:text-pink-500 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                FAQ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/premium"
                className={({ isActive }) =>
                  `transition-colors duration-300 text-gray-100 hover:text-pink-500 ${isActive ? 'text-pink-500' : ''}`
                }
              >
                Premium
              </NavLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold text-teal-400 mb-4 text-left">Connect With Us</h3>
          <div className="flex space-x-4">
            <motion.a
              href="mailto:support@witwizhub.com"
              className="social-icon text-gray-100 hover:text-pink-500 transition-colors duration-300"
              whileHover={{ scale: 1.2 }}
            >
              <EmailIcon />
            </motion.a>
            <motion.a
              href="https://facebook.com/witwizhub"
              className="social-icon text-gray-100 hover:text-pink-500 transition-colors duration-300"
              whileHover={{ scale: 1.2 }}
            >
              <FacebookIcon />
            </motion.a>
            <motion.a
              href="https://twitter.com/witwizhub"
              className="social-icon text-gray-100 hover:text-pink-500 transition-colors duration-300"
              whileHover={{ scale: 1.2 }}
            >
              <TwitterIcon />
            </motion.a>
            <motion.a
              href="https://instagram.com/witwizhub"
              className="social-icon text-gray-100 hover:text-pink-500 transition-colors duration-300"
              whileHover={{ scale: 1.2 }}
            >
              <InstagramIcon />
            </motion.a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-200">
        © {new Date().getFullYear()} WitWizHub. All rights reserved.
      </div>
    </motion.footer>
  );
}

export default Footer;