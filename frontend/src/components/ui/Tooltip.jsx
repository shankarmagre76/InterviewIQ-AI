import React, { useState } from 'react';

const placementClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export const Tooltip = ({
  content,
  children,
  placement = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return <>{children}</>;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1 text-[11px] font-medium text-slate-100 bg-slate-900 border border-slate-700/80
            rounded-lg shadow-xl shadow-black/60 whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in
            ${placementClasses[placement] || placementClasses.top} ${className}
          `.trim()}
        >
          {content}
        </div>
      )}
    </div>
  );
};
