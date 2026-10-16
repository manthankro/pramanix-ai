import React from "react";

interface PramanixLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  showVersion?: boolean;
  version?: string;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: { icon: "w-6 h-6", text: "text-xs", badge: "text-[9px] px-1 py-0.2" },
  sm: { icon: "w-8 h-8", text: "text-sm", badge: "text-[10px] px-1.5 py-0.5" },
  md: { icon: "w-10 h-10", text: "text-base", badge: "text-xs px-2 py-0.5" },
  lg: { icon: "w-12 h-12", text: "text-lg", badge: "text-xs px-2 py-0.5" },
  xl: { icon: "w-16 h-16", text: "text-2xl", badge: "text-sm px-2.5 py-1" },
};

export const PramanixLogoIcon: React.FC<{ className?: string; size?: number | string }> = ({
  className = "w-8 h-8",
}) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md shadow-emerald-950/40 select-none ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="prmxBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#040711" />
          </linearGradient>

          <linearGradient id="prmxRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="prmxStemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="prmxLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="prmxAccentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          <filter id="prmxGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Container */}
        <rect
          x="6"
          y="6"
          width="188"
          height="188"
          rx="44"
          fill="url(#prmxBgGrad)"
          stroke="url(#prmxRingGrad)"
          strokeWidth="3"
        />

        {/* Ambient Glow */}
        <circle cx="100" cy="95" r="42" fill="#06b6d4" opacity="0.15" filter="url(#prmxGlow)" />
        <circle cx="85" cy="115" r="32" fill="#10b981" opacity="0.18" filter="url(#prmxGlow)" />

        {/* Neural Network Nodes */}
        <g opacity="0.45" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,3">
          <line x1="45" y1="52" x2="68" y2="70" />
          <line x1="150" y1="55" x2="130" y2="72" />
          <line x1="154" y1="125" x2="135" y2="135" />
        </g>
        <circle cx="45" cy="52" r="3" fill="#34d399" opacity="0.8" />
        <circle cx="150" cy="55" r="3" fill="#38bdf8" opacity="0.8" />
        <circle cx="154" cy="125" r="3" fill="#818cf8" opacity="0.7" />

        {/* Stylized P Monogram */}
        <g filter="url(#prmxGlow)">
          {/* Vertical Stem */}
          <path
            d="M60 48 C60 43.5 64 41.5 68 44 L80 50 C83 51.5 85 54.5 85 58 L85 146 C85 151 80 155 75 153 L66 148 C62.5 146 60 142.5 60 138.5 Z"
            fill="url(#prmxStemGrad)"
          />

          {/* Loop Arc */}
          <path
            d="M84 46 L124 46 C145 46 158 58 158 78 C158 97 144 110 122 110 L84 110 Z"
            fill="none"
            stroke="url(#prmxLoopGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dark Inner Hole */}
          <path
            d="M85 62 L120 62 C131 62 140 70 140 80 C140 90 131 96 120 96 L85 96 Z"
            fill="#090d16"
            opacity="0.95"
          />

          {/* Forward Accent Wing */}
          <path
            d="M96 78 L122 78 C130 78 136 73 136 66 C136 59 130 55 121 55 L96 55 Z"
            fill="url(#prmxAccentGrad)"
            opacity="0.95"
          />

          {/* Core AI Spark */}
          <circle cx="118" cy="78" r="4.5" fill="#ffffff" filter="url(#prmxGlow)" />
          <circle cx="118" cy="78" r="2.2" fill="#a7f3d0" />

          {/* Verification Facet Lines */}
          <path d="M68 116 L98 86 L108 96 L76 128 Z" fill="#10b981" opacity="0.5" />
          <path d="M94 110 L146 160 L134 166 L86 118 Z" fill="url(#prmxRingGrad)" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};

export const PramanixLogo: React.FC<PramanixLogoProps> = ({
  size = "sm",
  showText = true,
  showSubtitle = false,
  showVersion = false,
  version = "v2.6",
  className = "",
  onClick,
}) => {
  const cfg = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""} ${className}`}
    >
      <PramanixLogoIcon className={cfg.icon} />

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-bold tracking-tight text-zinc-100 flex items-center gap-1.5 ${cfg.text}`}>
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Pramanix
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-zinc-950 font-black px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs">
              AI
            </span>
            {showVersion && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-normal">
                {version}
              </span>
            )}
          </div>
          {showSubtitle && (
            <span className="text-[11px] text-zinc-400 mt-0.5 font-normal">
              AI Engineering Mentor & Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
};
