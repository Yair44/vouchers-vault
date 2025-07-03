
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
      {/* Tag body - main rectangle */}
      <path
        d="M2 6C2 4.89543 2.89543 4 4 4H14L20 10V18C20 19.1046 19.1046 20 18 20H4C2.89543 20 2 19.1046 2 18V6Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Tag corner fold */}
      <path
        d="M14 4V10H20"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Tag hole */}
      <circle
        cx="7"
        cy="9"
        r="1.5"
        fill="white"
      />
      {/* SALE text */}
      <text
        x="12"
        y="15"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="5"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        SALE
      </text>
    </svg>
  );
};
