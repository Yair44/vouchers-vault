
import React from 'react';

interface SaleTagIconProps {
  className?: string;
}

export const SaleTagIcon = ({ className = "h-4 w-4" }: SaleTagIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tag shape */}
      <path
        d="M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L12 7.83 5.77 1.59c-.78-.78-2.05-.78-2.83 0L1.59 2.94c-.78.78-.78 2.05 0 2.83L7.83 12l-6.24 6.23c-.78.78-.78 2.05 0 2.83l1.35 1.35c.78.78 2.05.78 2.83 0L12 16.17l6.23 6.24c.78.78 2.05.78 2.83 0l1.35-1.35c.78-.78.78-2.05 0-2.83L16.17 12l6.24-6.23c.78-.78.78-2.05 0-2.83z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Tag body - rounded rectangle */}
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="2"
        fill="currentColor"
        fillOpacity="0.9"
      />
      {/* Tag hole */}
      <circle
        cx="18"
        cy="6"
        r="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* SALE text */}
      <text
        x="12"
        y="13"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="6"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        SALE
      </text>
    </svg>
  );
};
