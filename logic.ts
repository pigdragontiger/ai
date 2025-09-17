

import type { EducationLevelId, EngineerLevelId } from './types';

// 대한민국 SW기술자 등급산정 기준표 기반 로직
// 정보처리기사 자격증 보유는 별도 조건이나, 여기서는 학력과 경력만으로 간소화하여 계산.
// Updated to match the provided salary table image.
export const calculateEngineerLevel = (
  years: number,
  education: EducationLevelId | null
): EngineerLevelId => {
  if (!education) return 'beginner';

  switch (education) {
    case 'master':
      if (years >= 10) return 'expert';
      if (years >= 7) return 'advanced';
      if (years >= 4) return 'intermediate';
      return 'beginner';

    case 'bachelor':
      if (years >= 13) return 'expert';
      if (years >= 10) return 'advanced';
      if (years >= 7) return 'intermediate';
      return 'beginner';

    case 'associate':
      if (years >= 16) return 'expert';
      if (years >= 13) return 'advanced';
      if (years >= 10) return 'intermediate';
      return 'beginner';

    case 'highschool':
      if (years >= 19) return 'expert'; // 19 years and up
      if (years >= 16) return 'advanced'; // 16-18 years
      if (years >= 13) return 'intermediate'; // 13-15 years
      return 'beginner'; // 1-12 years

    default:
      return 'beginner';
  }
};