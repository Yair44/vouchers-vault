
export const ColorBlindFilters = () => {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0 }}
      aria-hidden="true"
    >
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix values="0.567 0.433 0     0 0
                                0.558 0.442 0     0 0
                                0     0.242 0.758 0 0
                                0     0     0     1 0"/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix values="0.625 0.375 0   0 0
                                0.7   0.3   0   0 0
                                0     0.3   0.7 0 0
                                0     0     0   1 0"/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix values="0.95 0.05  0     0 0
                                0    0.433 0.567 0 0
                                0    0.475 0.525 0 0
                                0    0     0     1 0"/>
        </filter>
      </defs>
    </svg>
  );
};
