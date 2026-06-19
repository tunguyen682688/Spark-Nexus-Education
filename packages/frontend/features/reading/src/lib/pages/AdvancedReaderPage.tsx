import React from 'react';
import { useParams } from 'react-router-dom';
import { AdvancedReaderContainer } from '../container/AdvancedReaderContainer';

export const AdvancedReaderPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();

  if (!articleId) {
    return <div className="p-8 text-center text-red-500 font-bold">Invalid Article ID</div>;
  }

  return <AdvancedReaderContainer articleId={articleId} />;
};

export default AdvancedReaderPage;
