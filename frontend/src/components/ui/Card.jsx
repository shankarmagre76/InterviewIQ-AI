import React from 'react';

const variantClasses = {
  default: 'bg-slate-900/90 border border-slate-800/80 shadow-lg shadow-black/40',
  glass: 'glass-panel shadow-xl shadow-black/40',
  elevated: 'bg-slate-850 border border-slate-700/60 shadow-2xl shadow-indigo-950/20',
  interactive: 'glass-panel-interactive shadow-lg shadow-black/40 cursor-pointer',
};

export const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${variantClasses[variant] || variantClasses.default} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-5 border-b border-slate-800/60 flex flex-col gap-1.5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', as: Tag = 'h3', ...props }) => {
  return (
    <Tag className={`text-lg font-bold text-slate-100 tracking-tight flex items-center justify-between ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-slate-400 font-normal leading-relaxed ${className}`.trim()} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between gap-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
