import React from 'react';

export const PageHeader = ({
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/60 ${className}`.trim()}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
      </div>

      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
