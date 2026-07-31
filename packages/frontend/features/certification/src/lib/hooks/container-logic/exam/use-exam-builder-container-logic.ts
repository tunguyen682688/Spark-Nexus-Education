import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExamBuilderData, useUpdateExam } from '../../use-certification';
import type { ExamBuilderResponse, ExamSection, ExamQuestion } from '../../../types';

// ===== Types =====

export interface BuilderQuestion {
  id: string;
  number: number;
  title: string;
  partTag: string;
  type: 'Single Choice' | 'Multiple Choice' | 'Fill in Blank' | 'Essay';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  imageUrl?: string | null;
}

export interface BuilderSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  questionCount: number;
  durationMinutes: number;
  isBreak: boolean;
  questions: BuilderQuestion[];
}

export interface ExamSettingsForm {
  title: string;
  description: string;
  level: string;
  language: string;
  passingScore: number;
  maxScore: number;
  createdDate: string;
  lastUpdatedDate: string;
}

// ===== Mapping helpers =====

function mapQuestionType(apiType?: string): BuilderQuestion['type'] {
  switch (apiType) {
    case 'MULTIPLE_CHOICE':
      return 'Multiple Choice';
    case 'SHORT_ANSWER':
      return 'Fill in Blank';
    case 'SINGLE_CHOICE':
    default:
      return 'Single Choice';
  }
}

function mapExamQuestion(questionExam: ExamQuestion, index: number): BuilderQuestion {
  return {
    id: questionExam.id,
    number: index + 1,
    title: questionExam.questionText || questionExam.content || '',
    partTag: '',
    type: mapQuestionType(questionExam.questionType),
    difficulty: 'Medium',
    points: questionExam.points ?? 1,
    imageUrl: null,
  };
}

function mapApiSection(sectionExam: ExamSection, index: number): BuilderSection {
  const questions = (sectionExam.questions || []).map(mapExamQuestion);
  return {
    id: sectionExam.id,
    number: index + 1,
    title: sectionExam.title,
    subtitle: sectionExam.description || sectionExam.sectionType,
    questionCount: questions.length || 0,
    durationMinutes: sectionExam.durationMinutes || 0,
    isBreak: sectionExam.sectionType === 'BREAK',
    questions,
  };
}

// ===== Hook =====

export function useExamBuilderContainerLogic() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const examId = id || '';

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useExamBuilderData(examId);
  const updateExamMutation = useUpdateExam();

  const [activeTab, setActiveTab] = useState<'Build' | 'Settings' | 'Review & Publish'>('Build');
  const [activeSubTab, setActiveSubTab] = useState<'Questions' | 'Instructions' | 'Timing'>('Questions');
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [settings, setSettings] = useState<ExamSettingsForm>({
    title: '',
    description: '',
    level: '',
    language: 'English',
    passingScore: 0,
    maxScore: 0,
    createdDate: '',
    lastUpdatedDate: '',
  });

  const [sections, setSections] = useState<BuilderSection[]>([]);

  // Hydrate from API
  useEffect(() => {
    if (!apiData) return;

    const record = apiData as unknown as ExamBuilderResponse;
    if (record.settings) {
      setSettings({
        title: record.settings.title || record.title || '',
        description: record.settings.description || record.description || '',
        level: record.settings.difficulty || '',
        language: 'English',
        passingScore: record.settings.passingScore || record.passingScore || 0,
        maxScore: record.passingScore || 0,
        createdDate: '',
        lastUpdatedDate: '',
      });
    }
    if (record.sections && Array.isArray(record.sections)) {
      const mapped = record.sections.map(mapApiSection);
      setSections(mapped);
      if (mapped.length > 0 && !activeSectionId) {
        setActiveSectionId(mapped[0].id);
      }
    }
  }, [activeSectionId, apiData]);

  const activeSection = useMemo(() => {
    return sections.find((sec) => sec.id === activeSectionId) || sections[0];
  }, [sections, activeSectionId]);

  const filteredQuestions = useMemo(() => {
    if (!activeSection) return [];
    if (!searchQuery.trim()) return activeSection.questions;
    const query = searchQuery.toLowerCase();
    return activeSection.questions.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.partTag.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
  }, [activeSection, searchQuery]);

  const blueprint = useMemo(() => {
    let totalQuestions = 0;
    let totalTimeMinutes = 0;
    let totalPoints = 0;

    sections.forEach((sec) => {
      totalQuestions += sec.questions.length > 0 ? sec.questions.length : sec.questionCount;
      totalTimeMinutes += sec.durationMinutes;
      sec.questions.forEach((item) => {
        totalPoints += item.points;
      });
    });

    const hours = Math.floor(totalTimeMinutes / 60);
    const mins = totalTimeMinutes % 60;

    return {
      totalQuestions,
      totalTimeMinutes,
      durationText: `${hours}h ${mins}m`,
      totalPoints,
    };
  }, [sections]);

  // ===== Section CRUD =====

  const handleAddSection = () => {
    const nextNum = sections.length + 1;
    const newSec: BuilderSection = {
      id: `sec-${Date.now()}`,
      number: nextNum,
      title: `Section ${nextNum}`,
      subtitle: 'Custom Part',
      questionCount: 0,
      durationMinutes: 30,
      isBreak: false,
      questions: [],
    };
    setSections((prev) => [...prev, newSec]);
    setActiveSectionId(newSec.id);
  };

  const handleUpdateActiveSectionTitle = (newTitle: string) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === activeSectionId ? { ...sec, title: newTitle } : sec))
    );
  };

  // ===== Question CRUD =====

  const handleAddQuestionToSection = () => {
    if (!activeSection) return;
    const nextQNum = activeSection.questions.length + 1;
    const newQuestion: BuilderQuestion = {
      id: `q-${Date.now()}`,
      number: nextQNum,
      title: `New Question ${nextQNum}`,
      partTag: '',
      type: 'Single Choice',
      difficulty: 'Easy',
      points: 1,
      imageUrl: null,
    };

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === activeSectionId
          ? {
              ...sec,
              questions: [...sec.questions, newQuestion],
              questionCount: sec.questions.length + 1,
            }
          : sec
      )
    );
  };

  const handleRemoveQuestionFromSection = (questionId: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === activeSectionId
          ? {
              ...sec,
              questions: sec.questions.filter((question) => question.id !== questionId),
              questionCount: Math.max(0, sec.questions.length - 1),
            }
          : sec
      )
    );
  };

  // ===== Exam actions =====

  const handleSaveDraft = () => {
    if (!examId) return;
    updateExamMutation.mutate({ examId, collectionId: '', publishStatus: 'draft', silent: true });
  };

  const handlePublishExam = () => {
    if (!examId) return;
    updateExamMutation.mutate({ examId, collectionId: '', publishStatus: 'published' });
  };

  const handlePreviewExam = () => {
    navigate(`/certification/exams/${examId}`);
  };

  const handleEditQuestion = (questionId: string) => {
    navigate(`/certification/exam-builder/${examId}/question-builder/${questionId}`);
  };

  const handleBackToExams = () => {
    navigate('/certification/creator-dashboard');
  };

  return {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    activeSubTab,
    setActiveSubTab,
    activeSectionId,
    setActiveSectionId,
    activeSection,
    sections,
    settings,
    setSettings,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredQuestions,
    blueprint,
    handleAddSection,
    handleUpdateActiveSectionTitle,
    handleAddQuestionToSection,
    handleRemoveQuestionFromSection,
    handleSaveDraft,
    handlePublishExam,
    handlePreviewExam,
    handleEditQuestion,
    handleBackToExams,
  };
}
