// C:\Users\arshi\WitWizHub\frontend\src\components\Watermark.jsx
import React from 'react';

const Watermark = () => {
  const emojis = ["🎮", "🕹️", "👾", "🧩", "🎲", "🃏", "♟️", "🏆", "⚔️", "🛡️", "🏹", "🔮", "🚀"];

  const rows = 6; // number of rows
  const cols = 6; // number of columns

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden grid" 
         style={{gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: `repeat(${cols}, 1fr)`}}>
      {Array.from({ length: rows * cols }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-center text-5xl opacity-20 text-gray-400 select-none"
          style={{ filter: "blur(0.3px)" }}
        >
          {emojis[index % emojis.length]}
        </div>
      ))}
    </div>
  );
};

export default Watermark;
