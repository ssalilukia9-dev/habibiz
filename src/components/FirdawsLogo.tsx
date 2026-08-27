import React from 'react';

interface FirdawsLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge' | 'card' | 'hero' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
}

export default function FirdawsLogo({
  className = '',
  variant = 'full',
  size = 'md',
  dark = false
}: FirdawsLogoProps) {
  // SVG Vector of the official Firdaws Charity Organization logo
  const Emblem = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="firdawsGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="40%" stopColor="#0B5345" />
          <stop offset="100%" stopColor="#042C23" />
        </linearGradient>
        <linearGradient id="firdawsGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="25%" stopColor="#F5D061" />
          <stop offset="65%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>
        <linearGradient id="firdawsHeartGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9D6" />
          <stop offset="50%" stopColor="#F5D061" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <filter id="firdawsGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Gold Crescent Arch Outline */}
      <path
        d="M 52 108 C 50 72, 74 38, 114 32 C 146 27, 168 45, 172 65 C 160 52, 138 46, 118 52 C 86 62, 68 88, 70 120 C 72 138, 80 152, 92 162 C 68 152, 54 132, 52 108 Z"
        fill="url(#firdawsGold)"
        filter="url(#firdawsGlow)"
      />

      {/* Star at the crescent tip / top */}
      <circle cx="102" cy="24" r="3.5" fill="url(#firdawsGold)" />
      <path
        d="M 102 16 C 103 21, 107 23, 111 24 C 107 25, 103 27, 102 32 C 101 27, 97 25, 93 24 C 97 23, 101 21, 102 16 Z"
        fill="url(#firdawsGold)"
      />

      {/* Gold Mosque Dome Arch Silhouette */}
      <path
        d="M 102 44 C 114 62, 134 78, 140 102 C 136 102, 130 92, 122 84 C 114 76, 106 68, 102 58 C 98 68, 90 76, 82 84 C 74 92, 68 102, 64 102 C 70 78, 90 62, 102 44 Z"
        fill="url(#firdawsGold)"
      />

      {/* Two People / Souls Heads inside the Dome Arch */}
      <circle cx="80" cy="94" r="7.5" fill="url(#firdawsGreen)" />
      <circle cx="124" cy="94" r="7.5" fill="url(#firdawsGreen)" />

      {/* Caring Hands Embracing Heart (Emerald Green) */}
      <path
        d="M 42 135 C 44 106, 68 88, 82 82 C 76 96, 78 112, 88 124 C 94 132, 102 136, 110 138 C 90 144, 68 140, 52 128 C 46 138, 48 150, 58 160 C 74 176, 108 184, 142 172 C 158 166, 168 154, 172 142 C 160 152, 142 158, 124 158 C 92 158, 62 146, 42 135 Z"
        fill="url(#firdawsGreen)"
      />

      {/* Right Hand Wing Curve */}
      <path
        d="M 162 135 C 160 106, 136 88, 122 82 C 128 96, 126 112, 116 124 C 110 132, 102 136, 94 138 C 114 144, 136 140, 152 128 C 158 138, 156 150, 146 160 C 138 168, 120 176, 102 178 C 122 178, 146 170, 160 154 C 168 144, 166 138, 162 135 Z"
        fill="url(#firdawsGreen)"
      />

      {/* Central Heart (Golden Nourishment & Love) */}
      <path
        d="M 102 124 C 98 118, 92 108, 92 102 C 92 96, 96 92, 102 96 C 108 92, 112 96, 112 102 C 112 108, 106 118, 102 124 Z"
        fill="url(#firdawsHeartGold)"
        filter="url(#firdawsGlow)"
      />
    </svg>
  );

  if (variant === 'icon') {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24'
    }[size];

    return (
      <div className={`shrink-0 ${sizeClasses} ${className}`}>
        <Emblem />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#063E33]/40 border border-[#D4AF37]/40 shadow-xl backdrop-blur-md ${className}`}>
        <div className="w-6 h-6 shrink-0">
          <Emblem />
        </div>
        <div className="leading-tight text-left">
          <span className="text-[10px] font-black tracking-wider text-emerald-300 uppercase block">
            FIRDAWS
          </span>
          <span className="text-[7px] font-bold text-amber-300 tracking-widest uppercase block">
            CHARITY PARTNER
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center space-y-3 select-none ${className}`}>
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 filter drop-shadow-[0_4px_20px_rgba(212,175,55,0.4)]">
          <Emblem />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-emerald-300 text-[9px] font-black uppercase tracking-[0.2em]">
            ★ Official Humanitarian Partner
          </div>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-wider ${dark ? 'text-white' : 'text-[#0B5345]'}`}>
            FIRDAWS <span className="text-amber-400">CHARITY ORGANIZATION</span>
          </h3>
          <p className="text-xs sm:text-sm font-serif italic text-emerald-400/90 tracking-wide">
            "Empowering Lives, Shaping Futures"
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`glass-panel rounded-3xl p-6 border border-[#D4AF37]/30 bg-gradient-to-br from-[#063E33]/60 via-[#0B1E2E]/80 to-black/90 shadow-2xl relative overflow-hidden ${className}`}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="w-20 h-20 shrink-0 filter drop-shadow-[0_0_15px_rgba(245,208,97,0.3)]">
            <Emblem />
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D061] text-[9px] font-black uppercase tracking-widest">
              ★ Official Humanitarian Partner
            </div>
            <h4 className="text-xl font-black text-white tracking-wide">
              FIRDAWS <span className="text-amber-400">CHARITY ORGANIZATION</span>
            </h4>
            <p className="text-xs text-emerald-300 font-medium italic tracking-wider">
              "Empowering Lives, Shaping Futures"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Full Wordmark & Emblem Variant
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-4 select-none ${className}`}>
      {/* Emblem */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
        <Emblem />
      </div>

      {/* Divider */}
      <div className="w-[1.5px] h-10 sm:h-12 bg-gradient-to-b from-[#0B5345] via-[#D4AF37] to-[#0B5345] opacity-70" />

      {/* Typography */}
      <div className="flex flex-col justify-center text-left leading-tight">
        <span className={`text-lg sm:text-xl font-black tracking-[0.08em] font-sans ${dark ? 'text-white' : 'text-[#0B5345]'}`}>
          FIRDAWS
        </span>
        <span className="text-[8px] sm:text-[9px] font-black tracking-[0.25em] text-[#C59B27] uppercase mt-0.5">
          CHARITY ORGANIZATION
        </span>
        <span className="text-[7px] sm:text-[8px] font-serif italic tracking-wider text-emerald-500/90 mt-0.5">
          "Empowering Lives, Shaping Futures"
        </span>
      </div>
    </div>
  );
}
