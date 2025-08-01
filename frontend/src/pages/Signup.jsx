import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleError, handleSuccess } from "../utils";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { TextField, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      handleError('Please fill all the fields');
      setError('Please fill all the fields');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupInfo),
      });
  
      const data = await response.json();
      const { success, message, error } = data;
  
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else if (error) {
        const details = error?.details?.[0]?.message || 'Something went wrong';
        handleError(details);
        setError(details);
      } else {
        handleError(message || 'Signup failed');
        setError(message || 'Signup failed');
      }
  
      if (!response.ok) {
        throw new Error(data.message || 'Signup Failed');
      }
    } catch (err) {
      handleError(err.message || 'Something went wrong');
      setError(err.message || 'Something went wrong');
    }
  };
  
  return (
    <>
      <section className="min-h-screen bg-gradient-dark flex items-center justify-center py-12 px-4">
        <motion.div
          className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border border-gradient-accent relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-4xl font-bold text-teal-400 mb-6 text-center tracking-tight"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join WitWizHub
          </motion.h1>

          {error && (
            <motion.p
              className="text-pink-500 mb-6 text-center font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                type="text"
                value={signupInfo.name}
                onChange={handleChange}
                variant="outlined"
                required
                InputLabelProps={{ style: { color: '#E5E7EB' } }}
                InputProps={{
                  style: {
                    color: '#E5E7EB',
                    backgroundColor: '#1E1B4B',
                    borderRadius: '8px',
                  },
                }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={signupInfo.email}
                onChange={handleChange}
                variant="outlined"
                required
                InputLabelProps={{ style: { color: '#E5E7EB' } }}
                InputProps={{
                  style: {
                    color: '#E5E7EB',
                    backgroundColor: '#1E1B4B',
                    borderRadius: '8px',
                  },
                }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={signupInfo.password}
                onChange={handleChange}
                variant="outlined"
                required
                InputLabelProps={{ style: { color: '#E5E7EB' } }}
                InputProps={{
                  style: {
                    color: '#E5E7EB',
                    backgroundColor: '#1E1B4B',
                    borderRadius: '8px',
                  },
                }}
              />
              <i
                className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#E5E7EB',
                  fontSize: '1.2rem'
                }}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  marginBottom: '12px',
                  '&:hover': {
                    background: 'linear-gradient(to right, #14B8A6, #9333EA)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <span className="text-white">Sign Up</span>
              </Button>
            </motion.div>
          </form>

          <motion.p
            className="mt-6 text-center text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Already have an account?{' '}
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-teal-400 hover:text-pink-500 font-medium transition-colors relative z-10 ${isActive ? 'text-pink-500' : ''}`
              }
            >
              Login
            </NavLink>
          </motion.p>
        </motion.div>
      </section>
      <ToastContainer />
    </>
  );
}

export default Signup;