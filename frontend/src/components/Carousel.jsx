import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@mui/material/Button';

function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1588750098586-a19aebe90a21?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Master Your Studies',
      description: 'Plan, track, and succeed with WitWizHub’s study tools.',
      cta: 'Get Started',
      link: '/study-planner',
    },
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNU2RKT6UPcAKmhgVwUHCvd7o_pb9XZqMx1A&s',
      title: 'Test Your Knowledge',
      description: 'Engage with interactive quizzes and games.',
      cta: 'Take a Quiz',
      link: '/quiz',
    },
    {
      image: 'https://img.freepik.com/premium-vector/forum-concept-internet-chat-messages-dialog-conversation-social-media-online-networking_501813-850.jpg',
      title: 'Join the Community',
      description: 'Connect, share, and learn with peers in our forum.',
      cta: 'Join Now',
      link: '/forum',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[60vh] overflow-hidden">
      <AnimatePresence>
        {slides.map((slide, index) =>
          index === currentSlide ? (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A] flex flex-col items-center justify-center text-center text-gray-100">
                <motion.h2
                  className="text-4xl font-bold mb-2 text-teal-400"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  className="text-lg mb-4 text-gray-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {slide.description}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                      '&:hover': { background: 'linear-gradient(to right, #14B8A6, #9333EA)' },
                    }}
                    href={slide.link}
                  >
                    {slide.cta}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-teal-400' : 'bg-gray-500'}`}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;