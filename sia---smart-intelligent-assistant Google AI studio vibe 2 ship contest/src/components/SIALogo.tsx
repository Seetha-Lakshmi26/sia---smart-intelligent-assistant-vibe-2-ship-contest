import React from 'react';
// @ts-ignore
import logoImg from '../myexactimage.png';

interface SIALogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function SIALogo({ size = 'md', showText = true, className = '' }: SIALogoProps) {
  // Determine dimensions based on size preset
  const dimensions = {
    sm: { imgSize: 'h-6 w-6', text: 'text-[10px]', gap: 'gap-1.5' },
    md: { imgSize: 'h-9 w-9', text: 'text-xs', gap: 'gap-2' },
    lg: { imgSize: 'h-12 w-12', text: 'text-sm', gap: 'gap-2.5' },
    xl: { imgSize: 'h-16 w-16', text: 'text-base', gap: 'gap-3.5' },
  }[size];

  return (
    <div className={`flex items-center ${dimensions.gap} ${className}`} id="sia-brand-logo">
      {/* Precision Stylized Brand Logo Image */}
      <div className="relative shrink-0 flex items-center justify-center rounded-lg overflow-hidden bg-white p-0.5 shadow-md shadow-cyan-500/10 transition-transform duration-300 hover:scale-105">
        <img
          src={logoImg}
          alt="SIA Logo"
          className={`${dimensions.imgSize} object-contain rounded-md`}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Wording Texts */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-white tracking-tight font-display text-lg md:text-xl">
              SIA
            </span>
            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              v2.4
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono tracking-[0.12em] uppercase whitespace-nowrap">
            Smart Intelligent Assistant
          </span>
        </div>
      )}
    </div>
  );
}
