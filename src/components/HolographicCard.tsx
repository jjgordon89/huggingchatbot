
import React from 'react';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'glass';
  onClick?: () => void;
}

export function HolographicCard({ children, className, variant = 'primary', onClick }: HolographicCardProps) {
  const variants = {
    primary: "bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.3)]",
    secondary: "bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-gray-900/90 border border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.25)]",
    glass: "bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
  };

  return (
    <div 
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(147,51,234,0.4)]",
        variants[variant],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Holographic shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-purple-400/20 blur-sm pointer-events-none"></div>
    </div>
  );
}
