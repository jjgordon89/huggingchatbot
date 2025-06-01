
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export function GlassButton({ 
  variant = 'primary', 
  size = 'md', 
  glow = false,
  className,
  children,
  ...props 
}: GlassButtonProps) {
  const baseClasses = "relative overflow-hidden backdrop-blur-md border transition-all duration-300 font-medium";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30 text-white hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-300/50",
    secondary: "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-400/30 text-white hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-300/50",
    accent: "bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-pink-400/30 text-white hover:from-pink-500/30 hover:to-purple-500/30 hover:border-pink-300/50",
    ghost: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl"
  };

  const glowClasses = glow ? {
    primary: "shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]",
    secondary: "shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]",
    accent: "shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]",
    ghost: "shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
  } : {};

  return (
    <Button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        glow && glowClasses[variant],
        className
      )}
      {...props}
    >
      {/* Holographic shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 animate-holographic-shine" />
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
