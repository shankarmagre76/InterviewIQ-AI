import React, { useState } from 'react';

const sizeClasses = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base font-bold',
};

const statusClasses = {
  online: 'bg-emerald-500 ring-slate-950',
  offline: 'bg-slate-500 ring-slate-950',
  away: 'bg-amber-500 ring-slate-950',
};

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initialText = getInitials(name);

  return (
    <div className="relative inline-block shrink-0 select-none">
      <div
        className={`
          rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 text-white font-bold flex items-center justify-center
          overflow-hidden border border-indigo-400/30 shadow-md ${sizeClasses[size] || sizeClasses.md} ${className}
        `.trim()}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initialText}</span>
        )}
      </div>

      {status && statusClasses[status] && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ${statusClasses[status]}`}
        />
      )}
    </div>
  );
};
