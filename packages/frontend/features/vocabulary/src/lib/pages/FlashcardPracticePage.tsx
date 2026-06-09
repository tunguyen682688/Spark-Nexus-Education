import { useParams } from 'react-router-dom';
import FlashcardPracticeContainer from '../container/FlashcardPracticeContainer';

const FlashcardPracticePage = () => {
  const { id } = useParams<{ id: string }>();

  return <FlashcardPracticeContainer setId={id ?? ''} />;
};

export default FlashcardPracticePage;
