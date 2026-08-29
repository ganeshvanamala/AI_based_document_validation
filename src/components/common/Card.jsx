import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, ...props }) {
  return (
    <div className={twMerge("bg-slate-900 border border-slate-800 rounded-xl shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={twMerge("px-6 py-4 border-b border-slate-800", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={twMerge("text-lg font-medium text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={twMerge("p-6", className)} {...props}>
      {children}
    </div>
  );
}
