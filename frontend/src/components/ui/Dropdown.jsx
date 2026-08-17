import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute ${alignClasses} mt-2 w-56 rounded-xl glass-panel shadow-2xl shadow-black/70 border border-slate-700/60
            py-1.5 z-40 focus:outline-none ${className}
          `.trim()}
          role="menu"
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="my-1 border-t border-slate-800" />;
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`
                  w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer
                  ${item.danger
                    ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }
                  disabled:opacity-40 disabled:cursor-not-allowed
                `.trim()}
                role="menuitem"
              >
                {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="ml-auto">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
