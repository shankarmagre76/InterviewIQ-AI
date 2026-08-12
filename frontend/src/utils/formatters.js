export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
};

export const formatPercent = (value, total = 100) => {
  if (value === undefined || value === null) return '0%';
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
};

export const getScoreBadgeVariant = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};
