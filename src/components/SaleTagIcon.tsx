


interface SaleTagIconProps {
  className?: string;
}

export const SaleTagIcon = ({ className = "h-6 w-6" }: SaleTagIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hand/Palm */}
      <path
        d="M8 13V8C8 7.45 8.45 7 9 7C9.55 7 10 7.45 10 8V12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 12V7C10 6.45 10.45 6 11 6C11.55 6 12 6.45 12 7V12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 12V8C12 7.45 12.45 7 13 7C13.55 7 14 7.45 14 8V12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14 12V9C14 8.45 14.45 8 15 8C15.55 8 16 8.45 16 9V13C16 13.55 15.55 14 15 14H9C8.45 14 8 14.45 8 15V16C8 16.55 8.45 17 9 17H15"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Dollar sign circle */}
      <circle
        cx="18"
        cy="6"
        r="4"
        fill="white"
        stroke="white"
        strokeWidth="1"
      />
      
      {/* Dollar sign */}
      <path
        d="M18 4V8M16.5 5.5C16.5 4.67 17.17 4 18 4C18.83 4 19.5 4.67 19.5 5.5C19.5 6.33 18.83 7 18 7C17.17 7 16.5 6.33 16.5 5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 6C18.83 6 19.5 6.67 19.5 7.5C19.5 8.33 18.83 9 18 9C17.17 9 16.5 8.33 16.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
