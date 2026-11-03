import React from 'react';

export const StaticHeroFallback: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#052e16" />
            <stop offset="45%" stopColor="#0f4c3a" />
            <stop offset="75%" stopColor="#2d6a4f" />
            <stop offset="100%" stopColor="#e8f5e9" />
          </linearGradient>

          {/* Morning Sun Glow */}
          <radialGradient id="sunGlow" cx="70%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#fde047" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0" />
          </radialGradient>

          {/* Water Canal Gradient */}
          <linearGradient id="canalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </linearGradient>

          {/* Far Hills Gradient */}
          <linearGradient id="farHillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a2f" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f291e" stopOpacity="0.9" />
          </linearGradient>

          {/* Mid Hills Gradient */}
          <linearGradient id="midHillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#155e41" />
            <stop offset="100%" stopColor="#063e26" />
          </linearGradient>

          {/* Fore Terrace Gradient */}
          <linearGradient id="terraceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#228b52" />
            <stop offset="100%" stopColor="#0d4e30" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="1440" height="900" fill="url(#skyGrad)" />

        {/* Golden Sun & Rays */}
        <circle cx="1020" cy="260" r="140" fill="url(#sunGlow)" />
        <circle cx="1020" cy="260" r="50" fill="#fffbeb" opacity="0.9" />

        {/* Soft Distant Clouds */}
        <g opacity="0.35" fill="#ffffff">
          <ellipse cx="300" cy="180" rx="140" ry="28" />
          <ellipse cx="360" cy="165" rx="90" ry="32" />
          <ellipse cx="240" cy="175" rx="70" ry="22" />

          <ellipse cx="850" cy="140" rx="120" ry="24" />
          <ellipse cx="910" cy="125" rx="80" ry="28" />
        </g>

        {/* Far Distant Mountain Silhouette */}
        <path
          d="M0 450 Q280 320 620 390 T1180 350 Q1320 380 1440 420 L1440 900 L0 900 Z"
          fill="url(#farHillGrad)"
        />

        {/* Mid-Ground Rolling Agricultural Hills */}
        <path
          d="M0 520 Q320 420 740 480 T1440 460 L1440 900 L0 900 Z"
          fill="url(#midHillGrad)"
        />

        {/* Orchard Trees on Hilltop */}
        <g fill="#1b4332">
          {[220, 270, 310, 480, 530, 580, 890, 940, 990].map((x, i) => (
            <circle key={i} cx={x} cy={480 + (i % 3) * 8} r={16 + (i % 2) * 6} />
          ))}
        </g>

        {/* Winding Irrigation Water Canal */}
        <path
          d="M580 900 C680 720 740 640 820 580 C860 550 940 540 1020 520 L1050 525 C970 548 890 560 845 595 C770 655 710 740 610 900 Z"
          fill="url(#canalGrad)"
        />

        {/* Foreground Terraced Fields with Furrow Rows */}
        <path
          d="M0 620 Q380 560 860 630 Q1180 670 1440 610 L1440 900 L0 900 Z"
          fill="url(#terraceGrad)"
        />

        {/* Furrow Row Lines */}
        <g stroke="#14532d" strokeWidth="2.5" opacity="0.45" fill="none">
          <path d="M0 660 Q400 600 900 670 T1440 650" />
          <path d="M0 710 Q420 645 940 720 T1440 695" />
          <path d="M0 765 Q450 695 980 775 T1440 745" />
          <path d="M0 830 Q480 750 1020 835 T1440 805" />
        </g>

        {/* Foreground Tractor Silhouette */}
        <g transform="translate(180, 680) scale(0.65)" fill="#062e1c" opacity="0.95">
          {/* Rear big wheel */}
          <circle cx="80" cy="110" r="48" fill="#021a0e" />
          <circle cx="80" cy="110" r="30" fill="#facc15" opacity="0.8" />
          {/* Front small wheel */}
          <circle cx="210" cy="125" r="28" fill="#021a0e" />
          {/* Body Hood */}
          <rect x="110" y="65" width="105" height="45" rx="10" fill="#dc2626" />
          <polygon points="120,65 145,25 185,25 210,65" fill="#b91c1c" />
          {/* Exhaust chimney */}
          <rect x="180" y="5" width="8" height="60" rx="3" fill="#1e293b" />
          {/* Steering wheel & seat */}
          <rect x="95" y="45" width="22" height="35" rx="4" fill="#0f172a" />
          <circle cx="120" cy="40" r="14" stroke="#0f172a" strokeWidth="4" fill="none" />
        </g>

        {/* Foreground Indian Farmer Silhouette with Hoe */}
        <g transform="translate(980, 640) scale(0.7)" fill="#062e1c" opacity="0.95">
          {/* Legs & Dhoti */}
          <polygon points="45,110 30,190 48,190 60,110" fill="#f5eedb" />
          <polygon points="65,110 75,190 92,190 80,110" fill="#f5eedb" />
          <path d="M35 85 Q55 125 78 85 Z" fill="#ebe3d5" />
          {/* Kurta & Torso */}
          <rect x="42" y="45" width="40" height="50" rx="8" fill="#d97706" />
          {/* Head & Pagri / Turban */}
          <circle cx="62" cy="28" r="14" fill="#78350f" />
          <ellipse cx="62" cy="20" rx="18" ry="12" fill="#ea580c" />
          <path d="M72 20 Q82 35 75 48" stroke="#ea580c" strokeWidth="5" fill="none" />
          {/* Arms holding farm tool */}
          <path d="M44 55 Q30 75 25 105" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
          <path d="M78 55 Q95 75 88 105" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
          {/* Wooden Hoe Handle & Blade */}
          <line x1="15" y1="135" x2="105" y2="40" stroke="#451a03" strokeWidth="5" />
          <polygon points="12,130 5,145 28,140" fill="#64748b" />
        </g>
      </svg>
    </div>
  );
};

export default StaticHeroFallback;

