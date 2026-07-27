import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExamBuilderData } from './use-certification';

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

export function useExamBuilderContainerLogic() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const examId = id || 'toeic-practice-test-1';

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useExamBuilderData(examId);

  const [activeTab, setActiveTab] = useState<'Build' | 'Settings' | 'Review & Publish'>('Build');
  const [activeSubTab, setActiveSubTab] = useState<'Questions' | 'Instructions' | 'Timing'>('Questions');
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Settings State
  const [settings, setSettings] = useState<ExamSettingsForm>({
    title: 'TOEIC Practice Test 1',
    description:
      'A full-length TOEIC practice test for learners aiming to improve their listening, reading, speaking and writing skills.',
    level: 'Intermediate',
    language: 'English',
    passingScore: 550,
    maxScore: 990,
    createdDate: 'May 10, 2024 10:15 AM',
    lastUpdatedDate: 'May 16, 2024 02:45 PM',
  });

  // Sections State
  const [sections, setSections] = useState<BuilderSection[]>([
    {
      id: 'sec-1',
      number: 1,
      title: 'Listening',
      subtitle: 'Part 1 - 4',
      questionCount: 100,
      durationMinutes: 45,
      isBreak: false,
      questions: [
        {
          id: 'q-1',
          number: 1,
          title: 'Look at the picture and choose the best description.',
          partTag: 'Part 1',
          type: 'Single Choice',
          difficulty: 'Easy',
          points: 1,
          imageUrl:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop',
        },
        {
          id: 'q-2',
          number: 2,
          title: 'Listen and choose the correct response.',
          partTag: 'Part 2',
          type: 'Single Choice',
          difficulty: 'Easy',
          points: 1,
          imageUrl:
            'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=150&auto=format&fit=crop',
        },
        {
          id: 'q-3',
          number: 3,
          title: 'Listen to the conversation. What is the man asking about?',
          partTag: 'Part 3',
          type: 'Multiple Choice',
          difficulty: 'Medium',
          points: 1,
          imageUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
        },
        {
          id: 'q-4',
          number: 4,
          title: 'Listen to the talk. What is the purpose of the talk?',
          partTag: 'Part 4',
          type: 'Multiple Choice',
          difficulty: 'Medium',
          points: 1,
          imageUrl:
            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop',
        },
        {
          id: 'q-5',
          number: 5,
          title: 'Which word is closest in meaning to "essential"?',
          partTag: 'Part 5',
          type: 'Single Choice',
          difficulty: 'Hard',
          points: 1,
          imageUrl: null,
        },
      ],
    },
    {
      id: 'sec-2',
      number: 2,
      title: 'Reading',
      subtitle: 'Part 5 - 6',
      questionCount: 100,
      durationMinutes: 75,
      isBreak: false,
      questions: [],
    },
    {
      id: 'sec-3',
      number: 3,
      title: 'Break',
      subtitle: '10 minutes',
      questionCount: 0,
      durationMinutes: 10,
      isBreak: true,
      questions: [],
    },
    {
      id: 'sec-4',
      number: 4,
      title: 'Speaking',
      subtitle: 'Part 1 - 7',
      questionCount: 11,
      durationMinutes: 20,
      isBreak: false,
      questions: [],
    },
    {
      id: 'sec-5',
      number: 5,
      title: 'Writing',
      subtitle: 'Part 1 - 2',
      questionCount: 9,
      durationMinutes: 35,
      isBreak: false,
      questions: [],
    },
  ]);

  useEffect(() => {
    if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {
      const record = apiData as Record<string, unknown>;
      if (record['settings'] && typeof record['settings'] === 'object') {
        setSettings((prev) => ({ ...prev, ...(record['settings'] as Partial<ExamSettingsForm>) }));
      }
      if (record['sections'] && Array.isArray(record['sections'])) {
        setSections(record['sections'] as BuilderSection[]);
      }
    }
  }, [apiData]);

  // Active Selected Section
  const activeSection = useMemo(() => {
    return sections.find((sec) => sec.id === activeSectionId) || sections[0];
  }, [sections, activeSectionId]);

  // Filter questions by search query
  const filteredQuestions = useMemo(() => {
    if (!activeSection) return [];
    if (!searchQuery.trim()) return activeSection.questions;
    return activeSection.questions.filter(
      (q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.partTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeSection, searchQuery]);

  // Dynamic Blueprint & Totals Calculation
  const blueprint = useMemo(() => {
    let totalQuestions = 0;
    let totalTimeMinutes = 0;
    let totalPoints = 0;

    sections.forEach((sec) => {
      totalQuestions += sec.questions.length > 0 ? sec.questions.length : sec.questionCount;
      totalTimeMinutes += sec.durationMinutes;
      sec.questions.forEach((q) => {
        totalPoints += q.points;
      });
    });

    if (totalQuestions === 0) totalQuestions = 220;
    if (totalPoints === 0) totalPoints = 220;

    const hours = Math.floor(totalTimeMinutes / 60);
    const mins = totalTimeMinutes % 60;
    const durationText = `${hours}h ${mins}m`;

    return {
      totalQuestions,
      totalTimeMinutes,
      durationText,
      totalPoints,
    };
  }, [sections]);

  // Handlers
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

  const handleAddQuestionToSection = () => {
    if (!activeSection) return;
    const nextQNum = activeSection.questions.length + 1;
    const newQ: BuilderQuestion = {
      id: `q-${Date.now()}`,
      number: nextQNum,
      title: `New Question ${nextQNum}: Select the correct answer.`,
      partTag: `Part ${nextQNum}`,
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
              questions: [...sec.questions, newQ],
              questionCount: sec.questions.length + 1,
            }
          : sec
      )
    );
  };

  const handleRemoveQuestionFromSection = (qId: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === activeSectionId
          ? {
              ...sec,
              questions: sec.questions.filter((q) => q.id !== qId),
              questionCount: Math.max(0, sec.questions.length - 1),
            }
          : sec
      )
    );
  };

  const handleSaveDraft = () => {
    window.alert('Exam draft saved successfully!');
  };

  const handlePublishExam = () => {
    window.alert('Exam published successfully!');
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
