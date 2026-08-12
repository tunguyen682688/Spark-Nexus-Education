export * from './filter-options.constants';
export * from './certificate-templates.constants';

import { CERTIFICATION_UI_TEXT as Common } from './ui-text-common.constants';
import { CERTIFICATION_UI_TEXT as Browse } from './ui-text-browse.constants';
import { CERTIFICATION_UI_TEXT as Collection } from './ui-text-collection.constants';
import { CERTIFICATION_UI_TEXT as Exam } from './ui-text-exam.constants';
import { CERTIFICATION_UI_TEXT as Learning } from './ui-text-learning.constants';
import { CERTIFICATION_UI_TEXT as Creator } from './ui-text-creator.constants';
import { CERTIFICATION_UI_TEXT as Editor } from './ui-text-editor.constants';

export const CERTIFICATION_UI_TEXT = {
  ...Common,
  ...Browse,
  ...Collection,
  ...Exam,
  ...Learning,
  ...Creator,
  ...Editor,
} as const;

export type CertificationUIText = typeof CERTIFICATION_UI_TEXT;
