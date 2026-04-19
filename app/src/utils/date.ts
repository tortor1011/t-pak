/**
 * Format date to display format
 */
export function formatDate(dateStr: string, language: 'th' | 'en' = 'en'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateStr: string, language: 'th' | 'en' = 'en'): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (language === 'th') {
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return formatDate(dateStr, language);
  }

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateStr, language);
}

/**
 * Get current month/year string
 */
export function getCurrentMonthYear(language: 'th' | 'en' = 'en'): string {
  const now = new Date();
  return now.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}
