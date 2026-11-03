import React from 'react';

export const StaticHeroFallback: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10" aria-hidden="true">
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#8fe3d9]/35 via-[#a1f4c8]/30 to-transparent blur-[90px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-bl from-[#ffdcc3]/40 via-[#c1ecd4]/25 to-transparent blur-[80px]" />

      {/* Stylized Agricultural Landscape Graphic */}
      <svg
        className="absolute bottom-0 right-0 w-full max-w-2xl h-80 opacity-20 text-[#116c4a]"
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Distant Hills */}
        <path d="M0 340 Q200 280 400 320 T800 300 L800 400 L0 400 Z" fill="currentColor" opacity="0.3" />
        <path d="M0 360 Q300 310 600 350 T800 340 L800 400 L0 400 Z" fill="currentColor" opacity="0.5" />

        {/* Agricultural Furrow Lines */}
        <line x1="350" y1="360" x2="100" y2="400" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="420" y1="360" x2="300" y2="400" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="490" y1="360" x2="500" y2="400" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="560" y1="360" x2="700" y2="400" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />

        {/* Sprout & Sun */}
        <circle cx="680" cy="180" r="48" fill="#ffdcc3" opacity="0.6" />
        <path d="M600 360 C600 330 620 310 640 310 C630 330 630 350 640 360 Z" fill="#15803d" />
        <path d="M640 360 C640 325 660 305 680 305 C670 325 670 345 680 360 Z" fill="#22c55e" />
      </svg>
    </div>
  );
};
