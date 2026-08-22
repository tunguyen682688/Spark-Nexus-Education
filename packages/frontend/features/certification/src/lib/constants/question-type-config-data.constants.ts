import type { QuestionTypeCategory, QuestionTypeConfig, SkillGroup } from '../types/question-type-config.types';

export const CATEGORY_LABELS: Record<QuestionTypeCategory, { label: string; labelVi: string; icon: string }> = {
  choice: { label: 'Multiple Choice', labelVi: 'Trắc nghiệm', icon: '📋' },
  input: { label: 'Input / Grid-In', labelVi: 'Tự điền', icon: '✏️' },
  'gap-fill': { label: 'Gap Fill / Completion', labelVi: 'Điền khuyết', icon: '📝' },
  matching: { label: 'Matching', labelVi: 'Ghép cặp', icon: '🔗' },
  writing: { label: 'Writing', labelVi: 'Viết', icon: '✍️' },
  speaking: { label: 'Speaking', labelVi: 'Nói', icon: '🎤' },
};

export const SKILL_GROUP_LABELS: Record<SkillGroup, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
  'all-skills': 'All Skills',
};

export const TOEIC_QUESTION_TYPES: QuestionTypeConfig[] = [
  // ─── PART 1: Photographs ────────────────────────────────────────────────
  // 4 photographs, select the statement that best describes each
  // Skills: Listening | Questions: 6 | Time: ~30 sec each
  { id: 'photograph_choice', label: 'Part 1 — Photograph Description', labelVi: 'Phần 1 — Mô tả hình ảnh', category: 'choice', skillGroup: 'listening', description: 'Chọn câu mô tả đúng nhất cho bức ảnh (4 lựa chọn A/B/C/D)', supportsImage: true, supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, icon: '📸', partNumber: 1 },

  // ─── PART 2: Question-Response ──────────────────────────────────────────
  // Hear a question, select the best response
  // Skills: Listening | Questions: 25 | Time: ~5 sec each
  { id: 'question_response', label: 'Part 2 — Question-Response', labelVi: 'Phần 2 — Hỏi và Đáp', category: 'choice', skillGroup: 'listening', description: 'Nghe câu hỏi, chọn câu trả lời phù hợp nhất (3 lựa chọn A/B/C)', supportsAudio: true, minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true, placeholderText: 'Nhập lựa chọn trả lời...', icon: '❓', partNumber: 2 },

  // ─── PART 3: Conversations ──────────────────────────────────────────────
  // Short conversations (2 speakers), answer 3 questions each
  // Skills: Listening | Questions: 13 conversations × 3 = 39 | Time: ~40 sec each
  { id: 'conversation_mc', label: 'Part 3 — Conversation (3 Questions)', labelVi: 'Phần 3 — Hội thoại (3 câu hỏi)', category: 'choice', skillGroup: 'listening', description: 'Nghe hội thoại ngắn (2 người), trả lời 3 câu hỏi trắc nghiệm mỗi hội thoại', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, isMultiQuestion: true, maxQuestionsPerPassage: 3, icon: '💬', partNumber: 3 },

  // ─── PART 4: Short Talks ────────────────────────────────────────────────
  // Short monologues/talks, answer 3 questions each
  // Skills: Listening | Questions: 10 talks × 3 = 30 | Time: ~30 sec each
  { id: 'short_talk_mc', label: 'Part 4 — Short Talk (3 Questions)', labelVi: 'Phần 4 — Bài nói ngắn (3 câu hỏi)', category: 'choice', skillGroup: 'listening', description: 'Nghe bài nói ngắn (1 người), trả lời 3 câu hỏi trắc nghiệm mỗi bài', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, isMultiQuestion: true, maxQuestionsPerPassage: 3, icon: '📢', partNumber: 4 },

  // ─── PART 5: Incomplete Sentences ──────────────────────────────────────
  // Single sentences with a blank, choose best completion
  // Skills: Reading | Questions: 30 | Time: ~30 sec each
  { id: 'incomplete_sentence', label: 'Part 5 — Incomplete Sentences', labelVi: 'Phần 5 — Câu chưa hoàn chỉnh', category: 'choice', skillGroup: 'reading', description: 'Hoàn thành câu bằng cách chọn từ/cụm từ phù hợp nhất (4 lựa chọn A/B/C/D)', minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Nhập lựa chọn hoàn thành...', icon: '📝', partNumber: 5 },

  // ─── PART 6: Text Completion ───────────────────────────────────────────
  // Passage with 3-4 blanks, each blank has 4 options
  // Skills: Reading | Questions: 4 passages × 3-4 blanks = ~16 | Time: ~5 min each
  { id: 'text_completion', label: 'Part 6 — Text Completion (Passage)', labelVi: 'Phần 6 — Hoàn thiện đoạn văn', category: 'gap-fill', skillGroup: 'reading', description: 'Điền vào 3-4 chỗ trống trong đoạn văn (mỗi chỗ 4 lựa chọn A/B/C/D)', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Nhập lựa chọn hoàn thành...', isMultiQuestion: true, maxBlanksPerPassage: 4, icon: '📄', partNumber: 6 },

  // ─── PART 7: Single Passages ───────────────────────────────────────────
  // Single reading passage with 2-5 questions
  // Skills: Reading | Questions: 10 passages × 2-5 = ~34 | Time: ~8 min each
  { id: 'reading_comprehension_single', label: 'Part 7 — Single Passage', labelVi: 'Phần 7 — Đoạn văn đơn', category: 'choice', skillGroup: 'reading', description: 'Đọc 1 đoạn văn, trả lời 2-5 câu hỏi trắc nghiệm', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, isMultiQuestion: true, maxQuestionsPerPassage: 5, icon: '📖', partNumber: 7 },

  // ─── PART 7: Double Passages ──────────────────────────────────────────
  // 2 related passages with 5 questions
  // Skills: Reading | Questions: 2 double passages × 5 = 10 | Time: ~10 min each
  { id: 'reading_comprehension_double', label: 'Part 7 — Double Passages', labelVi: 'Phần 7 — Đoạn văn kép', category: 'choice', skillGroup: 'reading', description: 'Đọc 2 đoạn văn liên quan, trả lời 5 câu hỏi trắc nghiệm', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, isMultiQuestion: true, maxQuestionsPerPassage: 5, icon: '📖📖', partNumber: 7 },

  // ─── PART 7: Triple Passages ─────────────────────────────────────────
  // 3 related passages with 5 questions (including cross-reference questions)
  // Skills: Reading | Questions: 3 triple passages × 5 = 15 | Time: ~10 min each
  { id: 'reading_comprehension_triple', label: 'Part 7 — Triple Passages', labelVi: 'Phần 7 — Đoạn văn ba', category: 'choice', skillGroup: 'reading', description: 'Đọc 3 đoạn văn liên quan, trả lời 5 câu hỏi trắc nghiệm (có câu hỏi cross-reference)', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, isMultiQuestion: true, maxQuestionsPerPassage: 5, icon: '📖📖📖', partNumber: 7 },
];

export const IELTS_QUESTION_TYPES: QuestionTypeConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // IELTS LISTENING: 4 Sections, 40 questions, ~30 minutes
  // Each section = 1 audio + multiple sub-questions
  // ═══════════════════════════════════════════════════════════════════════

  // ─── SECTION 1: Everyday Social Context (2 speakers, 10 questions) ────
  // Conversation: booking, directions, arrangements
  // Question types: Form Completion, MC, Matching
  { id: 'ielts_listening_section_1', label: 'Listening Section 1', labelVi: 'Nghe Section 1 — Hội thoại', category: 'gap-fill', skillGroup: 'listening', isMultiQuestion: true, maxQuestionsPerPassage: 10, supportsAudio: true, description: 'Section 1: Hội thoại 2 người về bối cảnh hàng ngày (đặt phòng, chỉ đường, sắp xếp). 10 câu hỏi.', icon: '🎧', partNumber: 1, subQuestionTypes: ['form_completion', 'mc', 'matching'] },

  // ─── SECTION 2: Everyday Social Context - Monologue (10 questions) ────
  // Speech, announcement, tour guide
  // Question types: MC, Matching, Map/Plan Labeling, Sentence Completion
  { id: 'ielts_listening_section_2', label: 'Listening Section 2', labelVi: 'Nghe Section 2 — Bài nói ngắn', category: 'gap-fill', skillGroup: 'listening', isMultiQuestion: true, maxQuestionsPerPassage: 10, supportsAudio: true, supportsImage: true, description: 'Section 2: Bài nói ngắn 1 người (bài phát biểu, thông báo, hướng dẫn viên). 10 câu hỏi.', icon: '🗣️', partNumber: 2, subQuestionTypes: ['mc', 'matching', 'map_labeling', 'sentence_completion'] },

  // ─── SECTION 3: Educational Context (2-4 speakers, 10 questions) ─────
  // Tutor + students academic discussion
  // Question types: MC, Matching, Sentence Completion
  { id: 'ielts_listening_section_3', label: 'Listening Section 3', labelVi: 'Nghe Section 3 — Thảo luận học thuật', category: 'gap-fill', skillGroup: 'listening', isMultiQuestion: true, maxQuestionsPerPassage: 10, supportsAudio: true, description: 'Section 3: Thảo luận học thuật 2-4 người (giảng viên + sinh viên). 10 câu hỏi.', icon: '🎓', partNumber: 3, subQuestionTypes: ['mc', 'matching', 'sentence_completion'] },

  // ─── SECTION 4: Academic Context - Lecture (10 questions) ─────────────
  // Academic lecture/monologue
  // Question types: MC, Matching, Sentence Completion, Note Completion
  { id: 'ielts_listening_section_4', label: 'Listening Section 4', labelVi: 'Nghe Section 4 — Bài giảng', category: 'gap-fill', skillGroup: 'listening', isMultiQuestion: true, maxQuestionsPerPassage: 10, supportsAudio: true, description: 'Section 4: Bài giảng học thuật 1 người. 10 câu hỏi.', icon: '📚', partNumber: 4, subQuestionTypes: ['mc', 'matching', 'sentence_completion', 'note_completion'] },

  // ═══════════════════════════════════════════════════════════════════════
  // IELTS READING: 3 Passages, 40 questions, 60 minutes
  // Each passage = 1 text + multiple sub-questions
  // ═══════════════════════════════════════════════════════════════════════

  // ─── PASSAGE 1: Academic Topic (13-14 questions) ──────────────────────
  // Complex academic text, most difficult
  // Question types: MC, T/F/NG, Y/N/NG, Matching Headings, Sentence Completion
  { id: 'ielts_reading_passage_1', label: 'Reading Passage 1', labelVi: 'Đọc Passage 1 — Học thuật', category: 'choice', skillGroup: 'reading', isMultiQuestion: true, maxQuestionsPerPassage: 14, supportsPassage: true, description: 'Passage 1: Đoạn văn học thuật phức tạp. 13-14 câu hỏi.', icon: '📖', subQuestionTypes: ['mc', 'true_false_not_given', 'yes_no_not_given', 'matching_headings', 'sentence_completion'] },

  // ─── PASSAGE 2: Academic Topic (13-14 questions) ──────────────────────
  // Complex academic text
  // Question types: MC, T/F/NG, Matching Information, Matching Endings, Note/Diagram Completion
  { id: 'ielts_reading_passage_2', label: 'Reading Passage 2', labelVi: 'Đọc Passage 2 — Học thuật', category: 'choice', skillGroup: 'reading', isMultiQuestion: true, maxQuestionsPerPassage: 14, supportsPassage: true, description: 'Passage 2: Đoạn văn học thuật phức tạp. 13-14 câu hỏi.', icon: '📖', subQuestionTypes: ['mc', 'true_false_not_given', 'matching_information', 'matching_endings', 'note_diagram_completion'] },

  // ─── PASSAGE 3: Academic Topic (13-14 questions) ──────────────────────
  // Complex academic text, may include diagrams/charts
  // Question types: MC, T/F/NG, Y/N/NG, Matching Headings, Short Answer, Note/Diagram Completion
  { id: 'ielts_reading_passage_3', label: 'Reading Passage 3', labelVi: 'Đọc Passage 3 — Học thuật', category: 'choice', skillGroup: 'reading', isMultiQuestion: true, maxQuestionsPerPassage: 14, supportsPassage: true, description: 'Passage 3: Đoạn văn học thuật phức tạp (có thể có biểu đồ/sơ đồ). 13-14 câu hỏi.', icon: '📖', subQuestionTypes: ['mc', 'true_false_not_given', 'yes_no_not_given', 'matching_headings', 'short_answer', 'note_diagram_completion'] },

  // ═══════════════════════════════════════════════════════════════════════
  // IELTS WRITING: 2 Tasks, 60 minutes
  // ═══════════════════════════════════════════════════════════════════════

  // ─── TASK 1: Report (Academic) / Letter (General Training) ───────────
  { id: 'writing_task_1_academic', label: 'Writing Task 1 — Report (Academic)', labelVi: 'Viết Task 1 — Báo cáo (Academic)', category: 'writing', skillGroup: 'writing', description: 'Mô tả dữ liệu hình ảnh (biểu đồ, sơ đồ, bảng) — tối thiểu 150 từ (15-20 phút)', supportsImage: true, requiresCorrectAnswer: false, placeholderText: 'Nhập đáp án mẫu / tiêu chí chấm điểm...', icon: '📊', wordLimit: 150 },

  { id: 'writing_task_1_general', label: 'Writing Task 1 — Letter (General Training)', labelVi: 'Viết Task 1 — Thư (General Training)', category: 'writing', skillGroup: 'writing', description: 'Viết thư theo yêu cầu (formal/semi-formal/informal) — tối thiểu 150 từ (20 phút)', requiresCorrectAnswer: false, placeholderText: 'Nhập đáp án mẫu / tiêu chí chấm điểm...', icon: '📧', wordLimit: 150 },

  // ─── TASK 2: Essay (Both Academic & General) ──────────────────────────
  { id: 'writing_task_2', label: 'Writing Task 2 — Essay', labelVi: 'Viết Task 2 — Luận văn', category: 'writing', skillGroup: 'writing', description: 'Viết luận về quan điểm/argument — tối thiểu 250 từ (40 phút)', requiresCorrectAnswer: false, placeholderText: 'Nhập bài luận mẫu / tiêu chí chấm điểm...', icon: '✍️', wordLimit: 250 },

  // ═══════════════════════════════════════════════════════════════════════
  // IELTS SPEAKING: 3 Parts, 11-14 minutes
  // ═══════════════════════════════════════════════════════════════════════

  // ─── PART 1: Introduction & Interview ─────────────────────────────────
  { id: 'speaking_part_1', label: 'Speaking Part 1 — Interview', labelVi: 'Nói Part 1 — Phỏng vấn', category: 'speaking', skillGroup: 'speaking', description: 'Giới thiệu và phỏng vấn về các chủ đề quen thuộc (nhà cửa, công việc, sở thích)', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Nhập câu hỏi mẫu / tiêu chí đánh giá...', icon: '🎤', timeLimitSeconds: 60 },

  // ─── PART 2: Long Turn (Cue Card) ────────────────────────────────────
  { id: 'speaking_part_2', label: 'Speaking Part 2 — Long Turn (Cue Card)', labelVi: 'Nói Part 2 — Bài nói dài (Thẻ chủ đề)', category: 'speaking', skillGroup: 'speaking', description: 'Nói về chủ đề trên thẻ trong 2 phút (1 phút chuẩn bị), sau đó trả lời câu hỏi bổ sung', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Nhập thẻ chủ đề / tiêu chí đánh giá...', icon: '📋', timeLimitSeconds: 120 },

  // ─── PART 3: Discussion ───────────────────────────────────────────────
  { id: 'speaking_part_3', label: 'Speaking Part 3 — Discussion', labelVi: 'Nói Part 3 — Thảo luận', category: 'speaking', skillGroup: 'speaking', description: 'Thảo luận sâu hơn về chủ đề liên quan đến Part 2 (quan điểm trừu tượng)', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Nhập câu hỏi thảo luận / tiêu chí đánh giá...', icon: '💭', timeLimitSeconds: 90 },
];

export const CAMBRIDGE_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'multiple_choice_cloze', label: 'Multiple Choice Cloze', labelVi: 'Điền khuyết trắc nghiệm', category: 'choice', skillGroup: 'reading', description: 'Part 1: Choose correct word for each gap (8 gaps)', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'open_cloze', label: 'Open Cloze', labelVi: 'Điền khuyết tự do', category: 'gap-fill', skillGroup: 'reading', description: 'Part 2: Fill each gap with ONE word (8 gaps)', supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected word...' },
  { id: 'word_formation', label: 'Word Formation', labelVi: 'Tạo từ', category: 'gap-fill', skillGroup: 'reading', description: 'Part 3: Form word from root to fill gap (8 gaps)', supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter word form...' },
  { id: 'key_word_transformation', label: 'Key Word Transformation', labelVi: 'Chuyển đổi từ khóa', category: 'input', skillGroup: 'reading', description: 'Part 4: Rewrite sentence using key word (6 questions)', requiresCorrectAnswer: false, placeholderText: 'Enter transformed sentence...' },
  { id: 'multiple_choice_reading', label: 'Reading Multiple Choice', labelVi: 'Đọc hiểu trắc nghiệm', category: 'choice', skillGroup: 'reading', description: 'Part 5: Multiple choice reading comprehension (6 questions)', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'gapped_text', label: 'Gapped Text', labelVi: 'Điền đoạn văn', category: 'matching', skillGroup: 'reading', description: 'Part 6: Insert sentences back into text (6-7 questions)', supportsPassage: true, requiresCorrectAnswer: true, icon: '📄' },
  { id: 'multiple_matching', label: 'Multiple Matching', labelVi: 'Ghép nhiều cặp', category: 'matching', skillGroup: 'reading', description: 'Part 7: Match extracts to questions (10 questions)', supportsPassage: true, requiresCorrectAnswer: true, icon: '🔍' },
  { id: 'essay_writing', label: 'Essay Writing (Part 1)', labelVi: 'Viết bài luận (Part 1)', category: 'writing', skillGroup: 'writing', description: 'Compulsory essay based on input text (220-260 words)', supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...', wordLimit: 220 },
  { id: 'long_writing', label: 'Long Writing (Part 2)', labelVi: 'Viết bài dài (Part 2)', category: 'writing', skillGroup: 'writing', description: 'Choice of tasks: letter, story, review (220-260 words)', requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...', wordLimit: 220 },
  { id: 'listening_mc', label: 'Listening Multiple Choice', labelVi: 'Nghe trắc nghiệm', category: 'choice', skillGroup: 'listening', description: 'Multiple choice from short monologues', supportsAudio: true, minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true },
  { id: 'sentence_completion_listening', label: 'Sentence Completion (Listening)', labelVi: 'Hoàn thành câu (Nghe)', category: 'gap-fill', skillGroup: 'listening', description: 'Complete notes/sentences while listening', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected answer...' },
  { id: 'multiple_matching_listening', label: 'Multiple Matching (Listening)', labelVi: 'Ghép cặp (Nghe)', category: 'matching', skillGroup: 'listening', description: 'Match speakers to topics/opinions', supportsAudio: true, requiresCorrectAnswer: true, icon: '🔗' },
  { id: 'speaking_interview', label: 'Speaking Interview', labelVi: 'Nói phỏng vấn', category: 'speaking', skillGroup: 'speaking', description: 'Part A: Personal questions about yourself', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter sample questions / criteria...', icon: '🎤', timeLimitSeconds: 60 },
  { id: 'speaking_long_turn', label: 'Speaking Long Turn', labelVi: 'Nói bài dài', category: 'speaking', skillGroup: 'speaking', description: 'Part B: 1-minute talk about visual prompt', supportsImage: true, supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / criteria...', icon: '🎤', timeLimitSeconds: 120 },
  { id: 'speaking_collaborative', label: 'Speaking Collaborative Task', labelVi: 'Nói thảo luận cộng tác', category: 'speaking', skillGroup: 'speaking', description: 'Part C: Discuss with partner, reach decision', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter task prompt / criteria...', icon: '🎤', timeLimitSeconds: 120 },
  { id: 'speaking_discussion', label: 'Speaking Discussion', labelVi: 'Nói thảo luận mở rộng', category: 'speaking', skillGroup: 'speaking', description: 'Part D: Further discussion on abstract topics', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter discussion questions / criteria...', icon: '🎤', timeLimitSeconds: 90 },
];

export const VSTEP_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'short_conv_mc', label: 'Short Conversations MC', labelVi: 'Hội thoại ngắn trắc nghiệm', category: 'choice', skillGroup: 'listening', description: 'Part 1: Choose best response to short conversations', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'long_conv_mc', label: 'Long Conversations MC', labelVi: 'Hội thoại dài trắc nghiệm', category: 'choice', skillGroup: 'listening', description: 'Part 2: Listen to long conversations and answer', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'short_talk_gap', label: 'Short Talks Gap Fill', labelVi: 'Bài nói ngắn điền khuyết', category: 'gap-fill', skillGroup: 'listening', description: 'Part 3: Listen and fill in blanks', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected word/phrase...' },
  { id: 'lecture_mc', label: 'Lecture / Talk MC', labelVi: 'Bài giảng/bài nói trắc nghiệm', category: 'choice', skillGroup: 'listening', description: 'Part 4: Listen to lecture and answer questions', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'factual_reading_mc', label: 'Factual Passage MC', labelVi: 'Đoạn văn thực tế trắc nghiệm', category: 'choice', skillGroup: 'reading', description: 'Passage 1: Factual/socio-cultural reading', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'opinion_tfng', label: 'Opinion Passage T/F/NG', labelVi: 'Đoạn quan điểm Đúng/Sai/Không', category: 'choice', skillGroup: 'reading', description: 'Passage 2: Opinion passage True/False/Not Given', supportsPassage: true, minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true, fixedOptions: ['True', 'False', 'Not Given'] },
  { id: 'argument_matching', label: 'Argument Passage Matching', labelVi: 'Đoạn lập luận ghép cặp', category: 'matching', skillGroup: 'reading', description: 'Passage 3: Matching questions', supportsPassage: true, requiresCorrectAnswer: true, icon: '🔗' },
  { id: 'email_writing', label: 'Email / Letter Writing', labelVi: 'Viết email/thư', category: 'writing', skillGroup: 'writing', description: 'Task 1: Email/letter 150-180 words', requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...', icon: '📧', wordLimit: 150 },
  { id: 'essay_writing_vstep', label: 'Essay Writing', labelVi: 'Viết bài luận', category: 'writing', skillGroup: 'writing', description: 'Task 2: Argumentative essay 250-300 words', requiresCorrectAnswer: false, placeholderText: 'Enter model essay / criteria...', icon: '✍️', wordLimit: 250 },
  { id: 'speaking_interview_vstep', label: 'Speaking Interview', labelVi: 'Nói phỏng vấn', category: 'speaking', skillGroup: 'speaking', description: 'Part 1: Introduce yourself, familiar topics', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter sample questions / criteria...', icon: '🎤', timeLimitSeconds: 60 },
  { id: 'speaking_picture', label: 'Speaking Describe Picture', labelVi: 'Nói miêu tả hình ảnh', category: 'speaking', skillGroup: 'speaking', description: 'Part 2: Describe picture/topic card', supportsImage: true, supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter picture prompt / criteria...', icon: '🖼️', timeLimitSeconds: 90 },
  { id: 'speaking_discussion_vstep', label: 'Speaking Discussion', labelVi: 'Nói thảo luận', category: 'speaking', skillGroup: 'speaking', description: 'Part 3: Abstract discussion related to Part 2', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter discussion questions / criteria...', icon: '🎤', timeLimitSeconds: 90 },
];

export const TOEFL_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'reading_mc', label: 'Reading Multiple Choice', labelVi: 'Đọc trắc nghiệm', category: 'choice', skillGroup: 'reading', description: 'Reading: Multiple choice from academic passages', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'listening_mc_toefl', label: 'Listening Multiple Choice', labelVi: 'Nghe trắc nghiệm', category: 'choice', skillGroup: 'listening', description: 'Listening: Lectures & conversations MC', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'speaking_independent', label: 'Speaking Independent Task', labelVi: 'Nói độc lập', category: 'speaking', skillGroup: 'speaking', description: 'Task 1: Express personal opinion (45 sec)', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / rubric...', icon: '🎤', timeLimitSeconds: 45 },
  { id: 'speaking_integrated_rl', label: 'Speaking Integrated (Read+Listen)', labelVi: 'Nói tích hợp (Đọc+Nghe)', category: 'speaking', skillGroup: 'speaking', description: 'Task 2/3: Summarize reading+listening (60 sec)', supportsAudio: true, supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / rubric...', icon: '🎤', timeLimitSeconds: 60 },
  { id: 'speaking_integrated_l', label: 'Speaking Integrated (Listen Only)', labelVi: 'Nói tích hợp (Chỉ nghe)', category: 'speaking', skillGroup: 'speaking', description: 'Task 4: Summarize lecture only (60 sec)', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / rubric...', icon: '🎤', timeLimitSeconds: 60 },
  { id: 'writing_integrated', label: 'Writing Integrated', labelVi: 'Viết tích hợp', category: 'writing', skillGroup: 'writing', description: 'Read + Listen + Write summary (150-225 words, 20 min)', supportsAudio: true, supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter model answer / rubric...', icon: '✍️', wordLimit: 150 },
  { id: 'writing_discussion', label: 'Writing Academic Discussion', labelVi: 'Viết thảo luận học thuật', category: 'writing', skillGroup: 'writing', description: 'Contribute to online discussion (100+ words, 10 min)', requiresCorrectAnswer: false, placeholderText: 'Enter model answer / rubric...', icon: '💬', wordLimit: 100 },
];

export const SAT_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'sat_reading_mc', label: 'Reading & Writing MC', labelVi: 'Đọc & Viết trắc nghiệm', category: 'choice', skillGroup: 'reading', description: 'Adaptive: Reading comprehension + grammar MC', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'sat_math_mc', label: 'Math Multiple Choice', labelVi: 'Toán trắc nghiệm', category: 'choice', skillGroup: 'all-skills', description: 'Algebra, problem-solving, data analysis, geometry', minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Enter option...', icon: '🔢' },
  { id: 'sat_math_grid_in', label: 'Math Grid-In (Student Produced)', labelVi: 'Toán tự điền đáp án', category: 'input', skillGroup: 'all-skills', description: 'Student-produced response (no options)', requiresCorrectAnswer: false, placeholderText: 'Enter expected numeric answer...', icon: '🔢' },
];
