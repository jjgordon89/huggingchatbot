
import React from 'react';

export function HolographicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main holographic orb - inspired by the Chroma designs */}
      <div className="absolute top-20 right-20 w-96 h-96 opacity-30">
        <div className="w-full h-full rounded-full bg-gradient-conic from-purple-500 via-blue-500 via-cyan-400 via-purple-600 to-purple-500 animate-spin-slow blur-xl"></div>
      </div>
      
      {/* Secondary smaller orbs */}
      <div className="absolute bottom-32 left-16 w-48 h-48 opacity-20">
        <div className="w-full h-full rounded-full bg-gradient-radial from-cyan-400/50 via-blue-500/30 to-purple-600/50 animate-pulse-subtle blur-lg"></div>
      </div>
      
      <div className="absolute top-1/3 left-1/4 w-32 h-32 opacity-25">
        <div className="w-full h-full rounded-full bg-gradient-conic from-pink-500 via-purple-500 to-cyan-500 animate-breathe blur-md"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-1/4 right-1/3 w-16 h-16 opacity-40">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 animate-float blur-sm"></div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 opacity-30">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 animate-bounce-subtle blur-sm"></div>
      </div>
    </div>
  );
}
