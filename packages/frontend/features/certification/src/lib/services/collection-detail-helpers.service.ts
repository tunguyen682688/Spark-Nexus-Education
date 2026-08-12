export const formatField = (value: string | number | undefined, fallback = '\u2014'): string =>
  value !== undefined && value !== null && value !== '' ? String(value) : fallback;
