import { Plus, Trash2, LinkIcon } from 'lucide-react';

interface MatchingPair {
  left: string;
  right: string;
}

interface MatchingPairsEditorProps {
  pairs: MatchingPair[];
  onChange: (pairs: MatchingPair[]) => void;
}

export function MatchingPairsEditor({ pairs, onChange }: MatchingPairsEditorProps) {
  const handleAddPair = () => {
    onChange([...pairs, { left: '', right: '' }]);
  };

  const handleRemovePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  const handleUpdatePair = (index: number, field: 'left' | 'right', value: string) => {
    onChange(pairs.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <LinkIcon className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          Matching Pairs
        </h3>
      </div>

      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={pair.left}
              onChange={(e) => handleUpdatePair(index, 'left', e.target.value)}
              placeholder={`Left ${index + 1}`}
              className="flex-1 text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
              <LinkIcon className="w-3 h-3" />
            </div>
            <input
              value={pair.right}
              onChange={(e) => handleUpdatePair(index, 'right', e.target.value)}
              placeholder={`Right ${index + 1}`}
              className="flex-1 text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleRemovePair(index)}
              className="p-1.5 text-muted-foreground hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddPair}
        className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Pair</span>
      </button>
    </div>
  );
}
