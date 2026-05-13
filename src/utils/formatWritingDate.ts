const writingDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** Display string for `WritingMeta.date` (ISO `YYYY-MM-DD`). */
export function formatWritingDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  const ms = Date.UTC(y, m - 1, d)
  if (Number.isNaN(ms)) return isoDate
  return writingDateFormatter.format(new Date(ms))
}
