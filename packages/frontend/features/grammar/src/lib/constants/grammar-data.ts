import { GrammarBlock } from '../types';

export const MOCK_LEADERBOARD = [
  {
    rank: 1,
    name: 'Alex Johnson',
    score: '100%',
    time: '2m 14s',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    medal: '💎',
  },
  {
    rank: 2,
    name: 'Emily Stone',
    score: '100%',
    time: '2m 45s',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
    medal: '🥇',
  },
  {
    rank: 3,
    name: 'David Miller',
    score: '90%',
    time: '1m 58s',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
    medal: '🥈',
  },
];

export const TRENDING_TAGS = [
  'Tenses',
  'Inversion',
  'Conditionals',
  'RelativeClauses',
  'PassiveVoice',
  'Modals',
];

export const SUGGESTED_FORMULA_ELEMENTS = [
  { label: 'Subject', value: '[Subject]', color: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20 hover:bg-emerald-500/20' },
  { label: 'Verb', value: 'verb', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
  { label: 'Object', value: '[Object]', color: 'bg-amber-500/10 text-amber-450 border-amber-500/20 hover:bg-amber-500/20' },
  { label: 'have / has', value: 'have / has', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' },
  { label: 'Past Simple', value: 'Past Simple', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20' },
  { label: 'V3 / V-ed', value: 'Past Participle (V3)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' },
  { label: 'would', value: 'would', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20' },
  { label: '+', value: '+', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20' },
  { label: ',', value: ',', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20' },
];

export const POST_TEMPLATES = [
  {
    name: 'Câu Điều Kiện Loại 3 vs Loại 2',
    title: 'Phân biệt nhanh "Conditional Type 2" và "Type 3" cực dễ nhớ',
    tags: ['Conditionals', 'GrammarTips', 'CEFR_B2'],
    blocks: [
      {
        id: 'block-text-cond-1',
        type: 'text' as const,
        content: '### Phân biệt câu điều kiện loại 2 & loại 3\n\nChào mọi người, hôm nay mình chia sẻ một mẹo nhỏ để phân biệt câu điều kiện loại 2 (giả định ở hiện tại) và loại 3 (giả định ở quá khứ).\n\n- **Loại 2**: Giả định điều không có thật ở hiện tại/tương lai.\n  *Ví dụ: If I were rich now, I would buy a sports car.*\n- **Loại 3**: Giả định điều không có thật trong quá khứ.\n  *Ví dụ: If I had studied harder last night, I would have passed the exam today.*',
        blockLabel: 'Lý thuyết cơ bản'
      },
      {
        id: 'block-formula-cond-1',
        type: 'formula' as const,
        elements: ['[If]', '+', 'S', '+', 'had + V3/ed', ',', 'S', '+', 'would have + V3/ed'],
        note: 'Công thức câu điều kiện loại 3',
        blockLabel: 'Công thức câu'
      },
      {
        id: 'block-example-cond-1',
        type: 'example' as const,
        items: [
          {
            text: 'If I had not missed the bus, I would not have been late.',
            explanation: 'Sự thật trong quá khứ: Tôi đã bỏ lỡ xe bus và đã bị muộn.'
          }
        ],
        blockLabel: 'Ví dụ minh họa'
      },
      {
        id: 'block-quiz-cond-1',
        type: 'quiz' as const,
        quizType: 'SENTENCE_BUILDER',
        question: 'Sắp xếp các từ thành câu điều kiện loại 3 chuẩn xác:',
        words: ['If', 'I', 'had', 'not', 'missed', 'the', 'bus', 'I', 'would', 'not', 'have', 'been', 'late'],
        answer: 'If I had not missed the bus I would not have been late',
        explanation: 'Cấu trúc câu điều kiện loại 3 dạng phủ định: If + S + had not + V3, S + would not have + V3. Ý nghĩa: "Nếu tôi đã không bỏ lỡ chuyến xe bus, tôi đã không bị muộn."',
        blockLabel: 'Bài tập sắp xếp'
      }
    ] as GrammarBlock[]
  },
  {
    name: 'Bẫy Đảo Ngữ Ngữ Pháp TOEIC',
    title: 'Tuyệt chiêu xử lý nhanh Đảo Ngữ với các Trạng từ Phủ định',
    tags: ['Inversion', 'TOEIC', 'IELTS'],
    blocks: [
      {
        id: 'block-text-inv-1',
        type: 'text' as const,
        content: '### Đảo ngữ với Trạng từ phủ định\n\nĐảo ngữ (Inversion) là một chủ đề siêu hot và thường xuất hiện làm bẫy trong kỳ thi TOEIC / IELTS.\n\nKhi các cụm từ phủ định (Never, Seldom, Rarely, Hardly, Under no circumstances) đứng đầu câu, chúng ta phải **ĐẢO TRỢ ĐỘNG TỪ** lên trước chủ ngữ.',
        blockLabel: 'Quy tắc đảo ngữ'
      },
      {
        id: 'block-formula-inv-1',
        type: 'formula' as const,
        elements: ['Trạng từ phủ định', '+', 'Trợ động từ', '+', 'S', '+', 'V-chính'],
        note: 'Cấu trúc tổng quát',
        blockLabel: 'Cấu trúc công thức'
      },
      {
        id: 'block-callout-inv-1',
        type: 'callout' as const,
        title: 'ACADEMIC INSIGHT: ĐẢO NGỮ QUÁ KHỨ HOÀN THÀNH',
        content: 'Cấu trúc: Hardly / Scarcely + had + S + V3 + when + S + V2/ed.\nVí dụ: Hardly had we entered the house when it started to rain.',
        blockLabel: 'Mẹo nâng cao'
      },
      {
        id: 'block-quiz-inv-1',
        type: 'quiz' as const,
        quizType: 'MULTIPLE_CHOICE',
        question: 'Chọn phương án đúng hoàn thành câu sau: "Rarely _______ such a brilliant performance."',
        options: ['we saw', 'did we see', 'we did see', 'have we saw'],
        answer: 'did we see',
        explanation: 'Vì trạng từ phủ định "Rarely" đứng đầu câu, ta bắt buộc phải đảo trợ động từ lên trước chủ ngữ. Phương án đúng đảo trợ động từ quá khứ đơn "did we see". Các phương án còn lại đều sai cấu trúc đảo ngữ.',
        blockLabel: 'Câu hỏi trắc nghiệm'
      }
    ] as GrammarBlock[]
  },
  {
    name: 'Lỗi Sai Phổ Biến "Since vs For"',
    title: 'Sửa lỗi sai kinh điển giữa "Since" và "For" trong Thì Hoành Thành',
    tags: ['Tenses', 'CommonMistakes', 'CEFR_A2'],
    blocks: [
      {
        id: 'block-text-since-1',
        type: 'text' as const,
        content: '### Khi nào dùng Since & For?\n\nChắc hẳn rất nhiều bạn vẫn còn nhầm lẫn khi dùng "Since" và "For" đối với thì Hiện tại hoàn thành (Present Perfect).\n\nQuy tắc cực đơn giản:\n- **Since** + Mốc thời gian (như 2010, Monday, last night, I was a child).\n- **For** + Khoảng thời gian (như 5 years, a long time, 2 hours).',
        blockLabel: 'Mẹo phân biệt'
      },
      {
        id: 'block-example-since-1',
        type: 'example' as const,
        items: [
          {
            text: 'I have studied here since 2020.',
            explanation: '2020 là mốc thời gian cụ thể.'
          },
          {
            text: 'I have studied here for 6 years.',
            explanation: '6 years là khoảng thời gian.'
          }
        ],
        blockLabel: 'Ví dụ phân biệt'
      },
      {
        id: 'block-quiz-since-1',
        type: 'quiz' as const,
        quizType: 'ERROR_SPOTLIGHT',
        question: 'Tìm từ viết sai giới từ trong câu dưới đây và gõ từ sửa lại đúng:',
        sentence: 'She has been learning the piano since five years now.',
        incorrectWord: 'since',
        correctWord: 'for',
        answer: 'for',
        explanation: '"five years" là một khoảng thời gian, do đó ta bắt buộc phải sử dụng giới từ "for" thay vì "since". Cấu trúc sửa đổi: since -> for.',
        blockLabel: 'Tìm lỗi sai ngữ pháp'
      }
    ] as GrammarBlock[]
  }
];
