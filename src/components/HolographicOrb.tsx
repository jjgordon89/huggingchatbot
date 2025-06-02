
import React from 'react';
import { cn } from '@/lib/utils';

interface HolographicOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow' | 'chroma-1' | 'chroma-2' | 'chroma-3' | 'chroma-4' | 'chroma-5' | 'liquid-metal' | 'liquid-cyan' | 'liquid-chrome';
  className?: string;
  animated?: boolean;
}

export function HolographicOrb({ 
  size = 'md', 
  variant = 'primary', 
  className,
  animated = false 
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
    'chroma-5': 'from-orange-500 via-pink-600 via-purple-500 via-blue-400 to-orange-500',
    'liquid-metal': 'from-gray-200 via-gray-300 via-gray-100 via-white via-gray-200 to-gray-300',
    'liquid-cyan': 'from-cyan-300 via-cyan-500 via-blue-400 via-teal-300 to-cyan-400',
    'liquid-chrome': 'from-slate-300 via-slate-100 via-zinc-200 via-gray-300 to-slate-400'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer liquid glow ring */}
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-conic opacity-60 blur-2xl',
        variantClasses[variant]
      )} />
      
      {/* Middle liquid ring */}
      <div className={cn(
        'absolute inset-1 rounded-full bg-gradient-conic opacity-80 blur-lg',
        variantClasses[variant]
      )} />
      
      {/* Main liquid orb with metallic effect */}
      <div className={cn(
        'absolute inset-2 rounded-full bg-gradient-conic opacity-95',
        variantClasses[variant]
      )} />
      
      {/* Liquid surface reflection */}
      <div className="absolute inset-3 rounded-full bg-gradient-radial from-white/40 via-white/10 to-transparent" />
      
      {/* Chrome-like liquid highlight */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/60 via-transparent to-black/20" />
    </div>
  );
}
