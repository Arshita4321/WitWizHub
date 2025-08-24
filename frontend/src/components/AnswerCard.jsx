// C:\Users\arshi\WitWizHub\frontend\src\components\AnswerCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const AnswerCard = ({ option, isSelected, onSelect, disabled }) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`p-4 rounded-lg border border-[#1E1B4B]/20 text-[#1E1B4B] cursor-pointer
        ${isSelected ? 'bg-[#2DD4BF] text-[#1E1B4B] font-bold' : 'bg-[#E5E7EB]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? null : () => onSelect(option)}
    >
      {option} {isSelected ? '✅' : ''}
    </motion.div>
  );
};

export default AnswerCard;