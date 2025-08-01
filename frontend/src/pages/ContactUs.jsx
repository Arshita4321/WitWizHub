import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TextField, Button } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Replace with API call, e.g., fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-12 bg-gradient-dark text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          className="text-4xl font-bold text-teal-400 mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Get in Touch with WitWizHub
        </motion.h1>
        <motion.p
          className="text-2xl tagline-cursive mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Drop us a note, and let’s spark your learning journey!
        </motion.p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderColor: '#4B5563' },
                  }}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderColor: '#4B5563' },
                  }}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderColor: '#4B5563' },
                  }}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={4}
                  InputLabelProps={{ style: { color: '#E5E7EB' } }}
                  InputProps={{
                    style: { color: '#E5E7EB', backgroundColor: '#1E1B4B', borderColor: '#4B5563' },
                  }}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                    '&:hover': { background: 'linear-gradient(to right, #14B8A6, #9333EA)' },
                  }}
                  className="w-full"
                >
                  <span className="text-white-800 font-semibold">Send Message</span>
                </Button>
              </motion.div>
            </form>
          </motion.div>
          {/* Contact Details and Social Links */}
          <motion.div
            className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">Contact Details</h2>
            <motion.div
              className="space-y-4 text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p>
                <strong>Email:</strong> support@witwizhub.com
              </p>
              <p>
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p>
                <strong>Address:</strong> 123 Learning Lane, Knowledge City, 12345
              </p>
            </motion.div>
            <motion.h3
              className="text-xl font-semibold text-purple-400 mt-6 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Follow Us
            </motion.h3>
            <motion.div
              className="flex space-x-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.a
                href="https://x.com/witwizhub"
                aria-label="Follow WitWizHub on Twitter"
                className="text-teal-400 social-icon"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <TwitterIcon fontSize="large" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/company/witwizhub"
                aria-label="Follow WitWizHub on LinkedIn"
                className="text-teal-400 social-icon"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <LinkedInIcon fontSize="large" />
              </motion.a>
              <motion.a
                href="https://instagram.com/witwizhub"
                aria-label="Follow WitWizHub on Instagram"
                className="text-teal-400 social-icon"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <InstagramIcon fontSize="large" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;