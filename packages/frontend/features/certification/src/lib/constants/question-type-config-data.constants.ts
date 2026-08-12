import type { QuestionTypeCategory, QuestionTypeConfig } from '../types/question-type-config.types';

export const CATEGORY_LABELS: Record<QuestionTypeCategory, { label: string; labelVi: string; icon: string }> = {
  choice: { label: 'Multiple Choice', labelVi: 'Trắc nghiệm', icon: '📋' },
  input: { label: 'Input / Grid-In', labelVi: 'Tự điền', icon: '✏️' },
  'gap-fill': { label: 'Gap Fill / Completion', labelVi: 'Điền khuyết', icon: '📝' },
  matching: { label: 'Matching', labelVi: 'Ghép cặp', icon: '🔗' },
  writing: { label: 'Writing', labelVi: 'Viết', icon: '✍️' },
  speaking: { label: 'Speaking', labelVi: 'Nói', icon: '🎤' },
  media: { label: 'Media / Listening', labelVi: 'Nghe / Hình ảnh', icon: '🎧' },
};

export const TOEIC_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'single_choice', label: 'Single Choice (A/B/C/D)', labelVi: 'Trắc nghiệm 1 đáp án', category: 'choice', description: 'Standard multiple choice with one correct answer', minOptions: 2, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Enter option text...' },
  { id: 'photograph_choice', label: 'Photograph Description', labelVi: 'Mô tả hình ảnh', category: 'media', description: 'Part 1: Select statement that best describes the photograph', supportsImage: true, requiresCorrectAnswer: true, icon: '📸' },
  { id: 'question_response', label: 'Question-Response', labelVi: 'Hỏi - Đáp', category: 'choice', description: 'Part 2: Select best response to a question', minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true, placeholderText: 'Enter response option...' },
  { id: 'conversation_mc', label: 'Conversation Multiple Choice', labelVi: 'Nghe hội thoại trắc nghiệm', category: 'choice', description: 'Part 3: Listen to conversation and answer questions', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'short_talk_mc', label: 'Short Talk Multiple Choice', labelVi: 'Nghe bài nói ngắn trắc nghiệm', category: 'choice', description: 'Part 4: Listen to short talk and answer questions', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'incomplete_sentence', label: 'Incomplete Sentences', labelVi: 'Câu chưa hoàn chỉnh', category: 'gap-fill', description: 'Part 5: Complete the sentence with best option', minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Enter completion option...' },
  { id: 'text_completion', label: 'Text Completion', labelVi: 'Hoàn thiện đoạn văn', category: 'gap-fill', description: 'Part 6: Fill multiple blanks in a passage', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Enter completion option...' },
  { id: 'reading_comprehension', label: 'Reading Comprehension', labelVi: 'Đọc hiểu', category: 'choice', description: 'Part 7: Read passage and answer questions', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
];

export const IELTS_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'form_completion', label: 'Form / Note / Table Completion', labelVi: 'Điền vào bảng/form', category: 'gap-fill', description: 'Section 1: Complete forms, notes, tables from listening', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected answer...' },
  { id: 'map_labeling', label: 'Map / Plan / Diagram Labeling', labelVi: 'Gán nhãn sơ đồ/bản đồ', category: 'matching', description: 'Section 2: Label parts of a map, plan, or diagram', supportsImage: true, requiresCorrectAnswer: true, placeholderText: 'Enter label...', icon: '🗺️' },
  { id: 'matching', label: 'Matching', labelVi: 'Ghép cặp', category: 'matching', description: 'Match items (headings, features, sentence endings)', requiresCorrectAnswer: true, placeholderText: 'Enter match option...', icon: '🔗' },
  { id: 'multiple_choice_ielts', label: 'Multiple Choice (IELTS)', labelVi: 'Trắc nghiệm IELTS', category: 'choice', description: 'Standard IELTS multiple choice (A/B/C/D)', minOptions: 3, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'true_false_not_given', label: 'True / False / Not Given', labelVi: 'Đúng / Sai / Không có thông tin', category: 'choice', description: 'Reading: Determine if statement matches passage', minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true, placeholderText: 'Enter statement...' },
  { id: 'yes_no_not_given', label: 'Yes / No / Not Given', labelVi: 'Có / Không / Không có thông tin', category: 'choice', description: "Reading: Determine if statement agrees with author's views", minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true },
  { id: 'sentence_completion', label: 'Sentence / Summary Completion', labelVi: 'Hoàn thành câu/tóm tắt', category: 'gap-fill', description: 'Complete sentences or summaries from passage/listening', supportsAudio: true, supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected answer (max 3 words)...' },
  { id: 'short_answer', label: 'Short Answer Questions', labelVi: 'Câu hỏi trả lời ngắn', category: 'input', description: 'Answer questions in 1-3 words from passage/listening', supportsAudio: true, supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected answer...' },
  { id: 'matching_headings', label: 'Matching Headings', labelVi: 'Ghép tiêu đề', category: 'matching', description: 'Match headings to paragraphs/sections', supportsPassage: true, requiresCorrectAnswer: true, icon: '📑' },
  { id: 'writing_task_1', label: 'Writing Task 1 (Report)', labelVi: 'Viết Task 1 (Báo cáo)', category: 'writing', description: 'Describe visual data (graph, chart, diagram) - 150+ words', supportsImage: true, requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...', icon: '📊' },
  { id: 'writing_task_2', label: 'Writing Task 2 (Essay)', labelVi: 'Viết Task 2 (Luận văn)', category: 'writing', description: 'Essay response to opinion/argument - 250+ words', requiresCorrectAnswer: false, placeholderText: 'Enter model essay / criteria...', icon: '✍️' },
  { id: 'speaking_part_1', label: 'Speaking Part 1 (Interview)', labelVi: 'Nói Part 1 (Phỏng vấn)', category: 'speaking', description: 'Introduction & interview on familiar topics', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter sample questions / criteria...', icon: '🎤' },
  { id: 'speaking_part_2', label: 'Speaking Part 2 (Long Turn)', labelVi: 'Nói Part 2 (Bài nói dài)', category: 'speaking', description: 'Describe topic card - 1 min prep, 2 min talk', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter topic card / criteria...', icon: '🎤' },
  { id: 'speaking_part_3', label: 'Speaking Part 3 (Discussion)', labelVi: 'Nói Part 3 (Thảo luận)', category: 'speaking', description: 'Two-way discussion on abstract topics', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter discussion questions / criteria...', icon: '🎤' },
];

export const CAMBRIDGE_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'multiple_choice_cloze', label: 'Multiple Choice Cloze', labelVi: 'Điền khuyết trắc nghiệm', category: 'choice', description: 'Part 1: Choose correct word for each gap (8 gaps)', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'open_cloze', label: 'Open Cloze', labelVi: 'Điền khuyết tự do', category: 'gap-fill', description: 'Part 2: Fill each gap with ONE word (8 gaps)', supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected word...' },
  { id: 'word_formation', label: 'Word Formation', labelVi: 'Tạo từ', category: 'gap-fill', description: 'Part 3: Form word from root to fill gap (8 gaps)', supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter word form...' },
  { id: 'key_word_transformation', label: 'Key Word Transformation', labelVi: 'Chuyển đổi từ khóa', category: 'input', description: 'Part 4: Rewrite sentence using key word (6 questions)', requiresCorrectAnswer: false, placeholderText: 'Enter transformed sentence...' },
  { id: 'multiple_choice_reading', label: 'Reading Multiple Choice', labelVi: 'Đọc hiểu trắc nghiệm', category: 'choice', description: 'Part 5: Multiple choice reading comprehension (6 questions)', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'gapped_text', label: 'Gapped Text', labelVi: 'Điền đoạn văn', category: 'matching', description: 'Part 6: Insert sentences back into text (6-7 questions)', supportsPassage: true, requiresCorrectAnswer: true, icon: '📄' },
  { id: 'multiple_matching', label: 'Multiple Matching', labelVi: 'Ghép nhiều cặp', category: 'matching', description: 'Part 7: Match extracts to questions (10 questions)', supportsPassage: true, requiresCorrectAnswer: true, icon: '🔍' },
  { id: 'essay_writing', label: 'Essay Writing (Part 1)', labelVi: 'Viết bài luận (Part 1)', category: 'writing', description: 'Compulsory essay based on input text (220-260 words)', supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...' },
  { id: 'long_writing', label: 'Long Writing (Part 2)', labelVi: 'Viết bài dài (Part 2)', category: 'writing', description: 'Choice of tasks: letter, story, review (220-260 words)', requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...' },
  { id: 'listening_mc', label: 'Listening Multiple Choice', labelVi: 'Nghe trắc nghiệm', category: 'choice', description: 'Multiple choice from short monologues', supportsAudio: true, minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true },
  { id: 'sentence_completion_listening', label: 'Sentence Completion (Listening)', labelVi: 'Hoàn thành câu (Nghe)', category: 'gap-fill', description: 'Complete notes/sentences while listening', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected answer...' },
  { id: 'multiple_matching_listening', label: 'Multiple Matching (Listening)', labelVi: 'Ghép cặp (Nghe)', category: 'matching', description: 'Match speakers to topics/opinions', supportsAudio: true, requiresCorrectAnswer: true, icon: '🔗' },
  { id: 'speaking_interview', label: 'Speaking Interview', labelVi: 'Nói phỏng vấn', category: 'speaking', description: 'Part A: Personal questions about yourself', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter sample questions / criteria...', icon: '🎤' },
  { id: 'speaking_long_turn', label: 'Speaking Long Turn', labelVi: 'Nói bài dài', category: 'speaking', description: 'Part B: 1-minute talk about visual prompt', supportsImage: true, supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / criteria...', icon: '🎤' },
  { id: 'speaking_collaborative', label: 'Speaking Collaborative Task', labelVi: 'Nói thảo luận cộng tác', category: 'speaking', description: 'Part C: Discuss with partner, reach decision', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter task prompt / criteria...', icon: '🎤' },
  { id: 'speaking_discussion', label: 'Speaking Discussion', labelVi: 'Nói thảo luận mở rộng', category: 'speaking', description: 'Part D: Further discussion on abstract topics', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter discussion questions / criteria...', icon: '🎤' },
];

export const VSTEP_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'short_conv_mc', label: 'Short Conversations MC', labelVi: 'Hội thoại ngắn trắc nghiệm', category: 'choice', description: 'Part 1: Choose best response to short conversations', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'long_conv_mc', label: 'Long Conversations MC', labelVi: 'Hội thoại dài trắc nghiệm', category: 'choice', description: 'Part 2: Listen to long conversations and answer', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'short_talk_gap', label: 'Short Talks Gap Fill', labelVi: 'Bài nói ngắn điền khuyết', category: 'gap-fill', description: 'Part 3: Listen and fill in blanks', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter expected word/phrase...' },
  { id: 'lecture_mc', label: 'Lecture / Talk MC', labelVi: 'Bài giảng/bài nói trắc nghiệm', category: 'choice', description: 'Part 4: Listen to lecture and answer questions', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'factual_reading_mc', label: 'Factual Passage MC', labelVi: 'Đoạn văn thực tế trắc nghiệm', category: 'choice', description: 'Passage 1: Factual/socio-cultural reading', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'opinion_tfng', label: 'Opinion Passage T/F/NG', labelVi: 'Đoạn quan điểm Đúng/Sai/Không', category: 'choice', description: 'Passage 2: Opinion passage True/False/Not Given', supportsPassage: true, minOptions: 3, maxOptions: 3, requiresCorrectAnswer: true },
  { id: 'argument_matching', label: 'Argument Passage Matching', labelVi: 'Đoạn lập luận ghép cặp', category: 'matching', description: 'Passage 3: Matching questions', supportsPassage: true, requiresCorrectAnswer: true, icon: '🔗' },
  { id: 'email_writing', label: 'Email / Letter Writing', labelVi: 'Viết email/thư', category: 'writing', description: 'Task 1: Email/letter 150-180 words', requiresCorrectAnswer: false, placeholderText: 'Enter model answer / criteria...', icon: '📧' },
  { id: 'essay_writing_vstep', label: 'Essay Writing', labelVi: 'Viết bài luận', category: 'writing', description: 'Task 2: Argumentative essay 250-300 words', requiresCorrectAnswer: false, placeholderText: 'Enter model essay / criteria...', icon: '✍️' },
  { id: 'speaking_interview_vstep', label: 'Speaking Interview', labelVi: 'Nói phỏng vấn', category: 'speaking', description: 'Part 1: Introduce yourself, familiar topics', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter sample questions / criteria...', icon: '🎤' },
  { id: 'speaking_picture', label: 'Speaking Describe Picture', labelVi: 'Nói miêu tả hình ảnh', category: 'speaking', description: 'Part 2: Describe picture/topic card', supportsImage: true, supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter picture prompt / criteria...', icon: '🖼️' },
  { id: 'speaking_discussion_vstep', label: 'Speaking Discussion', labelVi: 'Nói thảo luận', category: 'speaking', description: 'Part 3: Abstract discussion related to Part 2', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter discussion questions / criteria...', icon: '🎤' },
];

export const TOEFL_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'reading_mc', label: 'Reading Multiple Choice', labelVi: 'Đọc trắc nghiệm', category: 'choice', description: 'Reading: Multiple choice from academic passages', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'listening_mc_toefl', label: 'Listening Multiple Choice', labelVi: 'Nghe trắc nghiệm', category: 'choice', description: 'Listening: Lectures & conversations MC', supportsAudio: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'speaking_independent', label: 'Speaking Independent Task', labelVi: 'Nói độc lập', category: 'speaking', description: 'Task 1: Express personal opinion (45 sec)', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / rubric...', icon: '🎤' },
  { id: 'speaking_integrated_rl', label: 'Speaking Integrated (Read+Listen)', labelVi: 'Nói tích hợp (Đọc+Nghe)', category: 'speaking', description: 'Task 2/3: Summarize reading+listening (60 sec)', supportsAudio: true, supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / rubric...', icon: '🎤' },
  { id: 'speaking_integrated_l', label: 'Speaking Integrated (Listen Only)', labelVi: 'Nói tích hợp (Chỉ nghe)', category: 'speaking', description: 'Task 4: Summarize lecture only (60 sec)', supportsAudio: true, requiresCorrectAnswer: false, placeholderText: 'Enter prompt / rubric...', icon: '🎤' },
  { id: 'writing_integrated', label: 'Writing Integrated', labelVi: 'Viết tích hợp', category: 'writing', description: 'Read + Listen + Write summary (150-225 words, 20 min)', supportsAudio: true, supportsPassage: true, requiresCorrectAnswer: false, placeholderText: 'Enter model answer / rubric...', icon: '✍️' },
  { id: 'writing_discussion', label: 'Writing Academic Discussion', labelVi: 'Viết thảo luận học thuật', category: 'writing', description: 'Contribute to online discussion (100+ words, 10 min)', requiresCorrectAnswer: false, placeholderText: 'Enter model answer / rubric...', icon: '💬' },
];

export const SAT_QUESTION_TYPES: QuestionTypeConfig[] = [
  { id: 'sat_reading_mc', label: 'Reading & Writing MC', labelVi: 'Đọc & Viết trắc nghiệm', category: 'choice', description: 'Adaptive: Reading comprehension + grammar MC', supportsPassage: true, minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true },
  { id: 'sat_math_mc', label: 'Math Multiple Choice', labelVi: 'Toán trắc nghiệm', category: 'choice', description: 'Algebra, problem-solving, data analysis, geometry', minOptions: 4, maxOptions: 4, requiresCorrectAnswer: true, placeholderText: 'Enter option...', icon: '🔢' },
  { id: 'sat_math_grid_in', label: 'Math Grid-In (Student Produced)', labelVi: 'Toán tự điền đáp án', category: 'input', description: 'Student-produced response (no options)', requiresCorrectAnswer: false, placeholderText: 'Enter expected numeric answer...', icon: '🔢' },
];
