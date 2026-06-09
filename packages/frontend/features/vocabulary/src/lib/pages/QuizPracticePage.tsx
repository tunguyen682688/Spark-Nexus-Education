import { useParams } from 'react-router-dom';
import QuizPracticeContainer from '../container/QuizPracticeContainer';

const QuizPracticePage = () => {
  const { id } = useParams<{ id: string }>();

  return <QuizPracticeContainer setId={id ?? ''} />;
};

export default QuizPracticePage;
