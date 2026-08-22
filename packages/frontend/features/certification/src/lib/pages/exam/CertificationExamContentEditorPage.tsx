import { useParams } from 'react-router-dom';
import { ExamContentEditorContainer } from '../../container/exam/ExamContentEditorContainer';

export const CertificationExamContentEditorPage = () => {
  const { examId } = useParams<{ examId: string }>();
  
  if (!examId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Không tìm thấy bài kiểm tra</p>
      </div>
    );
  }

  return <ExamContentEditorContainer examId={examId || ''} />;
};
