// Shared Design Tokens for WitWizHub
// Used across GameRoom, Forum, and Notes pages for consistency

export const DESIGN_TOKENS = {
  // Colors
  colors: {
    bg: '#0f172a',           // Main background - dark slate
    surface: '#1e293b',      // Card/surface background
    card: '#162032',         // Card background
    border: '#334155',       // Border color
    borderHi: '#475569',     // Border highlight
    text: '#f1f5f9',         // Primary text
    textMuted: '#94a3b8',    // Muted text
    textDim: '#64748b',      // Dim text
    accent: '#6366f1',       // Primary accent - indigo
    accentLt: '#a5b4fc',     // Light accent
    accentBg: 'rgba(99,102,241,0.1)', // Accent background
    success: '#10b981',      // Success - emerald
    successLt: '#6ee7b7',    // Light success
    warning: '#f59e0b',      // Warning - amber
    danger: '#ef4444',       // Danger - red
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: '"Inter", "Segoe UI", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.65,
    },
  },
  
  // Spacing (8px grid system)
  spacing: {
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.15)',
    lg: '0 10px 15px rgba(0,0,0,0.2)',
    xl: '0 20px 25px rgba(0,0,0,0.25)',
    '2xl': '0 25px 50px rgba(0,0,0,0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
};

// Helper function to get color value
export const getColor = (path) => {
  const keys = path.split('.');
  let value = DESIGN_TOKENS.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

// Helper function to get typography value
export const getTypography = (path) => {
  const keys = path.split('.');
  let value = DESIGN_TOKENS.typography;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};
