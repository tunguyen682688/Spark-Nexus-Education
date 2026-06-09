import React from 'react';
import { Button } from '../ui/button';
import { Shuffle } from 'lucide-react';

interface ButtonActionBarProps {
  onShuffle: () => void;
  onEndPractice: () => void;
}

export const ButtonActionBar: React.FC<ButtonActionBarProps> = ({
  onShuffle,
  onEndPractice,
}) => {
  return (
    <div className="mt-8 flex justify-between">
      <Button variant="outline" onClick={onShuffle}>
        <Shuffle className="h-4 w-4 mr-2" /> Shuffle Words
      </Button>

      <Button onClick={onEndPractice}>End Practice</Button>
    </div>
  );
};
