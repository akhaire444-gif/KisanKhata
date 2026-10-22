import React, { useState } from 'react';

interface KisanKhataLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KisanKhataLogo: React.FC<KisanKhataLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeConfig = {
    sm: { img: 'h-6 w-6', title: 'text-[16px]', subtitle: 'text-[10px]' },
    md: { img: 'h-8 w-8', title: 'text-[19px]', subtitle: 'text-[11px]' },
    lg: { img: 'h-11 w-11', title: 'text-[24px]', subtitle: 'text-[12px]' },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {!imgError ? (
        <img
          src="/logo.svg"
          alt="KisanKhata Logo"
          onError={() => setImgError(true)}
          className={`${sizeConfig.img} object-contain transition-transform group-hover:scale-105 shrink-0`}
        />
      ) : (
        <div className={`${sizeConfig.img} rounded-xl bg-[#012d1d] flex items-center justify-center text-[#a1f4c8] shadow-xs shrink-0`}>
          <span className="material-symbols-outlined text-[20px]">agriculture</span>
        </div>
      )}

      <div className="flex flex-col text-left">
        <span className={`font-extrabold ${sizeConfig.title} text-[#012d1d] tracking-tight leading-none`}>
          KisanKhata
        </span>
        {showTagline && (
          <span className={`${sizeConfig.subtitle} font-semibold text-[#116c4a] tracking-wide leading-tight mt-0.5`}>
            Crop Expense Tracker • फसल खर्च बही
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center text-left focus:outline-none group cursor-pointer"
        aria-label="KisanKhata Home"
      >
        {content}
      </button>
    );
  }

  return content;
};
