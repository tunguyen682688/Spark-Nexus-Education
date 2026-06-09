export const grammarKeys = {
  root: ['grammar'] as const,
  roadmap: () => [...grammarKeys.root, 'roadmap'] as const,
} as const;
