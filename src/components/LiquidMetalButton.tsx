
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LiquidMetalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'alumix' | 'polarix' | 'chroma' | 'chrome' | 'liquid';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export function LiquidMetalButton({ 
  variant = 'chroma', 
  size = 'md', 
  glow = true,
  className,
  children,
  ...props 
}: LiquidMetalButtonProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-500 font-medium border-0 group";
  
  const variantClasses = {
    alumix: "bg-gradient-conic from-gray-300 via-gray-100 via-white via-gray-200 to-gray-300 text-gray-800 hover:from-gray-200 hover:via-white hover:to-gray-200",
    polarix: "bg-gradient-conic from-cyan-400 via-blue-500 via-teal-400 via-cyan-300 to-cyan-400 text-white hover:from-cyan-300 hover:via-blue-400 hover:to-cyan-300",
    chroma: "bg-gradient-conic from-purple-600 via-blue-500 via-cyan-400 via-pink-500 to-purple-600 text-white hover:from-purple-500 hover:via-blue-400 hover:to-purple-500",
    chrome: "bg-gradient-conic from-slate-400 via-zinc-200 via-gray-100 via-slate-300 to-slate-400 text-gray-800 hover:from-slate-300 hover:via-zinc-100 hover:to-slate-300",
    liquid: "bg-gradient-conic from-indigo-500 via-purple-500 via-pink-500 via-blue-500 to-indigo-500 text-white hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-400"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-2xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-3xl"
  };

  const glowClasses = glow ? {
    alumix: "shadow-[0_0_30px_rgba(156,163,175,0.6)] hover:shadow-[0_0_50px_rgba(156,163,175,0.8)]",
    polarix: "shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)]",
    chroma: "shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:shadow-[0_0_50px_rgba(147,51,234,0.8)]",
    chrome: "shadow-[0_0_30px_rgba(100,116,139,0.6)] hover:shadow-[0_0_50px_rgba(100,116,139,0.8)]",
    liquid: "shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:shadow-[0_0_50px_rgba(99,102,241,0.8)]"
  } : {};

  return (
    <Button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        glow && glowClasses[variant],
        "hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      {/* Liquid metal shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-holographic-shine" />
      
      {/* Metallic reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none" />
      
      {/* Liquid flow animation */}
      <div className="absolute inset-0 bg-gradient-conic from-transparent via-white/10 via-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-spin-slow pointer-events-none" />
      
      <span className="relative z-10 font-semibold">{children}</span>
    </Button>
  );
}
