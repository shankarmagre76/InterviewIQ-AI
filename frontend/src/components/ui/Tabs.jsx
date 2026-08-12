import React, { useState } from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  children,
  className = '',
}) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id || 0);

  const currentTab = activeTab !== undefined ? activeTab : internalActive;

  const handleTabClick = (id) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalActive(id);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`.trim()}>
      {/* Tab Header Bar */}
      <div className="flex items-center gap-1 border-b border-slate-800/80 overflow-x-auto scrollbar-none pb-0.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={`
                px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer -mb-0.5
                ${isActive
                  ? 'border-indigo-500 text-indigo-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }
                disabled:opacity-40 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg
              `.trim()}
              role="tab"
              aria-selected={isActive}
            >
              {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span className="ml-1">{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Children */}
      {children && (
        <div className="w-full" role="tabpanel">
          {typeof children === 'function' ? children(currentTab) : children}
        </div>
      )}
    </div>
  );
};
