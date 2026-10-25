import React from 'react';
import type { AppTheme } from '../types/search';

interface ArgonLogoProps {
  size?: number;
  className?: string;
  theme?: AppTheme;
}

/**
 * Custom Argon Search emblem matching the user sketch:
 * - Circular boundary
 * - Tilted orbital elliptical ring
 * - Central noble gas "Ar" mark
 * - Responsive to Dark (Obsidian) and White (Ceramic) themes
 */
export const ArgonLogo: React.FC<ArgonLogoProps> = ({ size = 28, className = '', theme }) => {
  const forceLightClass = theme === 'light' ? 'argon-logo-force-light' : '';
  const forceDarkClass = theme === 'dark' ? 'argon-logo-force-dark' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 argon-logo ${forceLightClass} ${forceDarkClass} ${className}`}
      aria-label="Argon Search Logo"
    >
      {/* Outer subtle circle */}
      <circle
        cx="50"
        cy="50"
        r="44"
        className="argon-logo-outer transition-colors duration-200"
        strokeWidth="2.5"
      />

      {/* Secondary concentric inner dashed glow */}
      <circle
        cx="50"
        cy="50"
        r="39"
        className="argon-logo-dash transition-colors duration-200"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />

      {/* Diagonal orbital ellipse from user sketch */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="18"
        transform="rotate(-28 50 50)"
        className="argon-logo-orbit transition-colors duration-200"
        strokeWidth="2.4"
      />

      {/* Orbital electron particle node with glow */}
      <circle
        cx="14"
        cy="31"
        r="3.5"
        className="argon-logo-node transition-colors duration-200"
      />

      {/* Center noble gas symbol "Ar" */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        className="argon-logo-text transition-colors duration-200"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.5"
      >
        Ar
      </text>
    </svg>
  );
};
