import React from 'react';

interface WaterLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WaterLoader: React.FC<WaterLoaderProps> = ({
  label = 'Loading farm records...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 select-none" role="status" aria-label={label}>
      <div className="relative flex items-center justify-center">
        {/* Living water ripple outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-[#8fe3d9]/30 to-[#a1f4c8]/40 animate-ping opacity-60 absolute inset-0`}
        />
        
        {/* Glass droplet bubble container */}
        <div
          className={`${sizeClasses[size]} rounded-full bg-white/70 backdrop-blur-md border border-white/90 shadow-[0_4px_16px_rgba(17,108,74,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center relative z-10 animate-bounce duration-1000`}
        >
          <span className="material-symbols-outlined text-[#116c4a] text-[22px] drop-shadow-xs">
            water_drop
          </span>
        </div>
      </div>

      {label && (
        <p className="text-xs font-semibold text-[#012d1d]/80 tracking-wide mt-1">
          {label}
        </p>
      )}
    </div>
  );
};

