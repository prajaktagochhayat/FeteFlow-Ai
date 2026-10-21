import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: { box: 'h-8 w-8', text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { box: 'h-9 w-9', text: 'text-lg', badge: 'text-[10px] px-2 py-0.5' },
    lg: { box: 'h-11 w-11', text: 'text-xl', badge: 'text-[11px] px-2 py-0.5' },
    xl: { box: 'h-14 w-14', text: 'text-2xl', badge: 'text-xs px-2.5 py-1' },
  }[size];

  return (
    <div className={`group flex items-center gap-3 select-none ${className}`}>
      {/* Cool Iconic Mark with Dynamic Gradients */}
      <div
        className={`relative ${iconDimensions.box} shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full drop-shadow-[0_4px_12px_rgba(118,85,232,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Squircle Gradient */}
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#341A75" />
              <stop offset="50%" stop-color="#1E1438" />
              <stop offset="100%" stop-color="#120E20" />
            </linearGradient>

            {/* Vibrant Celebration Ribbon Gradient */}
            <linearGradient id="logoRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C5B4FF" />
              <stop offset="30%" stop-color="#7655E8" />
              <stop offset="70%" stop-color="#FF7C91" />
              <stop offset="100%" stop-color="#FFD166" />
            </linearGradient>

            {/* Star Core Radiant Gradient */}
            <linearGradient id="logoStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="40%" stop-color="#FFF0BE" />
              <stop offset="100%" stop-color="#FF7C91" />
            </linearGradient>

            <radialGradient id="logoAuraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#7655E8" stop-opacity="0.5" />
              <stop offset="70%" stop-color="#FF7C91" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>

          {/* Squircle Base */}
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="26"
            fill="url(#logoBgGrad)"
            stroke="#7655E8"
            strokeWidth="2.5"
            strokeOpacity="0.5"
          />

          {/* Glowing Aura */}
          <circle cx="50" cy="50" r="40" fill="url(#logoAuraGlow)" />

          {/* Flowing Stylized 'F' Celebration Wave */}
          <path
            d="M28 72 C28 76 33 76 34 72 L36 34 C36 26 43 22 52 22 C64 22 72 26 76 32 C78 35 75 38 71 37 C64 34 56 32 48 33 C42 34 39 38 39 44 L39 49 C46 47 55 46 63 48 C67 49 67 54 62 55 C54 56 46 56 39 58 L37 72 C37 77 30 78 28 72 Z"
            fill="url(#logoRibbonGrad)"
          />

          {/* Interlocking Celebration Loop Swirl */}
          <path
            d="M38 30 C48 18 68 18 78 28 C87 37 86 52 75 62 C65 71 50 74 38 70 C34 68 35 63 39 64 C49 67 61 64 69 57 C77 49 78 39 71 32 C64 25 50 25 42 32 Z"
            fill="url(#logoRibbonGrad)"
            opacity="0.9"
          />

          {/* Radiant Diamond Star Accent with Subtle Shimmer */}
          <g transform="translate(68, 30)">
            <path
              d="M0 -15 C0.8 -4 4 -0.8 15 0 C4 0.8 0.8 4 0 15 C-0.8 4 -4 0.8 -15 0 C-4 -0.8 -0.8 -4 0 -15 Z"
              fill="url(#logoStarGrad)"
            />
            <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
          </g>

          {/* Secondary Star */}
          <g transform="translate(32, 66)">
            <path
              d="M0 -6 C0.4 -1.5 1.5 -0.4 6 0 C1.5 0.4 0.4 1.5 0 6 C-0.4 1.5 -1.5 0.4 -6 0 C-1.5 -0.4 -0.4 -1.5 0 -6 Z"
              fill="#FFD166"
              opacity="0.85"
            />
          </g>

          {/* Micro Sparkle */}
          <circle cx="78" cy="64" r="2" fill="#C5B4FF" opacity="0.9" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-serif ${iconDimensions.text} font-bold tracking-tight text-brand-text`}>
              FêteFlow
            </span>
            <span
              className={`rounded-md font-sans font-extrabold uppercase tracking-widest text-white shadow-sm bg-gradient-to-r from-brand-primary via-purple-500 to-brand-coral ${iconDimensions.badge}`}
            >
              AI
            </span>
          </div>
          {showTagline && (
            <span className="mt-1 text-[11px] font-medium tracking-wide text-brand-text-secondary">
              Big moments. Zero chaos.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
