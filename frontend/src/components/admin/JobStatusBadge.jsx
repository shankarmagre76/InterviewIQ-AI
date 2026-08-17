import React from 'react';
import { Badge } from '../ui/Badge.jsx';

/**
 * JobStatusBadge Component (F10.7)
 * Renders status badges for Job postings (Active, Draft, Paused, Closed, Expired).
 *
 * @param {Object} props
 * @param {string} props.status - Job status string
 * @param {string} [props.className=''] - Additional class names
 */
export const JobStatusBadge = ({ status = 'Active', className = '' }) => {
  const statusStr = String(status || 'Active').trim();
  const normalized = statusStr.toLowerCase();

  let variant = 'primary';
  if (normalized === 'active') variant = 'success';
  if (normalized === 'paused') variant = 'warning';
  if (normalized === 'closed' || normalized === 'expired') variant = 'danger';
  if (normalized === 'draft') variant = 'neutral';

  return (
    <Badge
      variant={variant}
      style="soft"
      size="sm"
      className={`text-[10px] uppercase font-bold ${className}`.trim()}
    >
      {statusStr}
    </Badge>
  );
};

export default JobStatusBadge;
