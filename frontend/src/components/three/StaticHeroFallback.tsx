import React from 'react';

export const StaticHeroFallback: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#8fe3d9]/30 via-[#a1f4c8]/25 to-transparent blur-[90px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-bl from-[#ffdcc3]/35 via-[#c1ecd4]/20 to-transparent blur-[80px]" />
    </div>
  );
};

