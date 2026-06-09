import { useMemo } from 'react';
import { useGrammarRoadmap } from './use-grammar-lessons';
import { useUserGrammarCertificates } from './use-grammar-exams';
import { useGrammarTraps } from './use-grammar-traps';

export function useGrammarUserProfile() {
  const { data: roadmap, isLoading: loadingRoadmap } = useGrammarRoadmap();
  const { data: certificates, isLoading: loadingCerts } = useUserGrammarCertificates();
  const { data: traps, isLoading: loadingTraps } = useGrammarTraps();

  const brokenTrapsCount = useMemo(() => {
    if (!traps) return 0;
    return traps.filter((t) => t.status === 'BROKEN').length;
  }, [traps]);

  const skillData = useMemo(() => {
    if (!roadmap?.skills) {
      return [
        { name: 'Cú pháp', value: 0 },
        { name: 'Thì', value: 0 },
        { name: 'Sắc thái', value: 0 },
        { name: 'Hình thái', value: 0 },
      ];
    }
    return roadmap.skills;
  }, [roadmap]);

  const isLoading = loadingRoadmap || loadingCerts || loadingTraps;

  const {
    currentXP = 0,
    streakDays = 0,
    completedLessons = 0,
    totalLessons = 0,
    percentComplete = 0,
  } = roadmap || {};

  return {
    isLoading,
    currentXP,
    streakDays,
    completedLessons,
    totalLessons,
    percentComplete,
    brokenTrapsCount,
    skillData,
    certificates,
  };
}
