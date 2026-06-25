import React from 'react';
import { useParams } from 'react-router-dom';
import { ContentStudioContainer } from '../container/ContentStudioContainer';

export const ContentStudioPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();

  return <ContentStudioContainer articleId={articleId} />;
};

export default ContentStudioPage;
