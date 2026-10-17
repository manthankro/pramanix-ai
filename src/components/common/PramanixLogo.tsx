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

const logoHeight: Record<NonNullable<PramanixLogoProps["size"]>, string> = {
  xs: "h-7",
  sm: "h-10",
  md: "h-14",
  lg: "h-20",
  xl: "h-24",
};

export const PramanixLogoIcon: React.FC<{ className?: string; size?: number | string }> = ({
  className = "w-8 h-8",
}) => (
  <img
    src="/pramanix-logo.jpeg"
    alt="Pramanix logo"
    className={`object-contain rounded-md ${className}`}
  />
);

export const PramanixLogo: React.FC<PramanixLogoProps> = ({
  size = "sm",
  showVersion = false,
  version = "v3.0",
  className = "",
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`inline-flex items-center gap-3 ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""} ${className}`}
  >
    <div className="relative rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-cyan-500/30 via-zinc-800 to-indigo-500/20 border border-zinc-700/60 shadow-md shadow-black/50">
      <img
        src="/pramanix-logo.jpeg"
        alt="Pramanix"
        className={`${logoHeight[size]} w-auto object-contain rounded-lg`}
      />
    </div>
    {showVersion && (
      <div className="flex flex-col">
        <span className="text-[11px] font-bold tracking-widest text-zinc-100 uppercase">Pramanix</span>
        <span className="text-[9px] font-semibold tracking-wider text-cyan-400 font-mono">{version}</span>
      </div>
    )}
  </div>
);
