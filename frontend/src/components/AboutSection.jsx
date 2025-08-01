import React from 'react';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';

function AboutSection() {
  return (
    <motion.section
      className="py-12 bg-gradient-dark text-gray-100"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-3xl font-bold text-teal-400 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          About WitWizHub
        </motion.h2>
        <motion.p
          className="text-2xl tagline-cursive mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          The Only Place Where Notes, Quizzes & Games Actually Get Along.
        </motion.p>
        <motion.p
          className="text-lg text-gray-200 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          WitWizHub is your ultimate education platform, designed to make learning fun, interactive, and personalized. Create study plans, take quizzes, collaborate with peers, and get help from our AI-powered chatbot. Join us to spark your learning journey!
        </motion.p>
        <motion.p
          className="text-lg text-gray-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          At WitWizHub, we believe education should be as exciting as a game night and as collaborative as a group project gone right. Our mission is to empower students with tools to organize their studies, test their knowledge, and connect with a vibrant community—all while having a blast!
        </motion.p>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-purple-400 mb-4">Why Choose WitWizHub?</h3>
          <ul className="text-gray-200 space-y-2">
            <li className="flex items-center justify-center">
              <span className="text-teal-400 mr-2">✓</span> Personalized study plans tailored to your goals.
            </li>
            <li className="flex items-center justify-center">
              <span className="text-teal-400 mr-2">✓</span> Interactive quizzes that make learning addictive.
            </li>
            <li className="flex items-center justify-center">
              <span className="text-teal-400 mr-2">✓</span> A community forum to share ideas and memes.
            </li>
            <li className="flex items-center justify-center">
              <span className="text-teal-400 mr-2">✓</span> AI chatbot for instant study tips and dad jokes.
            </li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
              '&:hover': { background: 'linear-gradient(to right, #14B8A6, #9333EA)' },
            }}
            href="/about"
          >
            Discover More
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default AboutSection;