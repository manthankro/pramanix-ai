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
  xs: "h-10",
  sm: "h-16",
  md: "h-20",
  lg: "h-24",
  xl: "h-28",
};

export const PramanixLogoIcon: React.FC<{ className?: string; size?: number | string }> = ({
  className = "w-8 h-8",
}) => (
  <img
    src="/pramanix-logo.jpeg"
    alt="Pramanix logo"
    className={`object-contain ${className}`}
  />
);

export const PramanixLogo: React.FC<PramanixLogoProps> = ({
  size = "sm",
  className = "",
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`inline-flex items-center justify-center ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""} ${className}`}
  >
    <img
      src="/pramanix-logo.jpeg"
      alt="Pramanix"
      className={`${logoHeight[size]} w-auto object-contain`}
    />
  </div>
);
