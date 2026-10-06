"use client";

import React from "react";

interface AmbientGlowProps {
  className?: string;
  color?: string;
}

export const AmbientGlow: React.FC<AmbientGlowProps> = ({
  className = "",
  color = "bg-white/[0.04]",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none rounded-full blur-3xl filter transition-opacity duration-1000 ${color} ${className}`}
    />
  );
};

export default AmbientGlow;
