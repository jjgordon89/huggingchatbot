
import React from 'react';
import { cn } from '@/lib/utils';

interface HolographicOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow' | 'chroma-1' | 'chroma-2' | 'chroma-3' | 'chroma-4' | 'chroma-5';
  className?: string;
  animated?: boolean;
}

export function HolographicOrb({ 
  size = 'md', 
  variant = 'primary', 
  className,
  animated = true 
}: HolographicOrbProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    '2xl': 'w-48 h-48'
  };

  const variantClasses = {
    primary: 'from-purple-500 via-blue-500 via-cyan-400 to-purple-500',
    secondary: 'from-pink-500 via-purple-500 to-cyan-500',
    accent: 'from-cyan-400 via-blue-500 to-purple-600',
    rainbow: 'from-purple-500 via-blue-500 via-cyan-400 via-green-400 via-yellow-400 via-orange-400 via-red-400 to-purple-500',
    'chroma-1': 'from-purple-600 via-blue-500 via-cyan-400 via-pink-500 to-purple-600',
    'chroma-2': 'from-blue-600 via-purple-500 via-pink-400 via-orange-500 to-blue-600',
    'chroma-3': 'from-cyan-500 via-blue-600 via-purple-500 via-pink-400 to-cyan-500',
    'chroma-4': 'from-pink-500 via-purple-600 via-blue-500 via-cyan-400 to-pink-500',
    'chroma-5': 'from-orange-500 via-pink-600 via-purple-500 via-blue-400 to-orange-500'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer glow ring */}
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-conic opacity-40 blur-xl',
        variantClasses[variant],
        animated && 'animate-spin-slow'
      )} />
      
      {/* Main orb with chrome-like effect */}
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-conic opacity-90 blur-sm',
        variantClasses[variant],
        animated && 'animate-spin-slow'
      )} />
      
      {/* Inner orb */}
      <div className={cn(
        'absolute inset-1 rounded-full bg-gradient-conic opacity-80',
        variantClasses[variant],
        animated && 'animate-spin-slow'
      )} />
      
      {/* Center reflection */}
      <div className={cn(
        'absolute inset-2 rounded-full bg-gradient-radial from-white/20 via-transparent to-black/30'
      )} />
      
      {/* Chrome-like highlight */}
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
    </div>
  );
}
