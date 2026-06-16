export const EXPLORE_DATA = {
  LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  KEYWORDS: ['Biến đổi khí hậu', 'Học máy', 'Triết học', 'Kinh tế học'],
  SAVED_FILTERS: [
    { label: 'Tin công nghệ (B2)' },
    { label: 'Văn học C1-C2' },
  ],
  TOP_CONTRIBUTORS: [
    { initials: 'EC', name: 'TS. Emily Chen', count: 142 },
    { initials: 'MJ', name: 'Marcus Johnson', count: 88 },
    { initials: 'SL', name: 'Sarah Lin', count: 76 },
  ],
  CATEGORIES: ['Technology', 'Science', 'Business', 'Arts', 'Education', 'Environment'],
  READ_TIMES: ['< 5 phút', '5-10 phút', '> 10 phút'],
};

export const ACADEMIC_DATA = {
  LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  DISCIPLINES: [
    { label: 'Khoa học máy tính', value: 'Comp Sci' },
    { label: 'Khoa học thần kinh', value: 'Neuroscience' },
    { label: 'Lịch sử', value: 'History' },
    { label: 'Vật lý', value: 'Physics' },
    { label: 'Triết học', value: 'Philosophy' }
  ],
};

export const ARTICLE_CATEGORIES = [
  { label: 'All', value: 'ALL' },
  { label: 'Technology', value: 'technology' },
  { label: 'Science', value: 'science' },
  { label: 'Literature', value: 'literature' },
  { label: 'Business', value: 'business' },
];

export const READING_TIPS = [
  {
    title: 'Skimming vs. Scanning',
    content:
      'Skim the title, summary, and first sentences of each paragraph to grab the main context quickly. Scan only for specific numbers, names, or keywords when answering comprehension questions.',
  },
  {
    title: 'Active Vocabulary Guessing',
    content:
      'When encountering unfamiliar words, try to guess their meaning using context clues (synonyms, antonyms, or examples in surrounding sentences) before checking the dictionary.',
  },
  {
    title: 'Annotating Text Structure',
    content:
      "Notice structural markers like 'furthermore', 'however', and 'consequently'. These transition words indicate shifts in arguments or details, which is highly useful for comprehension.",
  },
  {
    title: 'Tracking Main Ideas',
    content:
      'After reading each section, summarize it in a single phrase. This keeps you actively engaged and improves long-term recall of scientific and technical papers.',
  },
  {
    title: 'Targeted Time Management',
    content:
      'Spend 2-3 minutes previewing the whole article first, and set a specific goal (e.g., 5 minutes for reading, 5 minutes for answering quiz questions) to improve speed and focus.',
  },
];

export const CEFR_BENCHMARKS = [
  { level: 'A1', wpm: '80 - 120', length: '100 - 300 words' },
  { level: 'A2', wpm: '120 - 150', length: '300 - 600 words' },
  { level: 'B1', wpm: '150 - 200', length: '600 - 1000 words' },
  { level: 'B2', wpm: '200 - 250', length: '1000 - 2000 words' },
  { level: 'C1', wpm: '250 - 300', length: '2000 - 3000 words' },
  { level: 'C2', wpm: '300+', length: '3000+ words' },
];
