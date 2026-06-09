export function formatUserDisplay(
  userId?: string | null,
  creator?: { name?: string | null } | null
): string {
  if (creator && typeof creator.name === 'string' && creator.name.trim() !== '') {
    return creator.name;
  }
  if (!userId) return 'Unknown';
  const parts = userId.split('|');
  if (parts.length > 1) {
    return parts[1];
  }
  return userId;
}
