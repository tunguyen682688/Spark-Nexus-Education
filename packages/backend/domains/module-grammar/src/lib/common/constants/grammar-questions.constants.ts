/**
 * Kho câu hỏi mẫu dùng làm dữ liệu mặc định và dữ liệu thực hành.
 */

export const PRACTICE_QUESTIONS_POOL = [
  {
    id: 'pq-1',
    text: 'By the time the manager arrived, the secretary _____ all the documents.',
    type: 'MULTIPLE_CHOICE',
    category: 'tenses',
    level: 'B2',
    options: ['typed', 'was typing', 'had typed', 'has typed'],
    correctAnswer: 'had typed',
    optionExplanations: {
      'typed': 'Sai. Thì quá khứ đơn diễn tả hành động xảy ra tiếp nối. Ở đây, hành động gõ tài liệu đã hoàn tất trước khi quản lý đến.',
      'was typing': 'Sai. Thì quá khứ tiếp diễn dùng để chỉ hành động đang xảy ra tại thời điểm đó, không nhấn mạnh tính hoàn thành trước một mốc khác.',
      'had typed': 'Đúng! Quá khứ hoàn thành dùng để chỉ hành động xảy ra và hoàn tất trước một hành động khác trong quá khứ (\'arrived\').',
      'has typed': 'Sai. Thì hiện tại hoàn thành không được dùng trong mệnh đề đi kèm với quá khứ đơn (\'arrived\').'
    },
    explanation: 'Sử dụng thì Quá khứ hoàn thành (Past Perfect: had + V3) để chỉ một hành động đã hoàn tất trước một thời điểm hoặc một hành động khác trong quá khứ.'
  },
  {
    id: 'pq-2',
    text: 'Since she started her new job, she _____ (work) extremely hard.',
    type: 'FILL_IN_BLANK',
    category: 'tenses',
    level: 'B1',
    correctAnswer: 'has worked',
    explanation: 'Cấu trúc với \'Since\' chỉ mốc thời gian: Mệnh đề \'since\' dùng Quá khứ đơn, mệnh đề chính dùng Hiện tại hoàn thành (hoặc Hiện tại hoàn thành tiếp diễn) để chỉ hành động kéo dài từ quá khứ tới hiện tại.'
  },
  {
    id: 'pq-3',
    text: '',
    type: 'SENTENCE_REBUILDER',
    category: 'syntax',
    level: 'C1',
    words: ['hardly', 'had', 'she', 'sat', 'down', 'when', 'the', 'phone', 'rang'],
    correctAnswer: 'Hardly had she sat down when the phone rang',
    explanation: 'Cấu trúc đảo ngữ với \'Hardly ... when\': \'Hardly + had + S + V3/ed + when + S + V2/ed\' (Ngay khi... thì...). Chú ý đảo trợ động từ \'had\' lên trước chủ ngữ \'she\'.'
  },
  {
    id: 'pq-4',
    text: '_____ had the storm passed _____ the rescue teams began their work.',
    type: 'DRAG_DROP',
    category: 'syntax',
    level: 'B2',
    slots: ['No sooner', 'than'],
    words: ['No sooner', 'than', 'Hardly', 'when'],
    correctAnswer: '["No sooner", "than"]',
    explanation: 'Cấu trúc đảo ngữ \'No sooner ... than ...\' (Vừa mới... thì...). Không dùng \'Hardly\' với \'than\' vì \'Hardly\' chỉ đi kèm với \'when\'.'
  },
  {
    id: 'pq-5',
    text: 'The company\'s decision to downsize proved to be highly _____ to its reputation.',
    type: 'MULTIPLE_CHOICE',
    category: 'morphology',
    level: 'C1',
    options: ['damage', 'damaged', 'damaging', 'damageable'],
    correctAnswer: 'damaging',
    optionExplanations: {
      'damage': 'Sai. Đây là danh từ hoặc động từ nguyên mẫu, trong khi sau trạng từ \'highly\' và động từ nối \'proved to be\' ta cần một tính từ chỉ tính chất.',
      'damaged': 'Sai. Đây là phân từ quá khứ (V-ed) mang nghĩa bị động (bị phá hủy, bị tổn hại), không phù hợp để mô tả tính chất của quyết định.',
      'damaging': 'Đúng! Tính từ đuôi \'-ing\' mang nghĩa chủ động, chỉ bản chất gây hại, tổn hại đến danh tiếng (\'damaging to its reputation\').',
      'damageable': 'Sai. Đây là tính từ chỉ khả năng dễ bị làm tổn thương, không dùng cho cấu trúc gây tổn hại chủ động.'
    },
    explanation: 'Proved to be + adj. Dùng tính từ dạng chủ động \'-ing\' (damaging) để mô tả bản chất của hành động gây ra tổn thất.'
  },
  {
    id: 'pq-6',
    text: 'You _____ have washed the dishes; the housekeeper had already done them.',
    type: 'MULTIPLE_CHOICE',
    category: 'modality',
    level: 'B2',
    options: ['needn\'t', 'needn\'t have', 'mustn\'t', 'shouldn\'t'],
    correctAnswer: 'needn\'t have',
    optionExplanations: {
      'needn\'t': 'Sai. \'needn\'t\' chỉ đi trực tiếp với động từ nguyên mẫu (infinitive), không đứng trước phân từ quá khứ \'have washed\'.',
      'needn\'t have': 'Đúng! \'Needn\'t have + V3\' dùng để chỉ một hành động đã thực hiện trong quá khứ nhưng thực tế không cần thiết phải làm.',
      'mustn\'t': 'Sai. \'mustn\'t\' biểu thị sự cấm đoán, không phù hợp với ngữ cảnh \'người giúp việc đã làm rồi\'.',
      'shouldn\'t': 'Sai. \'shouldn\'t + have + V3\' biểu thị sự chỉ trích, trách móc vì đã làm điều lẽ ra không nên làm, sắc thái quá nặng so với hành động rửa bát.'
    },
    explanation: 'Sử dụng \'Needn\'t have + V3\' để diễn tả một hành động lẽ ra không cần phải làm nhưng đã làm trong quá khứ.'
  },
  {
    id: 'pq-7',
    text: 'It is vital that the project manager _____ all reports before the final deadline.',
    type: 'MULTIPLE_CHOICE',
    category: 'syntax',
    level: 'C2',
    options: ['approves', 'approve', 'approved', 'has approved'],
    correctAnswer: 'approve',
    optionExplanations: {
      'approves': 'Sai. Đây là động từ chia ở hiện tại đơn ngôi thứ ba số ít. Trong câu giả định sau \'vital that\', động từ phải ở dạng nguyên mẫu không chia.',
      'approve': 'Đúng! Cấu trúc giả định (Subjunctive Mood): \'It is vital/essential/necessary that + S + V (nguyên mẫu không chia)\'.',
      'approved': 'Sai. Không chia thì quá khứ trong mệnh đề giả định hiện tại.',
      'has approved': 'Sai. Không chia thì hiện tại hoàn thành trong mệnh đề giả định hiện tại.'
    },
    explanation: 'Thức giả định (Subjunctive Mood) bắt buộc dùng động từ nguyên thể không chia cho mọi ngôi sau các tính từ chỉ tầm quan trọng như vital, essential, imperative, necessary.'
  },
  {
    id: 'pq-8',
    text: 'She looks completely exhausted. She _____ (must / can\'t) have been working non-stop all day.',
    type: 'FILL_IN_BLANK',
    category: 'modality',
    level: 'B1',
    correctAnswer: 'must',
    explanation: 'Suy đoán logic ở quá khứ có độ chắc chắn cao: dùng \'must + have + V3\' (chắc hẳn là đã làm gì). Trái lại, \'can\'t + have + V3\' dùng để suy đoán một việc chắc chắn không xảy ra.'
  },
  {
    id: 'pq-9',
    text: 'Despite his _____ , his performance in the exam was quite _____ .',
    type: 'DRAG_DROP',
    category: 'morphology',
    level: 'B2',
    slots: ['inexperience', 'impressive'],
    words: ['inexperience', 'impressive', 'experience', 'impressed'],
    correctAnswer: '["inexperience", "impressive"]',
    explanation: 'Sau tính từ sở hữu \'his\' cần một danh từ (\'inexperience\' - sự thiếu kinh nghiệm). Vế sau miêu tả bài làm của anh ấy nên cần tính từ chỉ tính chất vật thể (\'impressive\' - ấn tượng). Cấu trúc \'Despite\' chỉ sự tương phản.'
  },
  {
    id: 'pq-10',
    text: '',
    type: 'SENTENCE_REBUILDER',
    category: 'syntax',
    level: 'B2',
    words: ['under', 'no', 'circumstances', 'should', 'you', 'press', 'this', 'red', 'button'],
    correctAnswer: 'Under no circumstances should you press this red button',
    explanation: 'Cấu trúc đảo ngữ với cụm từ phủ định đứng đầu câu: \'Under no circumstances + trợ động từ (should) + S + V\' (Trong bất kỳ hoàn cảnh nào cũng không được...).'
  },
  {
    id: 'pq-11',
    text: 'I will call you as soon as I _____ my graduation certificate next week.',
    type: 'MULTIPLE_CHOICE',
    category: 'tenses',
    level: 'B1',
    options: ['receive', 'will receive', 'received', 'am receiving'],
    correctAnswer: 'receive',
    optionExplanations: {
      'receive': 'Đúng! Trong các mệnh đề trạng ngữ chỉ thời gian (bắt đầu bằng as soon as, when, after, before, until) đi kèm mệnh đề chính ở tương lai đơn, ta dùng thì Hiện tại đơn.',
      'will receive': 'Sai. Không dùng thì tương lai đơn \'will\' trong các mệnh đề trạng ngữ chỉ thời gian.',
      'received': 'Sai. Thì quá khứ đơn không phù hợp với ngữ cảnh tương lai \'next week\'.',
      'am receiving': 'Sai. Thì hiện tại tiếp diễn không diễn tả sự việc xảy ra tiếp nối tức thì sau từ nối \'as soon as\'.'
    },
    explanation: 'Quy tắc phối thì: Trong mệnh đề trạng ngữ chỉ thời gian ở tương lai, động từ được chia ở thì Hiện tại đơn (Present Simple) để biểu đạt hành động tương lai.'
  },
  {
    id: 'pq-12',
    text: 'The manager highly praised the employee\'s _____ (profession) conduct.',
    type: 'FILL_IN_BLANK',
    category: 'morphology',
    level: 'A2',
    correctAnswer: 'professional',
    explanation: 'Đứng trước danh từ \'conduct\' (cách hành xử, tư cách) cần một tính từ để bổ nghĩa. Tính từ phát sinh từ danh từ \'profession\' là \'professional\' (chuyên nghiệp).'
  }
];

export const DAILY_QUIZ_POOL = [
  {
    id: 'dq-1',
    text: 'If she _____ harder, she would have passed the exam last week.',
    options: ['studied', 'had studied', 'would study', 'studies'],
    answer: 'had studied',
    explanation: 'Đây là câu điều kiện loại 3 (vế IF dùng Past Perfect) để diễn tả giả định trái ngược với quá khứ.'
  },
  {
    id: 'dq-2',
    text: 'He insists that his secretary _____ present at the formal board meeting.',
    options: ['is', 'be', 'was', 'should been'],
    answer: 'be',
    explanation: 'Cấu trúc giả định (Subjunctive Mood): Subject + insist + that + Subject + bare infinitive (be).'
  },
  {
    id: 'dq-3',
    text: 'I _____ in Hanoi for five years before I moved to Saigon in 2024.',
    options: ['lived', 'have lived', 'had lived', 'was living'],
    answer: 'had lived',
    explanation: 'Hành động sống ở Hà Nội kết thúc trước hành động chuyển vào Sài Gòn (quá khứ đơn), nên dùng Quá khứ hoàn thành.'
  },
  {
    id: 'dq-4',
    text: 'No sooner _____ the classroom than the bell rang.',
    options: ['had we entered', 'we entered', 'did we entered', 'had we enter'],
    answer: 'had we entered',
    explanation: 'Cấu trúc đảo ngữ với No sooner: No sooner + trợ động từ (had) + S + V3/ed + than + S + V2/ed.'
  },
  {
    id: 'dq-5',
    text: 'I would rather you _____ use native alerts in this React monorepo.',
    options: ['finish', 'finished', 'had finished', 'would finish'],
    answer: 'finished',
    explanation: 'Cấu trúc would rather ở hiện tại/tương lai đi kèm mệnh đề sau dùng Quá khứ đơn (giả định trái hiện tại).'
  }
];

export const SRS_QUIZ_POOL = [
  {
    id: 'srs-1',
    type: 'SENTENCE_BUILDER',
    question: 'Hãy sắp xếp các từ sau thành câu điều kiện loại 2 hoàn chỉnh:',
    words: ['If', 'I', 'were', 'you,', 'I', 'would', 'learn', 'grammar.'],
    answer: 'If I were you, I would learn grammar.',
    explanation: 'Câu điều kiện loại 2 diễn tả một giả định không có thật ở hiện tại. Cấu trúc: If + S + V2/ed (were), S + would + V-inf.',
  },
  {
    id: 'srs-2',
    type: 'ERROR_SPOTLIGHT',
    question: 'Tìm lỗi sai ngữ pháp trong câu dưới đây và sửa lại cho đúng:',
    sentence: 'She has been working here since five years now.',
    incorrectWord: 'since',
    correctWord: 'for',
    explanation: 'Khoảng thời gian (five years) đi kèm với giới từ "for", còn mốc thời gian mới đi kèm với "since".',
  },
  {
    id: 'srs-3',
    type: 'SENTENCE_BUILDER',
    question: 'Hãy sắp xếp các từ sau thành câu đảo ngữ hoàn chỉnh:',
    words: ['Hardly', 'had', 'she', 'arrived', 'when', 'it', 'rained.'],
    answer: 'Hardly had she arrived when it rained.',
    explanation: 'Cấu trúc đảo ngữ: Hardly + had + S + V3/ed + when + S + V2/ed (Ngay sau khi... thì...).',
  },
  {
    id: 'srs-4',
    type: 'ERROR_SPOTLIGHT',
    question: 'Tìm lỗi sai ngữ pháp trong câu dưới đây và sửa lại cho đúng:',
    sentence: 'No sooner did he left than the phone rang.',
    incorrectWord: 'left',
    correctWord: 'leave',
    explanation: 'Sau trợ động từ "did/does/do" trong câu đảo ngữ, động từ chính phải ở dạng nguyên mẫu (leave).',
  }
];
