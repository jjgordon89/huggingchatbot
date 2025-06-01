
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HolographicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'chroma' | 'glass' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  chromaVariant?: 'primary' | 'secondary' | 'accent' | 'rainbow';
  glow?: boolean;
  children: React.ReactNode;
}

export function HolographicButton({ 
  variant = 'chroma', 
  size = 'md', 
  chromaVariant = 'primary',
  glow = true,
  className,
  children,
  ...props 
}: HolographicButtonProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-300 font-medium border-0";
  
  const variantClasses = {
    chroma: "bg-gradient-conic text-white hover:scale-105 shadow-holographic",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
    outline: "bg-transparent border-2 text-white hover:bg-white/10",
    solid: "bg-gradient-to-r text-white hover:opacity-90"
  };

  const chromaGradients = {
    primary: "from-purple-600 via-blue-500 via-cyan-400 to-purple-600",
    secondary: "from-blue-600 via-purple-500 via-pink-400 to-blue-600", 
    accent: "from-cyan-500 via-blue-600 via-purple-500 to-cyan-500",
    rainbow: "from-purple-500 via-blue-500 via-cyan-400 via-pink-500 via-orange-500 to-purple-500"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };

  const glowClasses = glow ? {
    chroma: "shadow-holographic-lg hover:shadow-[0_0_40px_rgba(147,51,234,0.8)]",
    glass: "shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    outline: "shadow-[0_0_20px_rgba(147,51,234,0.3)]",
    solid: "shadow-[0_0_20px_rgba(147,51,234,0.4)]"
  } : {};

  return (
    <Button
      className={cn(
        baseClasses,
        variantClasses[variant],
        variant === 'chroma' && `bg-gradient-conic ${chromaGradients[chromaVariant]}`,
        variant === 'outline' && `border-gradient-conic ${chromaGradients[chromaVariant]}`,
        sizeClasses[size],
        glow && glowClasses[variant],
        className
      )}
      {...props}
    >
      {/* Holographic shine effect for chroma variant */}
      {variant === 'chroma' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 animate-holographic-shine" />
      )}
      
      {/* Chrome reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
