import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, Settings } from 'lucide-react';

interface PracticeNavigationProps {
  vocabularyId: string;
  onOpenSettings: () => void;
}

export const PracticeNavigation: React.FC<PracticeNavigationProps> = ({
  vocabularyId,
  onOpenSettings,
}) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/`}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Vocabulary List
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenSettings}>
          <Settings className="h-4 w-4 mr-2" /> Settings
        </Button>
      </div>
    </div>
  );
};
