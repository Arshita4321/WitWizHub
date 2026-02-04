// src/components/Reminders.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import { API_BASE_URL } from "../config/api.js";

const Reminders = () => {
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Your stored JWT
        const response = await axios.get(`${API_BASE_URL}/api/study-planner/reminders/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const reminders = response.data.upcomingTopics;
        if (reminders.length) {
          reminders.forEach(r => {
            toast(
              ` ${r.subjectName} - ${r.topicName} due on ${new Date(r.deadline).toLocaleDateString()}`,
              {
                duration: 8000,
                position: 'top-right',
                style: { background: '#FBBF24', color: '#000', fontWeight: 'bold' },
              }
            );
          });
        }
      } catch (err) {
        console.error('Failed to fetch reminders', err);
      }
    };

    fetchReminders();
  }, []);

  return <Toaster />;
};

export default Reminders;