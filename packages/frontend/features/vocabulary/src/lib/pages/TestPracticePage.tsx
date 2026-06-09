import { useParams } from 'react-router-dom';
import TestPracticeContainer from '../container/TestPracticeContainer';

const TestPracticePage = () => {
  const { id } = useParams<{ id: string }>();

  return <TestPracticeContainer setId={id ?? ''} />;
};

export default TestPracticePage;
