import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forum from './pages/Forum';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import Notes from './pages/Notes';
import StudyPlanner from './pages/StudyPlanner';
import PremiumPage from './pages/PremiumPage';
import Quiz from './pages/Quiz';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import RelayGame from './pages/RelayGame';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/study-planner" element={<StudyPlanner />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/game" element={<RelayGame />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
};

export default App;