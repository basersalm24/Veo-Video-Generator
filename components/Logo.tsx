import React from 'react';

/**
 * A component that renders the application's SVG logo.
 * The logo combines a play icon with a sparkle, representing AI-powered video creation.
 */
const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="Application Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/>
          <stop offset="1" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
      <path d="M5 3.483C5 2.113 6.343 1.25 7.525 1.933L19.525 8.933C20.707 9.617 20.707 11.383 19.525 12.067L7.525 19.067C6.343 19.75 5 18.887 5 17.517V3.483Z" fill="url(#logoGradient)"/>
      <path d="M17.5 16.5L18 18L19.5 18.5L18 19L17.5 20.5L17 19L15.5 18.5L17 18L17.5 16.5Z" fill="#facc15"/>
    </svg>
  );
};

export default Logo;
