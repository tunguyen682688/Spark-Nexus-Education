import type { UserGrammarTrap } from '../types';

export const TRAP_CATEGORIES = [
  {
    key: 'syntax',
    label: 'Cú pháp',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    fullLabel: 'Cú pháp (Syntax)',
  },
  {
    key: 'tenses',
    label: 'Thì & Động từ',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    fullLabel: 'Thì & Sự hòa hợp (Tenses)',
  },
  {
    key: 'morphology',
    label: 'Hình thái từ',
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    fullLabel: 'Hình thái học (Morphology)',
  },
  {
    key: 'modality',
    label: 'Sắc thái',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    fullLabel: 'Sắc thái giả định (Modality)',
  },
] as const;

export const TRAP_STATUSES = [
  {
    key: 'ALL',
    label: 'Tất Cả Trạng Thái',
    activeClass: 'bg-indigo-500/10 border border-indigo-500/35 text-indigo-400',
  },
  {
    key: 'TRAPPED',
    label: '🕸️ Đang Vướng',
    activeClass: 'bg-indigo-500/10 border border-indigo-500/35 text-indigo-400',
  },
  {
    key: 'BROKEN',
    label: '⚔️ Đã Phá',
    activeClass: 'bg-indigo-500/10 border border-indigo-500/35 text-indigo-400',
  },
] as const;
