import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <table className={`w-full text-left text-sm text-slate-300 border-collapse ${className}`.trim()} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`.trim()} {...props}>
      {children}
    </thead>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-5 py-3.5 ${className}`.trim()} {...props}>
      {children}
    </th>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-800/60 ${className}`.trim()} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', hover = true, ...props }) => {
  return (
    <tr
      className={`
        transition-colors
        ${hover ? 'hover:bg-slate-800/50' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-5 py-4 whitespace-nowrap text-sm ${className}`.trim()} {...props}>
      {children}
    </td>
  );
};
