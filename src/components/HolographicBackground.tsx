
import React from 'react';
import { HolographicOrb } from './HolographicOrb';

export function HolographicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main hero orb - Chroma inspired */}
      <div className="absolute top-20 right-20 opacity-20">
        <HolographicOrb size="2xl" variant="chroma-1" />
      </div>
      
      {/* Secondary Chroma orbs */}
      <div className="absolute bottom-32 left-16 opacity-15">
        <HolographicOrb size="xl" variant="chroma-2" />
      </div>
      
      <div className="absolute top-1/3 left-1/4 opacity-25">
        <HolographicOrb size="lg" variant="chroma-3" />
      </div>
      
      {/* Smaller floating Chroma particles */}
      <div className="absolute top-1/4 right-1/3 opacity-30">
        <HolographicOrb size="md" variant="chroma-4" />
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 opacity-20">
        <HolographicOrb size="lg" variant="chroma-5" />
      </div>
      
      {/* Tiny floating particles */}
      <div className="absolute top-1/2 left-1/3 opacity-40">
        <HolographicOrb size="sm" variant="chroma-1" />
      </div>
      
      <div className="absolute top-3/4 right-1/3 opacity-35">
        <HolographicOrb size="sm" variant="chroma-2" />
      </div>
      
      <div className="absolute top-1/5 left-1/2 opacity-30">
        <HolographicOrb size="xs" variant="chroma-3" />
      </div>
      
      {/* Chrome-style gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-purple-900/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-conic from-transparent via-blue-900/3 to-transparent opacity-50" />
    </div>
  );
}
