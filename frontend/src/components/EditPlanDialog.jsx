import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const EditPlanDialog = ({ plan, onClose, onSave }) => {
  const [fieldOfStudy, setFieldOfStudy] = useState(plan.fieldOfStudy);

  const handleSubmit = () => {
    onSave(plan, fieldOfStudy);
    onClose();
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <Dialog
        open={true}
        onClose={onClose}
        PaperProps={{
          style: {
            background: 'linear-gradient(to bottom, #1E1B4B, #0F172A)',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1',
            borderRadius: '1rem',
            boxShadow: '8px 8px 16px rgba(30, 27, 75, 0.6), -8px -8px 16px rgba(75, 63, 145, 0.6)',
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            style={{
              fontFamily: "'Dancing Script', cursive",
              background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
            }}
          >
            Edit Study Plan
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Field of Study"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ style: { color: '#9CA3AF' } }}
            InputProps={{
              style: {
                color: '#E5E7EB',
                background: 'rgba(31, 41, 55, 0.5)',
                borderRadius: '0.5rem',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#2DD4BF' },
                '&:hover fieldset': { borderColor: '#A855F7' },
                '&.Mui-focused fieldset': { borderColor: '#A855F7' },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onClose}
              style={{
                color: '#EC4899',
                borderColor: '#EC4899',
                borderRadius: '0.5rem',
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit}
              style={{
                background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                color: '#E5E7EB',
                borderRadius: '0.5rem',
              }}
              variant="contained"
              disabled={!fieldOfStudy}
            >
              Save
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditPlanDialog;