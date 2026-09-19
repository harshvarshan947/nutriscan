export function formatNumber(val: number | undefined, decimals = 1): string {
  if (val === undefined || isNaN(val)) return '0';
  return Number(val.toFixed(decimals)).toString();
}

export function formatDate(timestampOrStr: number | string): string {
  const date = typeof timestampOrStr === 'string' ? new Date(timestampOrStr) : new Date(timestampOrStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
