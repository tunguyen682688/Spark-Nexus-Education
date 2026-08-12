export type { CertificateSectionTemplate, CertificateTypeTemplate } from './certificate-templates-types.constants';
export { TOEIC_TEMPLATE } from './certificate-templates-toeic.constants';
export { IELTS_TEMPLATE } from './certificate-templates-ielts.constants';
export { CAMBRIDGE_TEMPLATE } from './certificate-templates-cambridge.constants';
export { VSTEP_TEMPLATE } from './certificate-templates-vstep.constants';
export { TOEFL_TEMPLATE } from './certificate-templates-toefl.constants';
export { SAT_TEMPLATE } from './certificate-templates-sat.constants';

import { TOEIC_TEMPLATE } from './certificate-templates-toeic.constants';
import { IELTS_TEMPLATE } from './certificate-templates-ielts.constants';
import { CAMBRIDGE_TEMPLATE } from './certificate-templates-cambridge.constants';
import { VSTEP_TEMPLATE } from './certificate-templates-vstep.constants';
import { TOEFL_TEMPLATE } from './certificate-templates-toefl.constants';
import { SAT_TEMPLATE } from './certificate-templates-sat.constants';
import type { CertificateTypeTemplate } from './certificate-templates-types.constants';

export const CERTIFICATE_TYPE_TEMPLATES: Record<string, CertificateTypeTemplate> = {
  TOEIC: TOEIC_TEMPLATE,
  IELTS: IELTS_TEMPLATE,
  CAMBRIDGE: CAMBRIDGE_TEMPLATE,
  VSTEP: VSTEP_TEMPLATE,
  TOEFL: TOEFL_TEMPLATE,
  SAT: SAT_TEMPLATE,
};

export const CERTIFICATE_TYPE_OPTIONS = Object.values(CERTIFICATE_TYPE_TEMPLATES).map((t) => ({
  id: t.id,
  label: t.label,
  labelVi: t.labelVi,
  description: t.description,
}));
