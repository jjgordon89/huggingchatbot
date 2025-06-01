
import React from 'react';
import { cn } from '@/lib/utils';

interface HolographicOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow';
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
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const variantClasses = {
    primary: 'from-purple-500 via-blue-500 via-cyan-400 to-purple-500',
    secondary: 'from-pink-500 via-purple-500 to-cyan-500',
    accent: 'from-cyan-400 via-blue-500 to-purple-600',
    rainbow: 'from-purple-500 via-blue-500 via-cyan-400 via-green-400 via-yellow-400 via-orange-400 via-red-400 to-purple-500'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-conic opacity-80 blur-sm',
        variantClasses[variant],
        animated && 'animate-spin-slow'
      )} />
      <div className={cn(
        'absolute inset-1 rounded-full bg-gradient-conic opacity-60',
        variantClasses[variant],
        animated && 'animate-spin-slow'
      )} />
      <div className={cn(
        'absolute inset-2 rounded-full bg-gradient-radial from-black/20 to-transparent'
      )} />
    </div>
  );
}
