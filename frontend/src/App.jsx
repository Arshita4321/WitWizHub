import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Hheader from './components/Hheader';
import Vheader from './components/Vheader';
import Footer from './components/Footer';
import Forum from './pages/Forum';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import Notes from './pages/Notes';
import StudyPlanner from './pages/StudyPlanner';
import PremiumPage from './pages/PremiumPage';

const Profile = () => <div>Profile Page</div>;
const Quiz = () => <div>Quiz Page</div>;

function App() {
  const [isVerticalHeaderOpen, setIsVerticalHeaderOpen] = useState(false);

  const toggleVerticalHeader = () => setIsVerticalHeaderOpen(!isVerticalHeaderOpen);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gradient-dark">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Hheader toggleVerticalHeader={toggleVerticalHeader} />
        <Vheader isOpen={isVerticalHeaderOpen} toggleVerticalHeader={toggleVerticalHeader} />
        <div className="flex-grow p-8">
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
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;