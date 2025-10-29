
import React from 'react';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'full' | 'icon';
}

export function Logo({ size = 'md', className, variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { width: 'w-8 h-8' },
    md: { width: 'w-10 h-10' },
    lg: { width: 'w-14 h-14' }
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src={logoImage} 
        alt="Jure Logo" 
        className={cn("object-contain", sizes[size].width)}
      />
    </div>
  );
}
