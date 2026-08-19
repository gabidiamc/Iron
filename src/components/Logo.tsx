import React, { useState } from 'react';
import logoImage from '../assets/images/portal_logo_1787108656128.jpg';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const imageDimension = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden bg-gradient-to-b from-[#07152B] to-[#030914] p-1 border border-sky-400/25 shadow-[0_0_20px_rgba(37,139,255,0.3)] group`}
      >
        {!imgError ? (
          <img
            src={logoImage}
            alt="Logo Portal de Voluntariado"
            width={imageDimension[size]}
            height={imageDimension[size]}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-xl drop-shadow-md"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High Fidelity Vector SVG Logo */
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="blueBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="cyanSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="orangeLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="greenLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="sphereGrad" x1="20%" y1="20%" x2="90%" y2="90%">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="40%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {/* Left Blue Swoosh Wing */}
            <path
              d="M15 48 C 30 46, 52 56, 52 66 C 45 66, 28 62, 15 48 Z"
              fill="url(#cyanSwoosh)"
            />
            <path
              d="M15 48 C 30 52, 50 64, 52 66 C 42 66, 25 60, 15 48 Z"
              fill="url(#blueBase)"
            />

            {/* Right Green Leaf */}
            <path
              d="M52 66 C 54 55, 66 45, 74 46 C 72 58, 62 65, 52 66 Z"
              fill="url(#greenLeaf)"
            />

            {/* Upper Right Orange/Amber Leaf */}
            <path
              d="M54 48 C 58 35, 70 33, 76 34 C 74 44, 64 47, 54 48 Z"
              fill="url(#orangeLeaf)"
            />

            {/* Central Main Bubble */}
            <circle cx="48" cy="32" r="9" fill="url(#sphereGrad)" />
            {/* Center-Lower Bubble */}
            <circle cx="48" cy="45" r="7" fill="url(#sphereGrad)" />
            {/* Left Mid Bubble */}
            <circle cx="37" cy="40" r="6.5" fill="url(#sphereGrad)" />
            {/* Small Left Dot */}
            <circle cx="27" cy="41" r="3" fill="url(#sphereGrad)" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-none">
            Portal Voluntario
          </span>
          <span className="text-[10px] text-blue-400 font-medium tracking-wide">
            Certificación & Servicio
          </span>
        </div>
      )}
    </div>
  );
};
