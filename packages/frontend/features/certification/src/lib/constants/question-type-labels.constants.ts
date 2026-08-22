// ─── Question Type Labels ────────────────────────────────────────────────────
// Shared constant for question type display labels. Used by FlatListEditor and QuestionInlineEditor.

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  photograph_choice: 'Mô tả ảnh',
  question_response: 'Hỏi & Đáp',
  conversation_mc: 'Hội thoại MC',
  short_talk_mc: 'Bài nói MC',
  incomplete_sentence: 'Hoàn thành câu',
  text_completion: 'Điền đoạn văn',
  reading_comprehension_single: 'Đọc đơn',
  reading_comprehension_double: 'Đọc kép',
  reading_comprehension_triple: 'Đọc ba',
  form_completion: 'Điền form',
  matching: 'Ghép cặp',
  matching_headings: 'Ghép tiêu đề',
  true_false_not_given: 'Đ/S/KG',
  yes_no_not_given: 'C/K/KG',
  sentence_completion: 'Hoàn thành câu',
  note_completion: 'Điền ghi chú',
  map_labeling: 'Gán nhãn sơ đồ',
  mc: 'Trắc nghiệm',
  writing_task_1_academic: 'Viết Task 1',
  writing_task_2: 'Viết Task 2',
  email_writing: 'Viết email',
  essay_writing_vstep: 'Viết bài luận',
  essay_writing: 'Viết bài luận',
  long_writing: 'Viết dài',
  speaking_part_1: 'Nói Part 1',
  speaking_part_2: 'Nói Part 2',
  speaking_part_3: 'Nói Part 3',
  speaking_interview: 'Phỏng vấn',
  speaking_picture: 'Miêu tả ảnh',
  speaking_discussion_vstep: 'Thảo luận',
  speaking_long_turn: 'Nói dài',
  speaking_collaborative: 'Thảo luận cộng tác',
  speaking_discussion: 'Thảo luận',
  short_conv_mc: 'Hội thoại ngắn MC',
  long_conv_mc: 'Hội thoại dài MC',
  short_talk_gap: 'Điền khuyết',
  lecture_mc: 'Bài giảng MC',
  factual_reading_mc: 'Đọc thực tế MC',
  opinion_tfng: 'Quan điểm Đ/S/KG',
  argument_matching: 'Ghép lập luận',
  multiple_choice_cloze: 'Điền khuyết MC',
  open_cloze: 'Điền khuyết tự do',
  word_formation: 'Tạo từ',
  key_word_transformation: 'Chuyển đổi từ khóa',
  multiple_choice_reading: 'Đọc MC',
  gapped_text: 'Điền đoạn văn',
  multiple_matching: 'Ghép nhiều',
  listening_mc: 'Nghe MC',
  sentence_completion_listening: 'Hoàn thành câu (Nghe)',
  multiple_matching_listening: 'Ghép cặp (Nghe)',
  speaking_interview_vstep: 'Phỏng vấn',
};

export const SECTION_ICONS: Record<string, string> = {
  listening: '🎧',
  reading: '📖',
  writing: '✍️',
  speaking: '🗣️',
  break: '☕',
};

export function getQuestionTypeLabel(typeId: string): string {
  return QUESTION_TYPE_LABELS[typeId] || typeId;
}

export function getSectionIcon(type: string): string {
  return SECTION_ICONS[type] || '📄';
}
