import React from 'react';
import { Pagination } from '../ui/Pagination.jsx';

/**
 * UserPagination Component (F10.4)
 * Wraps design system Pagination for Admin User Management.
 *
 * @param {Object} props
 * @param {Object} props.pagination - { page, limit, total, totalPages }
 * @param {Function} props.onPageChange - Page change callback
 */
export const UserPagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <Pagination
      currentPage={pagination.page || 1}
      totalPages={pagination.totalPages || 1}
      totalItems={pagination.total || 0}
      onPageChange={onPageChange}
      className="mt-4"
    />
  );
};

export default UserPagination;
