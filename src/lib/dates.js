// ============================================================================
// Date Formatting Helpers
// Formats single dates and date ranges (e.g. "12.05.2026", "12-14.05.2026", "28.05-02.06.2026").
// ============================================================================

function pad(n) {
  return String(n).padStart(2, '0');
}

function shortYr(year) {
  return String(year).slice(-2);
}

/**
 * Formats event start date and optional end date into a compact or full date string.
 * Handles single-day events, same-month ranges, cross-month ranges, and cross-year ranges.
 */
export function formatEventDate(startDate, endDate = null, options = {}) {
  if (!startDate) return '';
  const dStart = new Date(startDate);
  if (Number.isNaN(dStart.getTime())) return '';

  const { mode = 'long' } = options;

  const startDay = pad(dStart.getUTCDate());
  const startMonth = pad(dStart.getUTCMonth() + 1);
  const startYear = dStart.getUTCFullYear();
  const startShortYear = shortYr(startYear);

  let dEnd = null;
  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (!Number.isNaN(parsedEnd.getTime())) {
      dEnd = parsedEnd;
    }
  }

  if (!dEnd || dEnd.getTime() === dStart.getTime()) {
    return mode === 'short'
      ? `${startDay}.${startMonth}.${startShortYear}`
      : `${startDay}.${startMonth}.${startYear}`;
  }

  const endDay = pad(dEnd.getUTCDate());
  const endMonth = pad(dEnd.getUTCMonth() + 1);
  const endYear = dEnd.getUTCFullYear();
  const endShortYear = shortYr(endYear);

  if (startMonth === endMonth && startYear === endYear) {
    if (startDay === endDay) {
      return mode === 'short'
        ? `${startDay}.${startMonth}.${startShortYear}`
        : `${startDay}.${startMonth}.${startYear}`;
    }
    return mode === 'short'
      ? `${startDay}-${endDay}.${endMonth}.${endShortYear}`
      : `${startDay}-${endDay}.${endMonth}.${endYear}`;
  }

  if (mode === 'short') {
    if (startYear === endYear) {
      return `${startDay}.${startMonth}-${endDay}.${endMonth}.${endShortYear}`;
    }
    return `${startDay}.${startMonth}.${startShortYear}-${endDay}.${endMonth}.${endShortYear}`;
  }

  if (startYear === endYear) {
    return `${startDay}.${startMonth}-${endDay}.${endMonth}.${endYear}`;
  }

  return `${startDay}.${startMonth}.${startYear}-${endDay}.${endMonth}.${endYear}`;
}
