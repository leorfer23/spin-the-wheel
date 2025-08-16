import React from "react";

interface JackpotPlaceholderProps {
  size?: number;
}

// Simple greyed-out slot machine placeholder for empty state
export const JackpotPlaceholder: React.FC<JackpotPlaceholderProps> = ({
  size = 500,
}) => {
  const width = size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Machine body */}
      <rect x="75" y="110" width="350" height="310" rx="24" fill="#E5E7EB" />
      <rect x="95" y="130" width="310" height="270" rx="16" fill="#D1D5DB" />

      {/* Top marquee */}
      <rect x="125" y="60" width="250" height="60" rx="12" fill="#E5E7EB" />
      <rect x="140" y="72" width="220" height="36" rx="8" fill="#F3F4F6" />

      {/* Reels area */}
      <rect x="120" y="170" width="260" height="160" rx="12" fill="#F3F4F6" />

      {/* Three reels */}
      <rect x="135" y="185" width="70" height="130" rx="8" fill="#E5E7EB" />
      <rect x="215" y="185" width="70" height="130" rx="8" fill="#E5E7EB" />
      <rect x="295" y="185" width="70" height="130" rx="8" fill="#E5E7EB" />

      {/* Reel dividers */}
      <rect x="205" y="180" width="2" height="140" fill="#D1D5DB" />
      <rect x="285" y="180" width="2" height="140" fill="#D1D5DB" />

      {/* Lever */}
      <rect x="420" y="190" width="8" height="100" rx="4" fill="#9CA3AF" />
      <circle cx="424" cy="175" r="18" fill="#D1D5DB" />

      {/* Base */}
      <rect x="95" y="400" width="310" height="30" rx="8" fill="#E5E7EB" />

      {/* Subtle shading */}
      <rect
        x="95"
        y="130"
        width="310"
        height="20"
        fill="#E5E7EB"
        opacity="0.5"
      />
      <rect
        x="120"
        y="170"
        width="260"
        height="10"
        fill="#E5E7EB"
        opacity="0.6"
      />
    </svg>
  );
};
