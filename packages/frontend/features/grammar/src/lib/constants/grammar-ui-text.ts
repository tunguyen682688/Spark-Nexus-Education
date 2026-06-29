import { learningPathConstants } from './learning-path.constants';
import { lessonConstants } from './lesson.constants';
import { practiceConstants } from './practice.constants';
import { examConstants } from './exam.constants';
import { communityConstants } from './community.constants';
import { analyticsConstants } from './analytics.constants';
import { trapDiaryConstants } from './trap-diary.constants';

export const GRAMMAR_UI_TEXT = {
  ...examConstants,
  ...practiceConstants,
  ...analyticsConstants,
  ...learningPathConstants,
  ...lessonConstants,
  ...communityConstants,
  ...trapDiaryConstants,
};
