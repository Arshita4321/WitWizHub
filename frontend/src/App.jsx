import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './components/ResetPassword';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';

// Protected Pages
import Home from './pages/Home';
import Forum from './pages/Forum';
import Notes from './pages/Notes';
import StudyPlanner from './pages/StudyPlanner';
import PremiumPage from './pages/PremiumPage';
import Quiz from './pages/Quiz';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import RelayGame from './pages/RelayGame';

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Toaster position="top-right" />

        <Routes>
          {/* 🔓 Public Routes (No Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* 🔓 Layout Routes */}
          <Route element={<Layout />}>
            
            {/* Public pages inside Layout */}
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
            
            {/* Home is now PUBLIC (No ProtectedRoute) */}
            <Route path="/home" element={<Home />} />

            {/* Protected Routes */}
            <Route path="/premium" element={<ProtectedRoute><PremiumPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/game" element={<ProtectedRoute><RelayGame /></ProtectedRoute>} />

          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />

        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;