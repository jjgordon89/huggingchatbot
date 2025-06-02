
import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidMetalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'alumix' | 'polarix' | 'chroma' | 'glass';
  onClick?: () => void;
}

export function LiquidMetalCard({ children, className, variant = 'chroma', onClick }: LiquidMetalCardProps) {
  const variants = {
    alumix: "bg-gradient-to-br from-gray-200/90 via-gray-100/80 to-gray-300/90 border border-gray-300/50 shadow-[0_0_40px_rgba(156,163,175,0.4)]",
    polarix: "bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-teal-400/20 border border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.3)]",
    chroma: "bg-gradient-to-br from-purple-600/20 via-blue-500/15 to-pink-500/20 border border-purple-500/40 shadow-[0_0_40px_rgba(147,51,234,0.4)]",
    glass: "bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
  };

  return (
    <div 
      className={cn(
        "relative rounded-3xl p-6 transition-all duration-500 group overflow-hidden",
        "hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(147,51,234,0.5)]",
        variants[variant],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Liquid metal shine effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-holographic-shine pointer-events-none" />
      
      {/* Liquid flow animation */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-conic from-transparent via-white/5 via-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-spin-slow pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Liquid border glow */}
      <div className="absolute inset-0 rounded-3xl border border-purple-400/20 blur-sm group-hover:border-purple-300/40 transition-all duration-500 pointer-events-none" />
    </div>
  );
}
