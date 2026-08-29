import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none rounded-lg";
  
  const variants = {
    primary: "bg-navy-600 text-white hover:bg-navy-700 focus:ring-navy-500",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700",
    danger: "bg-red-600/10 text-red-500 hover:bg-red-600/20 focus:ring-red-500 border border-red-500/20",
    ghost: "text-slate-300 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
